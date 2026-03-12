package com.pdv.models;

import java.util.Set;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "roles")
@Data
@EqualsAndHashCode(callSuper = false)
public class Role extends Auditable{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @ManyToMany(fetch = FetchType.LAZY)
    // @JsonIgnore
    @JoinTable(
        name = "role_permissions", 
        joinColumns = @JoinColumn(  name = "role_id", referencedColumnName = "id"), 
        inverseJoinColumns = @JoinColumn(  name = "permission_id", referencedColumnName = "id")
    )
    private Set<Permission> permissions;


}
