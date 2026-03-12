package com.pdv.controllers;


import java.io.ByteArrayInputStream;
import java.sql.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;

import com.pdv.auth.CheckPermission;
import com.pdv.models.ProductPurchase;
import com.pdv.services.ProductPurchaseService;

@RestController
@RequestMapping("/api/purchases")
public class ProductPurchaseController extends BaseController<ProductPurchase> {
    
    private ProductPurchaseService purchaseService;

    public ProductPurchaseController(ProductPurchaseService service) {
        super(service);
        this.purchaseService = service;
    }

    @GetMapping("/report")
    @CheckPermission(action = "active")
    public ResponseEntity<InputStreamResource> generateReport(@RequestParam Date desde, @RequestParam Date hasta ) {
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("desde", desde);
        parameters.put("hasta", hasta); 
        ByteArrayInputStream bis = purchaseService.generatePdfReport("reports/purchase/purchases.jasper", parameters);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=report.pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }

}
