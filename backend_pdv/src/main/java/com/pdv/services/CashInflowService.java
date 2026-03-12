package com.pdv.services;

import java.io.ByteArrayInputStream;
import java.util.HashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pdv.models.CashInflow;
import com.pdv.repositories.CashInflowRepository;

@Service
public class CashInflowService extends BaseService<CashInflow> {

    @Autowired
    private CashInflowRepository cashInflowRepository;

    public CashInflowService() {
        this.repository = cashInflowRepository;
        this.columns = List.of("id", "description", "amount", "observation");
    }

    public ByteArrayInputStream getReport(HashMap<String, Object> parameters) {
        return generatePdfReport("reports/cash-inflows/cash-inflows.jasper", parameters);
    }

    @Override
    public CashInflow update(CashInflow cashInflow, Long id) {
        CashInflow currentCashInflow = cashInflowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("CashInflow not found"));
        currentCashInflow.setDescription(cashInflow.getDescription());
        currentCashInflow.setAmount(cashInflow.getAmount());
        currentCashInflow.setDate(cashInflow.getDate());
        currentCashInflow.setObservation(cashInflow.getObservation());
        currentCashInflow.setUpdatedBy(userInfoService.getCurrentUser());
        return cashInflowRepository.save(currentCashInflow);
    }

}
