package com.pdv.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "products")
@Data
@EqualsAndHashCode(callSuper = false)
public class Product extends Auditable {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = true, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(nullable = true)
    private String description;

    @Column(nullable = true)
    private Integer iva;

    @Column(nullable = true)
    private Double profit;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false, updatable = false, insertable = false)
    private Double stock;

    @Column(nullable = true)
    private Boolean stockControl;
}
