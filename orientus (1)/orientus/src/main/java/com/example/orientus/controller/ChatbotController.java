package com.example.orientus.controller;

import com.example.orientus.dto.*;
import com.example.orientus.entity.ChatFeedback;
import com.example.orientus.repository.ChatFeedbackRepository;
import com.example.orientus.service.ChatbotCacheService;
import com.example.orientus.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller du chatbot
 */
@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
@Slf4j
public class ChatbotController {

    private final ChatbotService chatbotService;
    private final ChatFeedbackRepository feedbackRepository;
    private final ChatbotCacheService cacheService;

    /**
     * GET /api/chatbot/welcome
     */
    @GetMapping("/welcome")
    public ResponseEntity<WelcomeResponse> welcome() {
        WelcomeResponse response = WelcomeResponse.builder()
                .message("Bonjour ! Je suis l'assistant Orientus. Je peux vous aider à trouver des programmes d'études à l'étranger parmi nos universités partenaires. Posez-moi une question !")
                .suggestions(List.of(
                        "Je veux étudier en France",
                        "Programmes Master en IT",
                        "Budget < 5000€/an",
                        "Quels pays sont disponibles ?",
                        "Bachelor en Business en Espagne",
                        "Programmes en anglais en Allemagne"
                ))
                .build();
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/chatbot/ask
     */
    @PostMapping("/ask")
    public ResponseEntity<ChatbotResponse> ask(@RequestBody Map<String, Object> requestBody) {
        String question = null;
        if (requestBody.containsKey("message")) {
            question = (String) requestBody.get("message");
        } else if (requestBody.containsKey("question")) {
            question = (String) requestBody.get("question");
        }

        if (question == null || question.isBlank()) {
            return ResponseEntity.badRequest().body(
                    ChatbotResponse.builder()
                            .inDomain(false)
                            .message("Veuillez poser une question.")
                            .needsClarification(false)
                            .build()
            );
        }

        List<ChatMessage> history = null;
        if (requestBody.containsKey("history") && requestBody.get("history") instanceof List) {
            try {
                @SuppressWarnings("unchecked")
                List<Map<String, String>> rawHistory = (List<Map<String, String>>) requestBody.get("history");
                history = rawHistory.stream()
                        .map(m -> new ChatMessage(m.get("role"), m.get("content")))
                        .toList();
            } catch (Exception e) {
                log.warn("Impossible de parser l'historique : {}", e.getMessage());
            }
        }

        ChatbotResponse response = chatbotService.handleQuestion(question, history);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/chatbot/feedback
     */
    @PostMapping("/feedback")
    public ResponseEntity<Map<String, String>> submitFeedback(@RequestBody FeedbackRequest request) {
        if (request.getMessageId() == null || request.getMessageId().isBlank()) {
            throw new RuntimeException("messageId is required");
        }
        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        ChatFeedback feedback = new ChatFeedback();
        feedback.setMessageId(request.getMessageId());
        feedback.setRating(request.getRating());
        feedback.setComment(request.getComment());
        feedbackRepository.save(feedback);

        log.info("Feedback reçu : messageId={}, rating={}", request.getMessageId(), request.getRating());
        return ResponseEntity.ok(Map.of("message", "Feedback enregistré. Merci !"));
    }

    /**
     * POST /api/chatbot/cache/invalidate
     */
    @PostMapping("/cache/invalidate")
    public ResponseEntity<Map<String, String>> invalidateCache() {
        cacheService.invalidateCache();
        return ResponseEntity.ok(Map.of("message", "Cache invalidé avec succès"));
    }

    /**
     * GET /api/chatbot/cache/stats
     */
    @GetMapping("/cache/stats")
    public ResponseEntity<Map<String, Object>> cacheStats() {
        return ResponseEntity.ok(Map.of(
                "cacheSize", cacheService.getCacheSize(),
                "message", "Cache stats retrieved"
        ));
    }

    /**
     * GET /api/chatbot/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "Chatbot",
                "message", "Chatbot is ready!"
        ));
    }
}

