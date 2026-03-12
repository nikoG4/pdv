package com.pdv.controllers;

import java.io.ByteArrayInputStream;
import java.util.HashMap;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.pdv.auth.CheckPermission;
import com.pdv.models.CashInflow;
import com.pdv.services.CashInflowService;

@RestController
@RequestMapping("/api/cash-inflows")
@Validated
public class CashInflowController extends BaseController<CashInflow> {

    private CashInflowService cashInflowService;

    public CashInflowController(CashInflowService service) {
        super(service);
        this.cashInflowService = service;
    }

    @GetMapping("/report")
    @CheckPermission(action = "active")
    public ResponseEntity<InputStreamResource> generateReport(@RequestParam HashMap<String, Object> parameters) {

        String report = parameters.get("report").toString();
        parameters.remove("report");

        ByteArrayInputStream bis = cashInflowService.getReport(parameters);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=report.pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }

}
