package com.pdv.controllers;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.pdv.models.Category;
import com.pdv.services.CategoryService;

@RestController
@RequestMapping("/api/categories")
@Validated
public class CategoryController extends BaseController<Category> {

    public CategoryController(CategoryService service) {
        super(service);
    }

}
