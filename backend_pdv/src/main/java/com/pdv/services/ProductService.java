package com.pdv.services;

import com.pdv.models.Product;
import com.pdv.models.User;
import com.pdv.repositories.ProductRepository;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ProductService extends BaseService<Product> {

    @Autowired
    private ProductRepository productRepository;

    public ProductService() {
        this.repository = productRepository;
        this.columns = List.of("code", "name", "description", "price", "stock", "stockControl" );
        this.relatedEntity = "category";
        this.relatedColumns = List.of("name");
    }
  
    public Page<Product> findByNameOrDescriptionOrCode(String q, Pageable pageable) {
        return this.productRepository.findByNameOrDescriptionOrCode(q, pageable);
    }
    
    public Optional<Product> findByCode(String code) {
        return this.productRepository.findByCode(code);
    }

    @Override
    public Product update(Product updatedProduct, Long id) {

        User user = userInfoService.getCurrentUser();

        Product product = this.productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        String oldProduct = product.toString();

        product.setCode(updatedProduct.getCode());
        product.setName(updatedProduct.getName());
        product.setDescription(updatedProduct.getDescription());
        product.setPrice(updatedProduct.getPrice());
        product.setStockControl(updatedProduct.getStockControl());
        product.setUpdatedBy(user);

        Product productDB = this.productRepository.save(product);

        String newProduct = product.toString();

        this.log("update", newProduct, oldProduct, user);

        return productDB;
    }

}
