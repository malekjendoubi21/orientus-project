package com.example.orientus.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * Même valeur que app.frontend.url dans SecurityConfig.
     * Injectée depuis application.properties / variables d'environnement.
     */
    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Les clients s'abonnent à /topic/* et /queue/*
        config.enableSimpleBroker("/topic", "/queue");
        // Les clients envoient à /app/*
        config.setApplicationDestinationPrefixes("/app");
        // Messages privés destinés à un user spécifique
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Origines autorisées : dev local + Nginx Docker + URL frontend configurable
        // Ne plus utiliser "*" pour éviter les connexions cross-origin non maîtrisées
        registry.addEndpoint("/ws")
                .setAllowedOrigins(
                    "http://localhost:5173",
                    "http://localhost",
                    "http://localhost:80",
                    frontendUrl
                )
                .withSockJS();
    }
}

