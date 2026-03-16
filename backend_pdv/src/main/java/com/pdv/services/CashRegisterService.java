package com.pdv.services;

import com.pdv.models.CashRegister;
import com.pdv.models.CashRegisterMovement;
import com.pdv.models.CashRegisterStatus;
import com.pdv.models.CashRegisterSummary;
import com.pdv.models.User;
import com.pdv.repositories.CashRegisterRepository;
import com.pdv.requests.CashRegisterCloseRequest;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class CashRegisterService extends BaseService<CashRegister> {

    private static final BigDecimal ZERO = BigDecimal.ZERO.setScale(2);

    @Autowired
    private CashRegisterRepository cashRegisterRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public CashRegisterService() {
        this.columns = List.of("id", "openingDate", "closingDate", "status", "observation");
    }

    @PostConstruct
    public void initRepository() {
        this.repository = cashRegisterRepository;
    }

    @Override
    @Transactional
    public CashRegister save(CashRegister cashRegister) {
        if (cashRegisterRepository.existsByStatusAndDeletedAtIsNull(CashRegisterStatus.OPEN)) {
            throw new RuntimeException("Ya existe una caja abierta. Debes cerrarla antes de abrir una nueva.");
        }

        if (cashRegister.getOpeningAmount() == null) {
            throw new RuntimeException("El monto de apertura es obligatorio.");
        }

        User currentUser = userInfoService.getCurrentUser();
        cashRegister.setOpeningDate(
                cashRegister.getOpeningDate() != null ? cashRegister.getOpeningDate() : LocalDate.now()
        );
        cashRegister.setStatus(CashRegisterStatus.OPEN);
        cashRegister.setClosingDate(null);
        cashRegister.setClosingAmount(null);
        cashRegister.setDifferenceAmount(null);
        cashRegister.setExpectedAmount(normalize(cashRegister.getOpeningAmount()));
        cashRegister.setCreatedBy(currentUser);

        CashRegister savedCashRegister = cashRegisterRepository.save(cashRegister);
        log("create", savedCashRegister.toString(), null, currentUser);
        return savedCashRegister;
    }

    @Override
    @Transactional
    public CashRegister update(CashRegister cashRegister, Long id) {
        CashRegister currentCashRegister = cashRegisterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Caja no encontrada"));

        if (currentCashRegister.getStatus() == CashRegisterStatus.CLOSED) {
            throw new RuntimeException("No se puede editar una caja cerrada.");
        }

        String oldCashRegister = currentCashRegister.toString();

        currentCashRegister.setOpeningDate(
                cashRegister.getOpeningDate() != null ? cashRegister.getOpeningDate() : currentCashRegister.getOpeningDate()
        );
        currentCashRegister.setOpeningAmount(
                cashRegister.getOpeningAmount() != null ? normalize(cashRegister.getOpeningAmount()) : currentCashRegister.getOpeningAmount()
        );
        currentCashRegister.setObservation(cashRegister.getObservation());
        currentCashRegister.setUpdatedBy(userInfoService.getCurrentUser());

        CashRegisterSummary summary = buildSummary(currentCashRegister, resolveEffectiveClosingDate(currentCashRegister), false);
        currentCashRegister.setExpectedAmount(summary.getExpectedAmount());

        CashRegister updatedCashRegister = cashRegisterRepository.save(currentCashRegister);
        log("update", updatedCashRegister.toString(), oldCashRegister, userInfoService.getCurrentUser());
        return updatedCashRegister;
    }

    @Override
    @Transactional
    public void delete(CashRegister cashRegister) {
        if (cashRegister.getStatus() == CashRegisterStatus.OPEN) {
            throw new RuntimeException("No se puede eliminar una caja abierta.");
        }
        super.delete(cashRegister);
    }

    public Optional<CashRegister> getCurrentOpenRegister() {
        return cashRegisterRepository.findFirstByStatusAndDeletedAtIsNullOrderByOpeningDateDesc(CashRegisterStatus.OPEN);
    }

    @Transactional
    public CashRegister close(Long id, CashRegisterCloseRequest closeRequest) {
        CashRegister cashRegister = cashRegisterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Caja no encontrada"));

        if (cashRegister.getStatus() == CashRegisterStatus.CLOSED) {
            throw new RuntimeException("La caja ya se encuentra cerrada.");
        }

        if (closeRequest.getClosingAmount() == null) {
            throw new RuntimeException("El monto de cierre es obligatorio.");
        }

        LocalDate closingDate = closeRequest.getClosingDate() != null ? closeRequest.getClosingDate() : LocalDate.now();
        if (closingDate.isBefore(cashRegister.getOpeningDate())) {
            throw new RuntimeException("La fecha de cierre no puede ser anterior a la fecha de apertura.");
        }

        CashRegisterSummary summary = buildSummary(cashRegister, closingDate, false);
        BigDecimal expectedAmount = summary.getExpectedAmount();
        BigDecimal closingAmount = normalize(closeRequest.getClosingAmount());
        String oldCashRegister = cashRegister.toString();

        cashRegister.setClosingDate(closingDate);
        cashRegister.setExpectedAmount(expectedAmount);
        cashRegister.setClosingAmount(closingAmount);
        cashRegister.setDifferenceAmount(closingAmount.subtract(expectedAmount));
        cashRegister.setObservation(closeRequest.getObservation());
        cashRegister.setStatus(CashRegisterStatus.CLOSED);
        cashRegister.setUpdatedBy(userInfoService.getCurrentUser());

        CashRegister closedCashRegister = cashRegisterRepository.save(cashRegister);
        log("update", closedCashRegister.toString(), oldCashRegister, userInfoService.getCurrentUser());
        return closedCashRegister;
    }

    public CashRegisterSummary getSummary(Long id) {
        CashRegister cashRegister = cashRegisterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Caja no encontrada"));
        return buildSummary(cashRegister, resolveEffectiveClosingDate(cashRegister), true);
    }

    public List<CashRegisterMovement> getMovements(Long id) {
        CashRegister cashRegister = cashRegisterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Caja no encontrada"));
        return buildMovements(cashRegister, resolveEffectiveClosingDate(cashRegister));
    }

    public ByteArrayInputStream generateSummaryReport(Long id) {
        HashMap<String, Object> parameters = new HashMap<>();
        parameters.put("cashRegisterId", id.intValue());
        return generatePdfReport("reports/cash-registers/summary.jrxml", parameters);
    }

    public ByteArrayInputStream generateMovementsReport(Long id) {
        HashMap<String, Object> parameters = new HashMap<>();
        parameters.put("cashRegisterId", id.intValue());
        return generatePdfReport("reports/cash-registers/movements.jrxml", parameters);
    }

    private CashRegisterSummary buildSummary(CashRegister cashRegister, LocalDate closingDate, boolean preserveStoredValues) {
        BigDecimal openingAmount = normalize(cashRegister.getOpeningAmount());
        BigDecimal salesTotal = sumAmount("""
                SELECT COALESCE(SUM(total), 0)
                FROM products_sales
                WHERE deleted_at IS NULL
                  AND date BETWEEN :fromDate AND :toDate
                """, cashRegister.getOpeningDate(), closingDate);
        BigDecimal purchasesTotal = sumAmount("""
                SELECT COALESCE(SUM(total), 0)
                FROM products_purchases
                WHERE deleted_at IS NULL
                  AND date BETWEEN :fromDate AND :toDate
                """, cashRegister.getOpeningDate(), closingDate);
        BigDecimal cashInflowTotal = sumAmount("""
                SELECT COALESCE(SUM(amount), 0)
                FROM cash_inflows
                WHERE deleted_at IS NULL
                  AND date BETWEEN :fromDate AND :toDate
                """, cashRegister.getOpeningDate(), closingDate);
        BigDecimal cashOutflowTotal = sumAmount("""
                SELECT COALESCE(SUM(amount), 0)
                FROM cash_outflows
                WHERE deleted_at IS NULL
                  AND date BETWEEN :fromDate AND :toDate
                """, cashRegister.getOpeningDate(), closingDate);

        BigDecimal calculatedExpected = openingAmount
                .add(salesTotal)
                .add(cashInflowTotal)
                .subtract(purchasesTotal)
                .subtract(cashOutflowTotal);

        CashRegisterSummary summary = new CashRegisterSummary();
        summary.setCashRegisterId(cashRegister.getId());
        summary.setStatus(cashRegister.getStatus());
        summary.setOpeningDate(cashRegister.getOpeningDate());
        summary.setClosingDate(cashRegister.getStatus() == CashRegisterStatus.CLOSED ? cashRegister.getClosingDate() : closingDate);
        summary.setOpeningAmount(openingAmount);
        summary.setSalesTotal(salesTotal);
        summary.setPurchasesTotal(purchasesTotal);
        summary.setCashInflowTotal(cashInflowTotal);
        summary.setCashOutflowTotal(cashOutflowTotal);
        summary.setExpectedAmount(
                preserveStoredValues && cashRegister.getStatus() == CashRegisterStatus.CLOSED && cashRegister.getExpectedAmount() != null
                        ? normalize(cashRegister.getExpectedAmount())
                        : calculatedExpected
        );
        summary.setClosingAmount(cashRegister.getClosingAmount() != null ? normalize(cashRegister.getClosingAmount()) : null);
        summary.setDifferenceAmount(cashRegister.getDifferenceAmount() != null ? normalize(cashRegister.getDifferenceAmount()) : null);
        summary.setMovementCount(Math.max(buildMovements(cashRegister, closingDate).size() - 1, 0));
        summary.setOpenedBy(cashRegister.getCreatedBy() != null ? cashRegister.getCreatedBy().getUsername() : "");
        summary.setClosedBy(
                cashRegister.getStatus() == CashRegisterStatus.CLOSED && cashRegister.getUpdatedBy() != null
                        ? cashRegister.getUpdatedBy().getUsername()
                        : ""
        );
        summary.setObservation(cashRegister.getObservation());

        return summary;
    }

    private List<CashRegisterMovement> buildMovements(CashRegister cashRegister, LocalDate closingDate) {
        String sql = """
                SELECT movement_date, movement_type, reference_id, reference, party, description, inflow, outflow
                FROM (
                    SELECT
                        cr.opening_date AS movement_date,
                        'APERTURA' AS movement_type,
                        cr.id AS reference_id,
                        CONCAT('Caja #', cr.id) AS reference,
                        COALESCE(u.username, 'Sistema') AS party,
                        COALESCE(cr.observation, 'Apertura de caja') AS description,
                        CAST(cr.opening_amount AS NUMERIC(19,2)) AS inflow,
                        CAST(0 AS NUMERIC(19,2)) AS outflow,
                        0 AS sort_order
                    FROM cash_registers cr
                    LEFT JOIN users u ON u.id = cr.created_by
                    WHERE cr.id = :cashRegisterId

                    UNION ALL

                    SELECT
                        ps.date AS movement_date,
                        'VENTA' AS movement_type,
                        ps.id AS reference_id,
                        COALESCE(ps.invoice_number, CONCAT('Venta #', ps.id)) AS reference,
                        COALESCE(c.name, 'Cliente contado') AS party,
                        'Venta de productos' AS description,
                        CAST(ps.total AS NUMERIC(19,2)) AS inflow,
                        CAST(0 AS NUMERIC(19,2)) AS outflow,
                        1 AS sort_order
                    FROM products_sales ps
                    LEFT JOIN clients c ON c.id = ps.client_id
                    WHERE ps.deleted_at IS NULL
                      AND ps.date BETWEEN :fromDate AND :toDate

                    UNION ALL

                    SELECT
                        pp.date AS movement_date,
                        'COMPRA' AS movement_type,
                        pp.id AS reference_id,
                        COALESCE(pp.invoice_number, CONCAT('Compra #', pp.id)) AS reference,
                        COALESCE(s.name, 'Proveedor') AS party,
                        'Compra de productos' AS description,
                        CAST(0 AS NUMERIC(19,2)) AS inflow,
                        CAST(pp.total AS NUMERIC(19,2)) AS outflow,
                        2 AS sort_order
                    FROM products_purchases pp
                    LEFT JOIN suppliers s ON s.id = pp.supplier_id
                    WHERE pp.deleted_at IS NULL
                      AND pp.date BETWEEN :fromDate AND :toDate

                    UNION ALL

                    SELECT
                        ci.date AS movement_date,
                        'ENTRADA' AS movement_type,
                        ci.id AS reference_id,
                        CONCAT('Entrada #', ci.id) AS reference,
                        'Caja' AS party,
                        COALESCE(ci.description, 'Entrada de efectivo') AS description,
                        CAST(ci.amount AS NUMERIC(19,2)) AS inflow,
                        CAST(0 AS NUMERIC(19,2)) AS outflow,
                        3 AS sort_order
                    FROM cash_inflows ci
                    WHERE ci.deleted_at IS NULL
                      AND ci.date BETWEEN :fromDate AND :toDate

                    UNION ALL

                    SELECT
                        co.date AS movement_date,
                        'SALIDA' AS movement_type,
                        co.id AS reference_id,
                        CONCAT('Salida #', co.id) AS reference,
                        'Caja' AS party,
                        COALESCE(co.description, 'Salida de efectivo') AS description,
                        CAST(0 AS NUMERIC(19,2)) AS inflow,
                        CAST(co.amount AS NUMERIC(19,2)) AS outflow,
                        4 AS sort_order
                    FROM cash_outflows co
                    WHERE co.deleted_at IS NULL
                      AND co.date BETWEEN :fromDate AND :toDate
                ) movements
                ORDER BY movement_date ASC, sort_order ASC, reference_id ASC
                """;

        List<?> resultList = entityManager.createNativeQuery(sql)
                .setParameter("cashRegisterId", cashRegister.getId())
                .setParameter("fromDate", cashRegister.getOpeningDate())
                .setParameter("toDate", closingDate)
                .getResultList();

        List<CashRegisterMovement> movements = new ArrayList<>();
        BigDecimal runningBalance = ZERO;
        for (Object result : resultList) {
            Object[] row = (Object[]) result;
            CashRegisterMovement movement = new CashRegisterMovement();
            movement.setDate(((java.sql.Date) row[0]).toLocalDate());
            movement.setMovementType(String.valueOf(row[1]));
            movement.setReferenceId(row[2] != null ? ((Number) row[2]).longValue() : null);
            movement.setReference(String.valueOf(row[3]));
            movement.setParty(String.valueOf(row[4]));
            movement.setDescription(String.valueOf(row[5]));
            movement.setInflow(normalize(row[6]));
            movement.setOutflow(normalize(row[7]));
            runningBalance = runningBalance.add(movement.getInflow()).subtract(movement.getOutflow());
            movement.setBalance(runningBalance);
            movements.add(movement);
        }

        return movements;
    }

    private BigDecimal sumAmount(String sql, LocalDate fromDate, LocalDate toDate) {
        Object result = entityManager.createNativeQuery(sql)
                .setParameter("fromDate", fromDate)
                .setParameter("toDate", toDate)
                .getSingleResult();
        return normalize(result);
    }

    private LocalDate resolveEffectiveClosingDate(CashRegister cashRegister) {
        return cashRegister.getStatus() == CashRegisterStatus.CLOSED && cashRegister.getClosingDate() != null
                ? cashRegister.getClosingDate()
                : LocalDate.now();
    }

    private BigDecimal normalize(Object value) {
        if (value == null) {
            return ZERO;
        }
        return new BigDecimal(value.toString()).setScale(2, java.math.RoundingMode.HALF_UP);
    }
}
