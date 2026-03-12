package com.pdv.auth;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

import com.pdv.controllers.BaseController;

import org.springframework.security.access.AccessDeniedException;

@Aspect
@Component
public class PermissionAspect {

    private final PermissionAuthService permissionAuthService;

    public PermissionAspect(PermissionAuthService permissionAuthService) {
        this.permissionAuthService = permissionAuthService;
    }

    @Before("@annotation(checkPermission)")
    public void check(JoinPoint joinPoint, CheckPermission checkPermission) {

        Object target = joinPoint.getTarget(); // controller real
        String action = checkPermission.action();

        if (!(target instanceof BaseController<?> base)) {
            throw new AccessDeniedException("Invalid controller for permission check");
        }

        boolean allowed = permissionAuthService.hasEntityPermission(base.getEntityName(), action);

        if (!allowed) {
            throw new AccessDeniedException("You do not have permission: " + base.getEntityName() + "." + action);
        }
    }
}