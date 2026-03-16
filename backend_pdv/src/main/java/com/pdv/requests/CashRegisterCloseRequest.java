package com.pdv.requests;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.Data;

@Data
public class CashRegisterCloseRequest {
    private LocalDate closingDate;
    private BigDecimal closingAmount;
    private String observation;
}
