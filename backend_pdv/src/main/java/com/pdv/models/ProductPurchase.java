package com.pdv.models;


import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "products_purchases")
@Data
@EqualsAndHashCode(callSuper = false)
public class ProductPurchase extends Auditable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date")
    private LocalDate date;

    @Column(name = "invoice_number")
    private String invoiceNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Column(name = "total", nullable = false)
    private Double total;

    @OneToMany(mappedBy = "purchase", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<ProductPurchaseItem> items;

    @PrePersist
    @PreUpdate
    public void prePersist() {
        this.total = this.items.stream().mapToDouble(ProductPurchaseItem::getSubtotal).sum();
        this.items.forEach( item -> item.setPurchase(this));
    }

}
