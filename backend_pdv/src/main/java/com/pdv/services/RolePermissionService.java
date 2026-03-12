package com.pdv.services;


import com.pdv.models.RolePermission;
import com.pdv.repositories.RolePermissionRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RolePermissionService {

    @Autowired
    private RolePermissionRepository rolePermissionRepository;

    public List<RolePermission> findAll() {
        return rolePermissionRepository.findAll();
    }

    public Optional<RolePermission> findById(Long id) {
        return rolePermissionRepository.findById(id);
    }

    public RolePermission save(RolePermission rolePermission) {
        return rolePermissionRepository.save(rolePermission);
    }

    public void deleteById(Long id) {
        rolePermissionRepository.deleteById(id);
    }
}
