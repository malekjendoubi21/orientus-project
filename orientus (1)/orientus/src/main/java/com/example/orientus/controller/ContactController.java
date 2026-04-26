package com.example.orientus.controller;

import com.example.orientus.dto.ContactMessageRequest;
import com.example.orientus.dto.OfficeRequest;
import com.example.orientus.entity.ContactMessage;
import com.example.orientus.entity.Office;
import com.example.orientus.service.ContactMessageService;
import com.example.orientus.service.OfficeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller for public office and contact endpoints (no auth required)
 */
@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {

    private final OfficeService officeService;
    private final ContactMessageService contactMessageService;

    // ========================
    // PUBLIC ENDPOINTS
    // ========================

    /**
     * GET /api/contact/offices - List all offices (public)
     */
    @GetMapping("/offices")
    public ResponseEntity<List<Office>> getAllOffices() {
        return ResponseEntity.ok(officeService.getAllOffices());
    }

    /**
     * GET /api/contact/offices/{id} - Get single office (public)
     */
    @GetMapping("/offices/{id}")
    public ResponseEntity<Office> getOfficeById(@PathVariable Long id) {
        return ResponseEntity.ok(officeService.getOfficeById(id));
    }

    /**
     * POST /api/contact/send - Submit contact form (public)
     */
    @PostMapping("/send")
    public ResponseEntity<?> submitContactForm(@Valid @RequestBody ContactMessageRequest request) {
        contactMessageService.saveMessage(request);
        return ResponseEntity.ok(Map.of("message", "Your message has been sent successfully! We'll get back to you soon."));
    }

    // ========================
    // ADMIN ENDPOINTS
    // ========================

    /**
     * POST /api/contact/admin/offices - Create office (admin only)
     */
    @PostMapping("/admin/offices")
    public ResponseEntity<Office> createOffice(@Valid @RequestBody OfficeRequest request) {
        Office office = officeService.createOffice(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(office);
    }

    /**
     * PUT /api/contact/admin/offices/{id} - Update office (admin only)
     */
    @PutMapping("/admin/offices/{id}")
    public ResponseEntity<Office> updateOffice(@PathVariable Long id, @Valid @RequestBody OfficeRequest request) {
        Office office = officeService.updateOffice(id, request);
        return ResponseEntity.ok(office);
    }

    /**
     * DELETE /api/contact/admin/offices/{id} - Delete office (admin only)
     */
    @DeleteMapping("/admin/offices/{id}")
    public ResponseEntity<?> deleteOffice(@PathVariable Long id) {
        officeService.deleteOffice(id);
        return ResponseEntity.ok(Map.of("message", "Office deleted successfully"));
    }

    /**
     * GET /api/contact/admin/messages - List all contact messages (admin only)
     */
    @GetMapping("/admin/messages")
    public ResponseEntity<List<ContactMessage>> getAllMessages() {
        return ResponseEntity.ok(contactMessageService.getAllMessages());
    }

    /**
     * PUT /api/contact/admin/messages/{id}/read - Mark message as read (admin only)
     */
    @PutMapping("/admin/messages/{id}/read")
    public ResponseEntity<ContactMessage> markMessageAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(contactMessageService.markAsRead(id));
    }

    /**
     * DELETE /api/contact/admin/messages/{id} - Delete message (admin only)
     */
    @DeleteMapping("/admin/messages/{id}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long id) {
        contactMessageService.deleteMessage(id);
        return ResponseEntity.ok(Map.of("message", "Message deleted successfully"));
    }

    /**
     * GET /api/contact/admin/messages/count - Get new message count (admin only)
     */
    @GetMapping("/admin/messages/count")
    public ResponseEntity<?> getNewMessageCount() {
        return ResponseEntity.ok(Map.of("count", contactMessageService.getNewMessageCount()));
    }
}
