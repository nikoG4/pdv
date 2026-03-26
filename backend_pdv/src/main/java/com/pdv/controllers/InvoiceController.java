package com.pdv.controllers;

import com.pdv.requests.InvoiceDTO;
import com.pdv.services.InvoiceAIParserService;
import com.pdv.services.ProductPurchaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.validation.annotation.Validated;

@RestController
@RequestMapping("/api/invoices")
@Validated
public class InvoiceController {

    @Autowired
    private InvoiceAIParserService aiParserService;

    @Autowired
    private ProductPurchaseService purchaseService;

    @PostMapping("/parse")
    public InvoiceDTO parse(@RequestParam("file") MultipartFile file) {
        return aiParserService.parse(file);
    }

    @PostMapping("/confirm-purchase")
    public void confirmPurchase(@RequestBody InvoiceDTO dto, @RequestParam(value = "supplierId", required = false) Long supplierId) {
        purchaseService.confirmInvoice(dto, supplierId);
    }

    @PostMapping("/confirm-products")
    public void confirmProducts(@RequestBody InvoiceDTO dto) {
        purchaseService.confirmProducts(dto);
    }
}
