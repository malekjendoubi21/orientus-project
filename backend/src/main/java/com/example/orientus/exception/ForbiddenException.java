package com.example.orientus.exception;

/**
 * Levée quand l'utilisateur authentifié n'a pas le droit d'effectuer l'action.
 * Mappée sur HTTP 403 Forbidden dans GlobalExceptionHandler.
 *
 * Exemples : ADMIN qui tente une action réservée à l'OWNER,
 *            étudiant qui accède à la candidature d'un autre.
 */
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}
