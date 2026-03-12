package com.pdv.controllers;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.pdv.models.Supplier;
import com.pdv.services.SupplierService;

@RestController
@RequestMapping("/api/suppliers")
@Validated
public class SupplierController extends BaseController <Supplier>{

   public SupplierController(SupplierService supplierService) {
        super(supplierService);
    }


}
