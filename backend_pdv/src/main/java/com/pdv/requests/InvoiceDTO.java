package com.pdv.requests;

import java.time.LocalDate;
import java.util.List;
import lombok.Data;

@Data
public class InvoiceDTO {
    private String invoiceNumber;
    private LocalDate date;
    private String supplierName;
    private Double total;
    private List<InvoiceItemDTO> items;
}
