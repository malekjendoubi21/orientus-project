package com.example.orientus.entity;

import com.example.orientus.enums.ApplicationSource;
import com.example.orientus.enums.ApplicationStatus;
import com.example.orientus.enums.ApplicationStep;
import com.example.orientus.enums.BudgetRange;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relations — student peut être null pour les dossiers soumis par agence
    @ManyToOne
    @JoinColumn(name = "student_id", nullable = true)
    private User student;

    @ManyToOne
    @JoinColumn(name = "program_id", nullable = false)
    private Program program;

    // Informations de l'étudiant (depuis profile)
    @Column(nullable = false)
    private String studentFirstName;

    @Column(nullable = false)
    private String studentLastName;

    @Column(nullable = false)
    private String studentEmail;

    private String studentPhone;

    private String studentNationality;

    // Budget
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BudgetRange budgetRange;

    // Documents
    @Column(nullable = false)
    private Boolean hasPassport;

    @Column(nullable = false)
    private Boolean hasEnglishB2;

    @Column(nullable = false)
    private Boolean hasFrenchB2;

    // Notes supplémentaires
    @Column(length = 2000)
    private String additionalNotes;

    // Statut (géré par admin)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status;

    // Source de la candidature
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationSource source;

    // Nom de l'agence (uniquement si source = AGENCY)
    @Column(length = 255)
    private String agencyName;

    // Étape du suivi de dossier (timeline universelle)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStep applicationStep;

    // Timestamps
    @Column(nullable = false)
    private LocalDateTime applicationDate;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        applicationDate = LocalDateTime.now();
        status = ApplicationStatus.NON_REPONDU;
        applicationStep = ApplicationStep.APPLICATION_RECEIVED;
        if (source == null) {
            source = ApplicationSource.DIRECT;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}