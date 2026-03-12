package com.pdv.controllers;

import java.util.List;

import org.hibernate.Hibernate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.pdv.auth.CheckPermission;
import com.pdv.models.Permission;
import com.pdv.models.Role;
import com.pdv.services.RoleService;



@RestController
@RequestMapping("/api/roles")
@Validated
public class RoleController extends BaseController<Role> {

    private RoleService roleService;

    public RoleController(RoleService roleService) {
        super(roleService);
        this.roleService = roleService;
    }


    @GetMapping("/active")
    @CheckPermission(action = "active")
    public Page<Role> getActiveRoles(
        @RequestParam(defaultValue = "0", required = false) int page,
        @RequestParam(defaultValue = "10", required = false) int size,
        @RequestParam(defaultValue = "id", required = false) String sort,
        @RequestParam(defaultValue = "ASC", required = false) String direction,
        @RequestParam(required = false) String q
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.valueOf(direction), sort));
        Page<Role> roles = q != null && q.length() > 0 ? roleService.search(q, pageable) : roleService.findActive(pageable);

        roles.forEach(role -> {
            Hibernate.initialize(role.getPermissions());
        });

        return roles;
    }


    //Listar todos los permisos
    @GetMapping("/permissions")
    @CheckPermission(action = "update")
    public List<Permission> getAllPermissions() {
        return roleService.findAllPermissions();
    }
}
