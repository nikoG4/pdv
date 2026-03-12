package com.pdv.config;

import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {

    // Manejo de token expirado
    @ExceptionHandler(ExpiredJwtException.class)
    public ResponseEntity<String> handleExpiredJwtException(ExpiredJwtException ex, WebRequest request) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body("El token ha expirado. Por favor, inicie sesión nuevamente.");
    }

    // Manejo de token malformado
    @ExceptionHandler(MalformedJwtException.class)
    public ResponseEntity<String> handleMalformedJwtException(MalformedJwtException ex, WebRequest request) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body("El formato del token es inválido.");
    }

    // Manejo de firma inválida
    @ExceptionHandler(SignatureException.class)
    public ResponseEntity<String> handleSignatureException(SignatureException ex, WebRequest request) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body("La firma del token no es válida.");
    }

    // Manejo de acceso denegado
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<String> handleAccessDeniedException(AccessDeniedException ex, WebRequest request) {
        log.error("Acceso denegado: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body("Acceso denegado");
    }

    // Manejo de violaciones de integridad de datos (como el stock negativo)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<String> handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        String errorMessage = ex.getRootCause() != null ? ex.getRootCause().getMessage() : "Error de integridad de datos";
        
        if (errorMessage.contains("Stock negativo")) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("No se puede actualizar el stock: " + errorMessage);
        }

        if (errorMessage.contains("llave duplicada")) {
            if (errorMessage.contains("Ya existe la llave (code)")) { 
                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body("El código de producto ya existe. Por favor, use uno diferente.");
            }
            // Agrega más condiciones si tienes otras restricciones únicas
        }
        
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body("Error de integridad de datos: " + errorMessage);
    }

    // Manejo genérico para cualquier excepción de acceso a datos
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<String> handleDataAccessException(DataAccessException ex) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error de base de datos: " + ex.getMessage());
    }

    // Manejo genérico para excepciones no previstas
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGlobalException(Exception ex, WebRequest request) {

        log.error("Ha ocurrido un error inesperado: {}", ex.getMessage(), ex);

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Ha ocurrido un error inesperado. Por favor, contacte con soporte técnico. ");
    }
}
