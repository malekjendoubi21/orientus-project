package com.example.orientus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour la réponse après connexion
 * Contient le JWT token et les infos de l'utilisateur
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {

    // 🎫 JWT Token
    private String token;

    // 🆔 ID de l'utilisateur
    private Long id;

    // 📧 Email
    private String email;

    // 👤 Prénom
    private String firstName;

    // 👤 Nom
    private String lastName;

    // 🎭 Rôle (ADMIN ou STUDENT)
    private String role;

    // 🖼️ Image de profil
    private String profilePicture;

    // 🔑 Indique si l'utilisateur doit changer son mot de passe à la première connexion
    private boolean mustChangePassword;

    // 💬 Message de confirmation
    private String message;
}