package com.pdv.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "suppliers")
@EqualsAndHashCode(callSuper = true)
@Data
public class Supplier extends Auditable{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = true)
    private String contactName;

    @Column(nullable = true)
    private String email;

    @Column(nullable = true)
    private String phone;

    @Column(nullable = true)
    private String address;

}