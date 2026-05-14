package com.example.orientus.controller;

import com.example.orientus.dto.AgencyApplicationRequest;
import com.example.orientus.entity.Application;
import com.example.orientus.service.AgencyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/agency")
@RequiredArgsConstructor
public class AgencyController {

    private final AgencyService agencyService;

    /**
     * POST /api/agency/applications
     * Soumettre une candidature via agence (sans compte étudiant requis).
     * L'agencyName est extrait du nom du compte connecté.
     */
    @PostMapping("/applications")
    public ResponseEntity<?> submitApplication(
            @RequestBody AgencyApplicationRequest request,
            @RequestParam String agencyName
    ) {
        if (request.getProgramId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "programId est requis"));
        }
        if (request.getStudentFirstName() == null || request.getStudentLastName() == null || request.getStudentEmail() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Prénom, nom et email étudiant sont requis"));
        }
        if (request.getBudgetRange() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "budgetRange est requis"));
        }

        Application created = agencyService.submitAgencyApplication(request, agencyName);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Dossier soumis avec succès",
                "application", created
        ));
    }

    /**
     * GET /api/agency/applications?agencyName=xxx
     * Récupérer les dossiers d'une agence
     */
    @GetMapping("/applications")
    public ResponseEntity<?> getAgencyApplications(
            @RequestParam String agencyName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("applicationDate").descending());
        Page<Application> result = agencyService.getApplicationsByAgencyName(agencyName, pageable);

        return ResponseEntity.ok(Map.of(
                "applications", result.getContent(),
                "currentPage", result.getNumber(),
                "totalItems", result.getTotalElements(),
                "totalPages", result.getTotalPages()
        ));
    }
}
