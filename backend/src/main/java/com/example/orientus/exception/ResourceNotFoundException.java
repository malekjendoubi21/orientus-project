package com.example.orientus.exception;

/**
 * Levée quand une ressource demandée n'existe pas en base.
 * Mappée sur HTTP 404 Not Found dans GlobalExceptionHandler.
 *
 * Exemples : utilisateur introuvable, programme inexistant, candidature inconnue.
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
