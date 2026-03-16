package com.pdv.models;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.Data;

@Data
public class CashRegisterMovement {
    private LocalDate date;
    private String movementType;
    private Long referenceId;
    private String reference;
    private String party;
    private String description;
    private BigDecimal inflow;
    private BigDecimal outflow;
    private BigDecimal balance;
}
