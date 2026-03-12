package com.pdv.controllers;



import java.io.ByteArrayInputStream;
import java.util.HashMap;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pdv.auth.CheckPermission;
import com.pdv.models.ProductSale;
import com.pdv.services.ProductSaleService;

import jakarta.validation.constraints.Positive;

@RestController
@RequestMapping("/api/sales")
public class ProductSaleController extends BaseController<ProductSale> {

     private ProductSaleService saleService;

    protected ProductSaleController(ProductSaleService service) {
        super(service);
        this.saleService = service;
    }

    @GetMapping("/report")
    @CheckPermission(action = "active")
    public ResponseEntity<InputStreamResource> generateReport(@RequestParam HashMap<String, Object> parameters) {
        
        String report = parameters.get("report").toString();
        parameters.remove("report");

        ByteArrayInputStream bis = saleService.generatePdfReport("reports/sale/"+report+".jasper", parameters);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=report.pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }

    
    @GetMapping("/print/{id}")
    @CheckPermission(action = "active")
    public ResponseEntity<Object> print(@PathVariable @Positive Long id) {
        return saleService.findById(id)
        .map(product -> {
            saleService.printSale(product);
            return ResponseEntity.noContent().build();
        })
        .orElse(ResponseEntity.notFound().build());
    }
}
