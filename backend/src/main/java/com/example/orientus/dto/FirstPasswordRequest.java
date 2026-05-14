package com.example.orientus.dto;

import lombok.Data;

/**
 * DTO pour le changement de mot de passe à la première connexion.
 * Utilisé par POST /api/users/first-password.
 */
@Data
public class FirstPasswordRequest {
    private String newPassword;
}
