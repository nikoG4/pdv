package com.pdv.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "categories")
@EqualsAndHashCode(callSuper = true)
@Data
public class Category extends Auditable{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = true)
    private String description;
    
    @Override
    public String toString() {
        return "Category [id=" + id + ", name=" + name + ", description=" + description + "]";
    }
}
