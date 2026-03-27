package com.pdv.controllers;

import com.pdv.auth.CheckPermission;
import com.pdv.models.CashRegister;
import com.pdv.models.CashRegisterMovement;
import com.pdv.models.CashRegisterSummary;
import com.pdv.requests.CashRegisterCloseRequest;
import com.pdv.services.CashRegisterService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.util.List;

@RestController
@RequestMapping("/api/cash-registers")
@Validated
public class CashRegisterController extends BaseController<CashRegister> {

    private final CashRegisterService cashRegisterService;

    public CashRegisterController(CashRegisterService service) {
        super(service);
        this.cashRegisterService = service;
    }

    @GetMapping("/current")
    @CheckPermission(action = "read")
    public ResponseEntity<CashRegister> getCurrentOpenRegister() {
        return cashRegisterService.getCurrentOpenRegister()
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @GetMapping("/{id}/summary")
    @CheckPermission(action = "read")
    public ResponseEntity<CashRegisterSummary> getSummary(@PathVariable(name = "id") Long id) {
        return ResponseEntity.ok(cashRegisterService.getSummary(id));
    }

    @GetMapping("/{id}/movements")
    @CheckPermission(action = "read")
    public ResponseEntity<List<CashRegisterMovement>> getMovements(@PathVariable(name = "id") Long id) {
        return ResponseEntity.ok(cashRegisterService.getMovements(id));
    }

    @PostMapping("/{id}/close")
    @CheckPermission(action = "update")
    public ResponseEntity<CashRegister> close(@PathVariable(name = "id") Long id, @RequestBody CashRegisterCloseRequest closeRequest) {
        return ResponseEntity.ok(cashRegisterService.close(id, closeRequest));
    }

    @GetMapping("/{id}/report-summary")
    @CheckPermission(action = "read")
    public ResponseEntity<InputStreamResource> generateSummaryReport(@PathVariable(name = "id") Long id) {
        ByteArrayInputStream bis = cashRegisterService.generateSummaryReport(id);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=cash-register-summary.pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }

    @GetMapping("/{id}/report-movements")
    @CheckPermission(action = "read")
    public ResponseEntity<InputStreamResource> generateMovementsReport(@PathVariable(name = "id") Long id) {
        ByteArrayInputStream bis = cashRegisterService.generateMovementsReport(id);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=cash-register-movements.pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }
}
