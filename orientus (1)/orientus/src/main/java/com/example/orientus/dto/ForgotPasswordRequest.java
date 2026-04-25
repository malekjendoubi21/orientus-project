package com.example.orientus.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO pour la demande de réinitialisation de mot de passe
 * Contient uniquement l'email de l'utilisateur
 */
@Data
public class ForgotPasswordRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;
}
