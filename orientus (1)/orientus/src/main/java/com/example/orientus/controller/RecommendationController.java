package com.example.orientus.controller;

import com.example.orientus.dto.ProgramScoreDTO;
import com.example.orientus.dto.StudentProfileDTO;
import com.example.orientus.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
@Slf4j
public class RecommendationController {

    private final RecommendationService recommendationService;

    /**
     * POST /api/recommendations
     * Reçoit un profil étudiant, retourne les top 10 programmes recommandés
     */
    @PostMapping
    public ResponseEntity<?> getRecommendations(@RequestBody StudentProfileDTO studentProfile) {
        log.info("POST /api/recommendations — interest: {}, degree: {}",
                studentProfile.getInterestField(), studentProfile.getTargetDegree());

        List<ProgramScoreDTO> recommendations = recommendationService.getRecommendations(studentProfile);

        return ResponseEntity.ok(Map.of(
                "recommendations", recommendations,
                "totalRecommendations", recommendations.size(),
                "mlAvailable", recommendationService.isMLAvailable()
        ));
    }

    /**
     * GET /api/recommendations/health
     * Vérifier si le ML est disponible
     */
    @GetMapping("/health")
    public ResponseEntity<?> checkMLHealth() {
        boolean available = recommendationService.isMLAvailable();
        return ResponseEntity.ok(Map.of(
                "mlAvailable", available,
                "mlUrl", "http://localhost:5000"
        ));
    }
}
