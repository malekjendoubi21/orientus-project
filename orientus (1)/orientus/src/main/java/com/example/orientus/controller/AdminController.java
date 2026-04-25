package com.example.orientus.controller;

import com.example.orientus.dto.RegisterRequest;
import com.example.orientus.entity.User;
import com.example.orientus.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller pour gérer les admins (OWNER uniquement)
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    /**
     * GET /api/admin/list?ownerEmail=xxx
     */
    @GetMapping("/list")
    public ResponseEntity<?> getAllAdmins(@RequestParam String ownerEmail) {
        if (!adminService.isOwner(ownerEmail)) {
            throw new RuntimeException("Only OWNER can view admin list");
        }

        List<User> admins = adminService.getAllAdmins();

        List<Map<String, Object>> response = admins.stream().map(admin -> {
            Map<String, Object> adminData = new HashMap<>();
            adminData.put("id", admin.getId());
            adminData.put("email", admin.getEmail());
            adminData.put("firstName", admin.getFirstName());
            adminData.put("lastName", admin.getLastName());
            adminData.put("phone", admin.getPhone());
            adminData.put("nationality", admin.getNationality());
            adminData.put("role", admin.getRole().name());
            adminData.put("createdAt", admin.getCreatedAt());
            return adminData;
        }).toList();

        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/admin/create?ownerEmail=xxx
     */
    @PostMapping("/create")
    public ResponseEntity<?> createAdmin(
            @RequestParam String ownerEmail,
            @Valid @RequestBody RegisterRequest request
    ) {
        User admin = adminService.createAdmin(ownerEmail, request);

        Map<String, Object> response = new HashMap<>();
        response.put("id", admin.getId());
        response.put("email", admin.getEmail());
        response.put("firstName", admin.getFirstName());
        response.put("lastName", admin.getLastName());
        response.put("phone", admin.getPhone());
        response.put("nationality", admin.getNationality());
        response.put("role", admin.getRole().name());
        response.put("message", "Admin created successfully");

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * DELETE /api/admin/{adminId}?ownerEmail=xxx
     */
    @DeleteMapping("/{adminId}")
    public ResponseEntity<?> deleteAdmin(@PathVariable Long adminId, @RequestParam String ownerEmail) {
        adminService.deleteAdmin(ownerEmail, adminId);
        return ResponseEntity.ok(Map.of("message", "Admin deleted successfully"));
    }

    /**
     * GET /api/admin/students
     * Liste de tous les étudiants (ADMIN ou OWNER)
     */
    @GetMapping("/students")
    public ResponseEntity<?> getAllStudents() {
        List<User> students = adminService.getAllStudents();

        List<Map<String, Object>> response = students.stream().map(student -> {
            Map<String, Object> studentData = new HashMap<>();
            studentData.put("id", student.getId());
            studentData.put("email", student.getEmail());
            studentData.put("firstName", student.getFirstName());
            studentData.put("lastName", student.getLastName());
            studentData.put("phone", student.getPhone());
            studentData.put("nationality", student.getNationality());
            studentData.put("role", student.getRole().name());
            studentData.put("createdAt", student.getCreatedAt());
            return studentData;
        }).toList();

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/admin/students/count
     * Nombre total d'étudiants (ADMIN ou OWNER)
     */
    @GetMapping("/students/count")
    public ResponseEntity<?> getStudentCount() {
        long count = adminService.getStudentCount();
        return ResponseEntity.ok(Map.of("count", count));
    }
}