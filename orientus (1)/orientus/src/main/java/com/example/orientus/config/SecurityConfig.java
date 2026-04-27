package com.example.orientus.config;

import com.example.orientus.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public
                .requestMatchers("/api/auth/login", "/api/auth/register", "/api/auth/verify", "/api/auth/resend-code", "/api/auth/forgot-password", "/api/auth/reset-password", "/api/auth/test").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/programs/**").permitAll()
                .requestMatchers("/api/recommendations/**").permitAll()
                .requestMatchers("/api/chatbot/**").permitAll()
                .requestMatchers("/ws/**").permitAll()  
                .requestMatchers("/api/health/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/contact/offices/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/contact/send").permitAll()
                .requestMatchers("/uploads/**").permitAll()

                // Contact admin
                .requestMatchers("/api/contact/admin/**").hasAnyRole("ADMIN", "OWNER")

                // Admin only
                .requestMatchers(HttpMethod.POST, "/api/programs/**").hasAnyRole("ADMIN", "OWNER")
                .requestMatchers(HttpMethod.PUT, "/api/programs/**").hasAnyRole("ADMIN", "OWNER")
                .requestMatchers(HttpMethod.DELETE, "/api/programs/**").hasAnyRole("ADMIN", "OWNER")
                .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "OWNER")
                .requestMatchers("/api/applications/stats").hasAnyRole("ADMIN", "OWNER")
                .requestMatchers(HttpMethod.PUT, "/api/applications/*/status").hasAnyRole("ADMIN", "OWNER")
                .requestMatchers(HttpMethod.GET, "/api/applications").hasAnyRole("ADMIN", "OWNER")

                // Messaging admin
                .requestMatchers("/api/messages/conversations/pending").hasAnyRole("ADMIN", "OWNER")
                .requestMatchers("/api/messages/conversations/all").hasAnyRole("ADMIN", "OWNER")
                .requestMatchers("/api/messages/conversations/admin/**").hasAnyRole("ADMIN", "OWNER")
                .requestMatchers("/api/messages/conversations/*/accept").hasAnyRole("ADMIN", "OWNER")
                .requestMatchers("/api/messages/conversations/*/reject").hasAnyRole("ADMIN", "OWNER")
                .requestMatchers("/api/messages/conversations/*/close").hasAnyRole("ADMIN", "OWNER")
                .requestMatchers("/api/messages/conversations/*/transfer").hasAnyRole("ADMIN", "OWNER")

                // Authenticated
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}