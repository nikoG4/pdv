package com.pdv.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "permissions")
@Data
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = true)
    private String description;

    @Column(nullable = true)
    private String module;

}

