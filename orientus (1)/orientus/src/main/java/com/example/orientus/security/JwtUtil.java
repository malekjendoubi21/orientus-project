package com.example.orientus.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Utilitaire pour générer et valider les JWT tokens
 */
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration:86400000}")
    private long expirationTime;

    /**
     * Générer la clé secrète à partir du String
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Générer un JWT token pour un utilisateur
     * @param email Email de l'utilisateur
     * @param role Rôle de l'utilisateur (ADMIN, STUDENT ou OWNER)
     * @return Le JWT token
     */
    public String generateToken(String email, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", email);
        claims.put("role", role);

        return Jwts.builder()
                .claims(claims)
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Valider un JWT token (signature + expiration)
     * @param token Le JWT token
     * @return true si valide, false sinon
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Alias pour validateToken — utilisé par JwtAuthenticationFilter
     */
    public boolean isTokenValid(String token) {
        return validateToken(token);
    }

    /**
     * Extraire l'email du JWT token
     */
    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    /**
     * Extraire le rôle du JWT token
     */
    public String extractRole(String token) {
        return (String) extractAllClaims(token).get("role");
    }

    /**
     * Extraire toutes les données (claims) du JWT token
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}