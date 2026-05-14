package com.example.orientus.controller;

import com.example.orientus.dto.FirstPasswordRequest;
import com.example.orientus.dto.UpdateProfileRequest;
import com.example.orientus.entity.User;
import com.example.orientus.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller pour gérer le profil utilisateur
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;


    /**
     * GET /api/users/profile
     * Récupérer le profil de l'utilisateur connecté (email extrait du JWT)
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        User user = (User) authentication.getPrincipal();

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("firstName", user.getFirstName());
        response.put("lastName", user.getLastName());
        response.put("phone", user.getPhone());
        response.put("nationality", user.getNationality());
        response.put("role", user.getRole().name());
        response.put("profilePicture", user.getProfilePicture());
        response.put("createdAt", user.getCreatedAt());

        return ResponseEntity.ok(response);
    }


    /**
     * PUT /api/users/profile
     * Mettre à jour le profil de l'utilisateur connecté (email extrait du JWT)
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        String email = ((User) authentication.getPrincipal()).getEmail();
        User updatedUser = userService.updateProfile(email, request);

        Map<String, Object> response = new HashMap<>();
        response.put("id", updatedUser.getId());
        response.put("email", updatedUser.getEmail());
        response.put("firstName", updatedUser.getFirstName());
        response.put("lastName", updatedUser.getLastName());
        response.put("phone", updatedUser.getPhone());
        response.put("nationality", updatedUser.getNationality());
        response.put("role", updatedUser.getRole().name());
        response.put("profilePicture", updatedUser.getProfilePicture());
        response.put("message", "Profile updated successfully");

        return ResponseEntity.ok(response);
    }


    /**
     * DELETE /api/users/profile
     * Supprimer le compte de l'utilisateur connecté (email extrait du JWT)
     */
    @DeleteMapping("/profile")
    public ResponseEntity<?> deleteAccount(Authentication authentication) {
        String email = ((User) authentication.getPrincipal()).getEmail();
        userService.deleteUser(email);
        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
    }

    /**
     * POST /api/users/first-password
     * Définir un nouveau mot de passe à la première connexion.
     * Accessible dès qu'on est authentifié (même si mustChangePassword = true).
     */
    @PostMapping("/first-password")
    public ResponseEntity<?> setFirstPassword(
            Authentication authentication,
            @RequestBody FirstPasswordRequest request) {
        String email = ((User) authentication.getPrincipal()).getEmail();
        userService.setFirstPassword(email, request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password updated successfully. Please log in again."));
    }

    /**
     * POST /api/users/profile/avatar
     * Upload an avatar (email extrait du JWT)
     */
    @PostMapping("/profile/avatar")
    public ResponseEntity<?> uploadAvatar(
            Authentication authentication,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            String email = ((User) authentication.getPrincipal()).getEmail();
            User updatedUser = userService.updateProfilePicture(email, file);
            return ResponseEntity.ok(Map.of(
                "message", "Profile picture updated successfully",
                "profilePicture", updatedUser.getProfilePicture()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}