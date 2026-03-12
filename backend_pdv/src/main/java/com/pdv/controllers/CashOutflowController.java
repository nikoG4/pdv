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
import com.pdv.models.CashOutflow;
import com.pdv.services.CashOutflowService;

@RestController
@RequestMapping("/api/cash-outflows")
@Validated
public class CashOutflowController extends BaseController<CashOutflow> {

    private CashOutflowService cashOutflowService;

    public CashOutflowController(CashOutflowService service) {
        super(service);
        this.cashOutflowService = service;
    }

    @GetMapping("/report")
    @CheckPermission(action = "active")
    public ResponseEntity<InputStreamResource> generateReport(@RequestParam HashMap<String, Object> parameters) {

        String report = parameters.get("report").toString();
        parameters.remove("report");

        ByteArrayInputStream bis = cashOutflowService.getReport(parameters);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=report.pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }

}
