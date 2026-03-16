package com.pdv.services;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;


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
    public Role save(Role role) {
        Role roleToSave = new Role();
        roleToSave.setName(role.getName());
        roleToSave.setPermissions(resolvePermissions(role.getPermissions()));

        return super.save(roleToSave);
    }

  
    @Override
    public Role update(Role role, Long id) {

        Role currentRole = repository.findById(id).orElseThrow(() -> new RuntimeException("Role not found"));

        String oldRole = currentRole.toString();

        currentRole.setName(role.getName());
        currentRole.setPermissions(role.getPermissions() == null ? currentRole.getPermissions() : resolvePermissions(role.getPermissions()));
        currentRole.setUpdatedBy(userInfoService.getCurrentUser());

        Role updatedRole = repository.save(currentRole);

        String newRole = updatedRole.toString();

        log("update", newRole, oldRole, userInfoService.getCurrentUser());

        return updatedRole;
    }


    public List<Permission> findAllPermissions() {
        return permissionRepository.findAll();
    }

    private Set<Permission> resolvePermissions(Set<Permission> permissions) {
        Set<Long> permissionIds = permissions == null
            ? Set.of()
            : permissions.stream()
                .map(Permission::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        List<Permission> resolvedPermissions = permissionRepository.findAllById(permissionIds);

        if (resolvedPermissions.size() != permissionIds.size()) {
            throw new RuntimeException("One or more permissions were not found");
        }

        return resolvedPermissions.stream().collect(Collectors.toSet());
    }



}
