package com.pdv.controllers;

import com.pdv.auth.CheckPermission;
import com.pdv.models.Product;
import com.pdv.services.ProductService;

import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
public class ProductController extends BaseController<Product> {

    
    private ProductService productService;

    public ProductController(ProductService productService) {
        super(productService);

        this.productService = productService;
    }

    

    @GetMapping("/search")
    @CheckPermission(action = "active") 
    public Page<Product> searchByNameOrDescriptionOrCode(
        @RequestParam(defaultValue = "", required = false) String q,
        @RequestParam(defaultValue = "0", required = false) int page,
        @RequestParam(defaultValue = "10", required = false) int size,
        @RequestParam(defaultValue = "id", required = false) String sort,
        @RequestParam(defaultValue = "ASC", required = false) String direction
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.valueOf(direction), sort));
        return productService.findByNameOrDescriptionOrCode(q, pageable);
    }

    @GetMapping("/code")
    @CheckPermission(action = "active")
    public Optional<Product> searchByNameOrDescriptionOrCode(
        @RequestParam(required = true) String code
    ) {
        return productService.findByCode(code);
    }


    @GetMapping("/report")
    @CheckPermission(action = "active")
    public ResponseEntity<InputStreamResource> generateReport(@RequestParam HashMap<String, Object> parameters) {
        
        String report = parameters.get("report").toString();
        parameters.remove("report");

        ByteArrayInputStream bis = productService.generatePdfReport("reports/products/"+report+".jasper", parameters);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=report.pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }
}
