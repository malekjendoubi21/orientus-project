package com.example.orientus.controller;

import com.example.orientus.entity.Application;
import com.example.orientus.enums.ApplicationStatus;
import com.example.orientus.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    /**
     * POST /api/applications
     */
    @PostMapping
    public ResponseEntity<?> createApplication(
            @RequestBody Application application,
            @RequestParam Long studentId,
            @RequestParam Long programId
    ) {
        Application createdApplication = applicationService.createApplication(application, studentId, programId);
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
            @RequestParam(required = false) ApplicationStatus status
    ) {
        Sort sort = sortDir.equalsIgnoreCase("ASC")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Application> applicationsPage = (status != null)
                ? applicationService.getApplicationsByStatus(status, pageable)
                : applicationService.getAllApplications(pageable);

        return ResponseEntity.ok(Map.of(
                "applications", applicationsPage.getContent(),
                "currentPage", applicationsPage.getNumber(),
                "totalItems", applicationsPage.getTotalElements(),
                "totalPages", applicationsPage.getTotalPages()
        ));
    }

    /**
     * GET /api/applications/student/{studentId}
     */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getApplicationsByStudent(
            @PathVariable Long studentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
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
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getApplicationById(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.getApplicationById(id));
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