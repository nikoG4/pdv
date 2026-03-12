package com.pdv.services;



import java.util.List;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.pdv.models.Permission;
import com.pdv.models.Role;
import com.pdv.repositories.PermissionRepository;
import com.pdv.repositories.RoleRepository;

@Service
public class RoleService extends BaseService<Role> {

    @Autowired
    private RoleRepository roleRepository;


    @Autowired
    PermissionRepository permissionRepository;

    public RoleService() {
        this.repository = roleRepository;
        this.columns = List.of("name");
    }

    @Override
    public Page<Role> findActive(Pageable pageable) {
        return roleRepository.findAllRolesWithPermissions(pageable);
    }

  
    @Override
    public Role update(Role role, Long id) {

        Role currentRole = repository.findById(id).orElseThrow(() -> new RuntimeException("Role not found"));

        String oldRole = currentRole.toString();

        currentRole.setName(role.getName());
        currentRole.setPermissions(role.getPermissions());
        currentRole.setUpdatedBy(userInfoService.getCurrentUser());

        Role updatedRole = repository.save(currentRole);

        String newRole = updatedRole.toString();

        log("update", newRole, oldRole, userInfoService.getCurrentUser());

        return updatedRole;
    }


    public List<Permission> findAllPermissions() {
        return permissionRepository.findAll();
    }



}
