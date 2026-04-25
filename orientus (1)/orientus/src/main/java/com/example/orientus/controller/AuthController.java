package com.example.orientus.controller;

import com.example.orientus.dto.*;
import com.example.orientus.entity.User;
import com.example.orientus.service.AuthService;
import com.example.orientus.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller pour l'authentification
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final AuthService authService;

    /**
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        User user = userService.registerStudent(request);
        AuthResponse response = new AuthResponse(
                user.getId(), user.getEmail(), user.getFirstName(), user.getLastName(),
                user.getRole().name(),
                "Student registered successfully. Please check your email for the verification code."
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        String token = authService.login(request);
        User user = authService.getUserByEmail(request.getEmail());
        LoginResponse response = new LoginResponse(
                token, user.getId(), user.getEmail(), user.getFirstName(),
                user.getLastName(), user.getRole().name(), "Login successful"
        );
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/auth/admin/create — Protected by OWNER role via SecurityConfig
     */
    @PostMapping("/admin/create")
    public ResponseEntity<AuthResponse> createAdmin(@Valid @RequestBody RegisterRequest request) {
        User user = userService.createAdmin(request);
        AuthResponse response = new AuthResponse(
                user.getId(), user.getEmail(), user.getFirstName(), user.getLastName(),
                user.getRole().name(), "Admin created successfully"
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * POST /api/auth/verify
     */
    @PostMapping("/verify")
    public ResponseEntity<Map<String, String>> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        userService.verifyEmail(request.getEmail(), request.getCode());
        return ResponseEntity.ok(Map.of("message", "Email verified successfully. You can now log in."));
    }

    /**
     * POST /api/auth/resend-code
     */
    @PostMapping("/resend-code")
    public ResponseEntity<Map<String, String>> resendVerificationCode(@Valid @RequestBody ResendCodeRequest request) {
        userService.resendVerificationCode(request.getEmail());
        return ResponseEntity.ok(Map.of("message", "A new verification code has been sent to your email."));
    }

    /**
     * POST /api/auth/forgot-password
     * Demander la réinitialisation du mot de passe
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        userService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(Map.of("message", "A password reset code has been sent to your email."));
    }

    /**
     * POST /api/auth/reset-password
     * Réinitialiser le mot de passe avec le code de vérification
     */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        userService.resetPassword(request.getEmail(), request.getCode(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password has been reset successfully. You can now log in with your new password."));
    }

    /**
     * GET /api/auth/test
     */
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("API is working!");
    }
}