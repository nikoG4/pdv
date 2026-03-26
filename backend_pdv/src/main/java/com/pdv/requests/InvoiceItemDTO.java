package com.pdv.requests;

import lombok.Data;

@Data
public class InvoiceItemDTO {
    private String description;
    private Double quantity;
    private Double price;
    private Double subtotal;
    private String categoryName;
    private Long productId;
    private Long categoryId;
    private Double confidence;
    private Boolean isNewProduct;
    private Boolean isNewCategory;
}
