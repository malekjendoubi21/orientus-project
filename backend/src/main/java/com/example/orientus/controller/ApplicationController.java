package com.example.orientus.controller;

import com.example.orientus.entity.Application;
import com.example.orientus.entity.User;
import com.example.orientus.enums.ApplicationSource;
import com.example.orientus.enums.ApplicationStatus;
import com.example.orientus.enums.ApplicationStep;
import com.example.orientus.enums.UserRole;
import com.example.orientus.service.ApplicationService;
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
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    /**
     * POST /api/applications
     * studentId n'est plus accepté en paramètre : il est extrait du JWT
     * pour garantir qu'un étudiant ne peut postuler qu'en son propre nom.
     */
    @PostMapping
    public ResponseEntity<?> createApplication(
            @RequestBody Application application,
            @RequestParam Long programId,
            Authentication authentication
    ) {
        User caller = (User) authentication.getPrincipal();

        Application createdApplication = applicationService.createApplication(application, caller.getId(), programId);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Application submitted successfully",
                "application", createdApplication
        ));
    }

    /**
     * GET /api/applications
     */
    @GetMapping
    public ResponseEntity<?> getAllApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "applicationDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) ApplicationSource source
    ) {
        Sort sort = sortDir.equalsIgnoreCase("ASC")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Application> applicationsPage;

        if (source != null && status != null) {
            applicationsPage = applicationService.getApplicationsBySourceAndStatus(source, status, pageable);
        } else if (source != null) {
            applicationsPage = applicationService.getApplicationsBySource(source, pageable);
        } else if (status != null) {
            applicationsPage = applicationService.getApplicationsByStatus(status, pageable);
        } else {
            applicationsPage = applicationService.getAllApplications(pageable);
        }

        return ResponseEntity.ok(Map.of(
                "applications", applicationsPage.getContent(),
                "currentPage", applicationsPage.getNumber(),
                "totalItems", applicationsPage.getTotalElements(),
                "totalPages", applicationsPage.getTotalPages()
        ));
    }

    /**
     * GET /api/applications/student/{studentId}
     * Un STUDENT ne peut consulter que ses propres candidatures.
     * Un ADMIN ou OWNER peut consulter celles de n'importe quel étudiant.
     */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getApplicationsByStudent(
            @PathVariable Long studentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication
    ) {
        User caller = (User) authentication.getPrincipal();

        if (caller.getRole() == UserRole.STUDENT && !caller.getId().equals(studentId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied: you can only view your own applications"));
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("applicationDate").descending());
        Page<Application> applicationsPage = applicationService.getApplicationsByStudent(studentId, pageable);

        return ResponseEntity.ok(Map.of(
                "applications", applicationsPage.getContent(),
                "currentPage", applicationsPage.getNumber(),
                "totalItems", applicationsPage.getTotalElements(),
                "totalPages", applicationsPage.getTotalPages()
        ));
    }

    /**
     * GET /api/applications/{id}
     * Un STUDENT ne peut consulter qu'une candidature qui lui appartient.
     * Un ADMIN ou OWNER peut consulter n'importe quelle candidature.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getApplicationById(@PathVariable Long id, Authentication authentication) {
        Application application = applicationService.getApplicationById(id);

        User caller = (User) authentication.getPrincipal();

        if (caller.getRole() == UserRole.STUDENT) {
            boolean isOwner = application.getStudent() != null
                    && application.getStudent().getId().equals(caller.getId());
            if (!isOwner) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Access denied: this application does not belong to you"));
            }
        }

        return ResponseEntity.ok(application);
    }

    /**
     * PUT /api/applications/{id}/status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateApplicationStatus(
            @PathVariable Long id,
            @RequestParam ApplicationStatus status
    ) {
        Application updatedApplication = applicationService.updateApplicationStatus(id, status);
        return ResponseEntity.ok(Map.of(
                "message", "Application status updated successfully",
                "application", updatedApplication
        ));
    }

    /**
     * PUT /api/applications/{id}/step — Avancer l'étape du timeline (ADMIN)
     */
    @PutMapping("/{id}/step")
    public ResponseEntity<?> updateApplicationStep(
            @PathVariable Long id,
            @RequestParam ApplicationStep step
    ) {
        Application updatedApplication = applicationService.updateApplicationStep(id, step);
        return ResponseEntity.ok(Map.of(
                "message", "Application step updated successfully",
                "application", updatedApplication
        ));
    }

    /**
     * DELETE /api/applications/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteApplication(@PathVariable Long id) {
        applicationService.deleteApplication(id);
        return ResponseEntity.ok(Map.of("message", "Application deleted successfully"));
    }

    /**
     * GET /api/applications/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getApplicationStats() {
        return ResponseEntity.ok(Map.of(
                "total", applicationService.getAllApplications(Pageable.unpaged()).getTotalElements(),
                "nonRepondu", applicationService.countApplicationsByStatus(ApplicationStatus.NON_REPONDU),
                "enCours", applicationService.countApplicationsByStatus(ApplicationStatus.EN_COURS),
                "contacte", applicationService.countApplicationsByStatus(ApplicationStatus.CONTACTE)
        ));
    }
}