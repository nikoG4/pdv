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

        Object target = joinPoint.getTarget();
        String entity = resolveEntityName(target, checkPermission);
        String action = checkPermission.action();

        boolean allowed = permissionAuthService.hasEntityPermission(entity, action);

        if (!allowed) {
            throw new AccessDeniedException("You do not have permission: " + entity + "." + action);
        }
    }

    private String resolveEntityName(Object target, CheckPermission checkPermission) {
        if (checkPermission.entity() != null && !checkPermission.entity().isBlank()) {
            return checkPermission.entity();
        }

        if (target instanceof BaseController<?> base) {
            return base.getEntityName();
        }

        String className = target.getClass().getSimpleName();
        if (className.endsWith("Controller")) {
            return className.substring(0, className.length() - "Controller".length());
        }

        throw new AccessDeniedException("Invalid controller for permission check");
    }
}
