package com.example.orientus.exception;

/**
 * Levée quand une action viole une contrainte d'unicité ou une règle métier d'état.
 * Mappée sur HTTP 409 Conflict dans GlobalExceptionHandler.
 *
 * Exemples : email déjà utilisé, candidature déjà soumise pour ce programme.
 */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
