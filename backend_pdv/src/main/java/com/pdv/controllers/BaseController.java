package com.pdv.controllers;

import java.util.List;

import org.springframework.core.GenericTypeResolver;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import com.pdv.auth.CheckPermission;
import com.pdv.services.BaseService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;

public abstract class BaseController<T> {

    protected final String entityName;
    protected BaseService<T> service;

    @SuppressWarnings("unchecked")
    protected BaseController(BaseService<T> service) {
        this.service = service;

        Class<T> clazz = (Class<T>) GenericTypeResolver.resolveTypeArgument(getClass(), BaseController.class);
        this.entityName = clazz != null ? clazz.getSimpleName() : "Unknown";
    }
    
    public String getEntityName() {
        return entityName;
    }

    @GetMapping
    @CheckPermission(action = "active")
    public Page<T> getActive(
            @RequestParam(defaultValue = "0", required = false) int page,
            @RequestParam(defaultValue = "10", required = false) int size,
            @RequestParam(defaultValue = "id", required = false) String sort,
            @RequestParam(defaultValue = "ASC", required = false) String direction,
            @RequestParam(required = false) String q) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.valueOf(direction), sort));

        if (q != null && q.length() > 0) {
            return service.search(q, pageable);
        }

        return service.findActive(pageable);

    }


    @GetMapping("/all")
    @CheckPermission(action = "all")
    public Page<T> getAll(
        @RequestParam(defaultValue = "0", required = false) int page,
        @RequestParam(defaultValue = "10", required = false) int size,
        @RequestParam(defaultValue = "id", required = false) String sort,
        @RequestParam(defaultValue = "ASC", required = false) String direction
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.valueOf(direction), sort));
        return service.findAll(pageable);
    }

    @GetMapping("/unpaged")
    @CheckPermission(action = "active")
    public List<T> getAllUnpaged() {
        return service.findAll();
    }


    @PostMapping
    @CheckPermission(action = "create")
    public ResponseEntity<T> create(@RequestBody T t) {        
        T tSaved = service.save(t);
        return ResponseEntity.status(HttpStatus.CREATED).body(tSaved);
    }



    @GetMapping("/{id}")
    @CheckPermission(action = "read")
    public ResponseEntity<T> getById(@PathVariable @Positive Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    

    @PutMapping("/{id}")
    @CheckPermission(action = "update")
    public ResponseEntity<T> update(@PathVariable @Positive Long id, @Valid @RequestBody T t) {

        return ResponseEntity.ok(service.update(t, id));
    
    }
    

    @DeleteMapping("/{id}")
    @CheckPermission(action = "delete")
    public ResponseEntity<Object> delete(@PathVariable @Positive Long id) {
        return service.findById(id)
                .map(product -> {
                    service.delete(product);
                    return ResponseEntity.noContent().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

}