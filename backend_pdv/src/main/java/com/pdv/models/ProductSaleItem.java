package com.pdv.models;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

@Entity
@Table(name = "sale_items")
@Data
public class ProductSaleItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY )
    @JsonIgnore
    @ToString.Exclude
    @JoinColumn(name = "sale_id", nullable = false)
    private ProductSale sale; 

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false) 
    private Product product;

    @Column(nullable = false)
    private Double quantity;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private Double subtotal;

    @PrePersist
    @PreUpdate
    public void setSubtotal() {
        this.subtotal = this.quantity * this.price;
    }
}
