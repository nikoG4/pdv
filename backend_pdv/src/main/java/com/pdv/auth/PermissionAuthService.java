package com.pdv.auth;

import org.springframework.stereotype.Component;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Servicio encargado de validar si el usuario autenticado
 * tiene permisos sobre una entidad específica y una acción concreta.
 */
@Component
public class PermissionAuthService {

    /**
     * Verifica si el usuario actual tiene permiso para ejecutar
     * una acción sobre una entidad.
     *
     * @param entity Nombre de la entidad (ej: "Client", "Category")
     * @param action Acción que se quiere validar (ej: "active", "create")
     * @return true si tiene permiso, false si no
     */
    public boolean hasEntityPermission(String entity, String action) {
        // Construye la autoridad esperada: ej. "Category.active"
        String authority = entity + "." + action;

        // Obtiene la autenticación actual
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Validación básica: si no hay auth o no hay authorities, no tiene permiso
        if (auth == null || auth.getAuthorities() == null) {
            return false;
        }

        // Comprueba si alguna autoridad coincide con la esperada
        return auth.getAuthorities()
                   .stream()
                   .anyMatch(a -> a.getAuthority().equals(authority));
    }
}