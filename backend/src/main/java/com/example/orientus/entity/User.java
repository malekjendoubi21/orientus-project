package com.example.orientus.entity;

import com.example.orientus.enums.UserRole;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    private String phone;

    @Column(nullable = false)
    private String nationality;  // ✅ On garde seulement la nationalité

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;  // Default role: STUDENT

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "is_verified", nullable = false)
    private boolean isVerified = false;

    @Column(name = "verification_code")
    private String verificationCode;

    @Column(name = "code_expiration_time")
    private LocalDateTime codeExpirationTime;

    @Column(name = "profile_picture")
    private String profilePicture;

    /**
     * Vrai pour les comptes ADMIN et AGENCY_PARTNER créés par l'OWNER.
     * L'utilisateur doit changer son mot de passe à la première connexion.
     * Remis à false une fois le mot de passe changé.
     * columnDefinition inclut DEFAULT false pour que Hibernate puisse
     * ajouter la colonne sur une table existante sans erreur NOT NULL.
     */
    @Column(name = "must_change_password", nullable = false, columnDefinition = "boolean DEFAULT false")
    private boolean mustChangePassword = false;
}

