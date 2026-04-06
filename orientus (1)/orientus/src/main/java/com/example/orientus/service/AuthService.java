package com.example.orientus.service;

import com.example.orientus.dto.LoginRequest;
import com.example.orientus.entity.User;
import com.example.orientus.repository.UserRepository;
import com.example.orientus.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Service pour l'authentification (login)
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder;


    /**
     * Connexion d'un utilisateur
     * @param request Email et mot de passe
     * @return Le JWT token
     */
    public String login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));


        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (!user.isVerified()) {
            throw new RuntimeException("Email not verified. Please check your inbox and verify your email before logging in.");
        }

        return jwtUtil.generateToken(user.getEmail(), user.getRole().name());
    }


    /**
     * Récupérer un utilisateur par email
     */
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
