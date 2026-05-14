package com.example.orientus.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.List;
import java.util.Map;

/**
 * Gestionnaire global des exceptions — codes HTTP sémantiques :
 *
 *  404  ResourceNotFoundException  → ressource introuvable (user, programme, candidature…)
 *  403  ForbiddenException         → action interdite pour ce rôle ou cet utilisateur
 *  409  ConflictException          → conflit d'état (email déjà pris, déjà candidaté…)
 *  422  MethodArgumentNotValidException → données du formulaire invalides
 *  400  RuntimeException           → erreur métier générique (code expiré, mauvais code…)
 *  500  Exception                  → erreur inattendue côté serveur
 *
 * Ordre des @ExceptionHandler : du plus spécifique au plus générique.
 */
@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /** 404 — Ressource demandée introuvable */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
            "error", true,
            "message", ex.getMessage()
        ));
    }

    /** 403 — Action refusée (rôle insuffisant ou ressource appartenant à quelqu'un d'autre) */
    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<Map<String, Object>> handleForbidden(ForbiddenException ex) {
        log.warn("Forbidden: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
            "error", true,
            "message", ex.getMessage()
        ));
    }

    /** 409 — Conflit : email déjà existant, candidature déjà soumise, etc. */
    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<Map<String, Object>> handleConflict(ConflictException ex) {
        log.warn("Conflict: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
            "error", true,
            "message", ex.getMessage()
        ));
    }

    /** 422 — Données de formulaire invalides (annotations @Valid) */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .toList();
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(Map.of(
            "error", true,
            "message", "Validation failed",
            "errors", errors
        ));
    }

    /** 400 — Erreur métier générique (code expiré, mot de passe incorrect, etc.) */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntime(RuntimeException ex) {
        log.warn("Bad request: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(Map.of(
            "error", true,
            "message", ex.getMessage()
        ));
    }

    /** 500 — Erreur interne inattendue */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(Exception ex) {
        log.error("Unexpected server error", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
            "error", true,
            "message", "An unexpected error occurred"
        ));
    }
}

