package com.example.orientus.controller;

import com.example.orientus.entity.Program;
import com.example.orientus.enums.ProgramCategory;
import com.example.orientus.enums.ProgramDegree;
import com.example.orientus.service.ProgramService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller pour gérer les programmes universitaires
 */
@RestController
@RequestMapping("/api/programs")
@RequiredArgsConstructor
@Slf4j
public class ProgramController {

    private final ProgramService programService;

    /**
     * GET /api/programs/all — Tous les programmes + metadata des filtres
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllProgramsWithMetadata() {
        log.info("GET /api/programs/all");
        return ResponseEntity.ok(programService.getAllProgramsWithMetadata());
    }

    /**
     * GET /api/programs/filters — Metadata seule
     */
    @GetMapping("/filters")
    public ResponseEntity<?> getFilterMetadata() {
        log.info("GET /api/programs/filters");
        return ResponseEntity.ok(programService.getFilterMetadata());
    }

    /**
     * GET /api/programs — Filtres combinés avec pagination
     */
    @GetMapping
    public ResponseEntity<?> getAllPrograms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) ProgramCategory category,
            @RequestParam(required = false) ProgramDegree degree,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String language
    ) {
        Sort sort = sortDir.equalsIgnoreCase("ASC")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Program> programsPage = programService.findWithFilters(search, country, category, degree, language, pageable);

        return ResponseEntity.ok(Map.of(
                "programs", programsPage.getContent(),
                "currentPage", programsPage.getNumber(),
                "totalItems", programsPage.getTotalElements(),
                "totalPages", programsPage.getTotalPages()
        ));
    }

    /**
     * GET /api/programs/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getProgramById(@PathVariable Long id) {
        return ResponseEntity.ok(programService.getProgramById(id));
    }

    /**
     * POST /api/programs
     */
    @PostMapping
    public ResponseEntity<?> createProgram(@RequestBody Program program) {
        Program createdProgram = programService.createProgram(program);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Program created successfully",
                "program", createdProgram
        ));
    }

    /**
     * PUT /api/programs/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProgram(@PathVariable Long id, @RequestBody Program programDetails) {
        Program updatedProgram = programService.updateProgram(id, programDetails);
        return ResponseEntity.ok(Map.of(
                "message", "Program updated successfully",
                "program", updatedProgram
        ));
    }

    /**
     * DELETE /api/programs/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProgram(@PathVariable Long id) {
        programService.deleteProgram(id);
        return ResponseEntity.ok(Map.of("message", "Program deleted successfully"));
    }

    /**
     * GET /api/programs/featured
     */
    @GetMapping("/featured")
    public ResponseEntity<?> getFeaturedPrograms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Program> programsPage = programService.getFeaturedPrograms(pageable);
        return ResponseEntity.ok(programsPage.getContent());
    }

    /**
     * GET /api/programs/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getProgramStats() {
        return ResponseEntity.ok(programService.getOptimizedStats());
    }
}