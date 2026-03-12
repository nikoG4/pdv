package com.pdv.models;

import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "products_sales")
@Data
@EqualsAndHashCode(callSuper = false)
public class ProductSale extends Auditable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date")
    private LocalDate date;

    @Column(name = "invoice_number")
    private String invoiceNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @Column(name = "total", nullable = false)
    private Double total;

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<ProductSaleItem> items;
    
    @PrePersist
    @PreUpdate
    public void beforeSave() {
        this.total = this.items.stream().mapToDouble(ProductSaleItem::getSubtotal).sum();
        this.items.forEach( item -> item.setSale(this));

        System.out.println(this);
    }
    
}
