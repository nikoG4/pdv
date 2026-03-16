package com.pdv.models;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.Data;

@Data
public class CashRegisterSummary {
    private Long cashRegisterId;
    private CashRegisterStatus status;
    private LocalDate openingDate;
    private LocalDate closingDate;
    private BigDecimal openingAmount;
    private BigDecimal salesTotal;
    private BigDecimal purchasesTotal;
    private BigDecimal cashInflowTotal;
    private BigDecimal cashOutflowTotal;
    private BigDecimal expectedAmount;
    private BigDecimal closingAmount;
    private BigDecimal differenceAmount;
    private Integer movementCount;
    private String openedBy;
    private String closedBy;
    private String observation;
}
