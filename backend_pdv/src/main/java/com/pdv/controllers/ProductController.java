package com.pdv.controllers;

import com.pdv.auth.CheckPermission;
import com.pdv.models.Category;
import com.pdv.models.Product;
import com.pdv.repositories.CategoryRepository;
import com.pdv.services.FileStorageService;
import com.pdv.services.ProductService;

import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
@Validated
public class ProductController extends BaseController<Product> {

    private final ProductService productService;
    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;

    public ProductController(
        ProductService productService,
        CategoryRepository categoryRepository,
        FileStorageService fileStorageService
    ) {
        super(productService);
        this.productService = productService;
        this.categoryRepository = categoryRepository;
        this.fileStorageService = fileStorageService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @CheckPermission(action = "create")
    public ResponseEntity<Product> createProduct(
        @RequestParam(required = false) String code,
        @RequestParam String name,
        @RequestParam(required = false) String description,
        @RequestParam Long categoryId,
        @RequestParam Double price,
        @RequestParam(required = false) Integer iva,
        @RequestParam(required = false, defaultValue = "false") Boolean stockControl,
        @RequestParam(required = false) MultipartFile image
    ) throws IOException {
        Product product = buildProduct(code, name, description, categoryId, price, iva, stockControl);
        if (image != null && !image.isEmpty()) {
            String imageFileName = fileStorageService.saveFile(image);
            product.setImage("/files/" + imageFileName);
        }
        return ResponseEntity.ok(productService.save(product));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @CheckPermission(action = "update")
    public ResponseEntity<Product> updateProduct(
        @PathVariable Long id,
        @RequestParam(required = false) String code,
        @RequestParam String name,
        @RequestParam(required = false) String description,
        @RequestParam Long categoryId,
        @RequestParam Double price,
        @RequestParam(required = false) Integer iva,
        @RequestParam(required = false, defaultValue = "false") Boolean stockControl,
        @RequestParam(required = false, defaultValue = "false") Boolean removeImage,
        @RequestParam(required = false) MultipartFile image
    ) throws IOException {
        Product current = productService.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found"));

        Product product = buildProduct(code, name, description, categoryId, price, iva, stockControl);
        product.setId(id);
        product.setImage(current.getImage());

        if (Boolean.TRUE.equals(removeImage) && current.getImage() != null && current.getImage().startsWith("/files/")) {
            fileStorageService.deleteFile(current.getImage().replace("/files/", ""));
            product.setImage(null);
        } else if (Boolean.TRUE.equals(removeImage)) {
            product.setImage(null);
        }

        if (image != null && !image.isEmpty()) {
            if (current.getImage() != null && current.getImage().startsWith("/files/")) {
                fileStorageService.deleteFile(current.getImage().replace("/files/", ""));
            }
            String imageFileName = fileStorageService.saveFile(image);
            product.setImage("/files/" + imageFileName);
        }

        return ResponseEntity.ok(productService.update(product, id));
    }

    private Product buildProduct(
        String code,
        String name,
        String description,
        Long categoryId,
        Double price,
        Integer iva,
        Boolean stockControl
    ) {
        Category category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new RuntimeException("Category not found"));

        Product product = new Product();
        product.setCode(code);
        product.setName(name);
        product.setDescription(description);
        product.setCategory(category);
        product.setPrice(price);
        product.setIva(iva);
        product.setStockControl(stockControl);
        return product;
    }

    @GetMapping("/search")
    @CheckPermission(action = "active") 
    public Page<Product> searchByNameOrDescriptionOrCode(
        @RequestParam(defaultValue = "", required = false) String q,
        @RequestParam(defaultValue = "0", required = false) int page,
        @RequestParam(defaultValue = "10", required = false) int size,
        @RequestParam(defaultValue = "default", required = false) String criteria,
        @RequestParam(defaultValue = "id", required = false) String sort,
        @RequestParam(defaultValue = "ASC", required = false) String direction
    ) {
        if ("ranked".equalsIgnoreCase(criteria)) {
            Pageable pageable = PageRequest.of(page, size);
            return productService.findRankedProducts(q, pageable);
        }
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
