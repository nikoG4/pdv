package com.pdv.models;


import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

@Entity
@Table(name = "purchase_items")
@Data
public class ProductPurchaseItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    @ToString.Exclude
    @JoinColumn(name = "purchase_id")
    private ProductPurchase purchase;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id")
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
