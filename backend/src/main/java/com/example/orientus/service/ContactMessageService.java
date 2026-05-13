package com.example.orientus.service;

import com.example.orientus.dto.ContactMessageRequest;
import com.example.orientus.entity.ContactMessage;
import com.example.orientus.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ContactMessageService {

    private final ContactMessageRepository contactMessageRepository;
    private final JavaMailSender mailSender;

    /**
     * Save a new contact message and send email notification
     */
    public ContactMessage saveMessage(ContactMessageRequest request) {
        ContactMessage message = new ContactMessage();
        message.setName(request.getName());
        message.setEmail(request.getEmail());
        message.setSubject(request.getSubject());
        message.setMessage(request.getMessage());
        message.setStatus("NEW");
        message.setCreatedAt(LocalDateTime.now());

        ContactMessage saved = contactMessageRepository.save(message);

        // Send email notification asynchronously (best effort)
        try {
            sendEmailNotification(saved);
        } catch (Exception e) {
            log.warn("Failed to send contact notification email: {}", e.getMessage());
        }

        return saved;
    }

    /**
     * Get all contact messages (admin)
     */
    public List<ContactMessage> getAllMessages() {
        return contactMessageRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * Mark a message as read
     */
    public ContactMessage markAsRead(Long id) {
        ContactMessage message = contactMessageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        message.setStatus("READ");
        return contactMessageRepository.save(message);
    }

    /**
     * Get count of new messages
     */
    public long getNewMessageCount() {
        return contactMessageRepository.countByStatus("NEW");
    }

    /**
     * Delete a contact message
     */
    public void deleteMessage(Long id) {
        contactMessageRepository.deleteById(id);
    }

    /**
     * Send email notification for new contact message
     */
    private void sendEmailNotification(ContactMessage message) {
        SimpleMailMessage email = new SimpleMailMessage();
        email.setTo("contact@orientus.com");
        email.setSubject("[Orientus Contact] " + message.getSubject());
        email.setText(String.format(
            "New contact form submission:\n\n" +
            "Name: %s\nEmail: %s\nSubject: %s\n\nMessage:\n%s",
            message.getName(), message.getEmail(), message.getSubject(), message.getMessage()
        ));
        email.setReplyTo(message.getEmail());
        mailSender.send(email);
    }
}
