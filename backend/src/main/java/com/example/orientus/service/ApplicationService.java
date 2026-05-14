package com.example.orientus.service;

import com.example.orientus.entity.Application;
import com.example.orientus.entity.Program;
import com.example.orientus.entity.User;
import com.example.orientus.enums.ApplicationSource;
import com.example.orientus.enums.ApplicationStatus;
import com.example.orientus.enums.ApplicationStep;
import com.example.orientus.exception.ConflictException;
import com.example.orientus.exception.ResourceNotFoundException;
import com.example.orientus.repository.ApplicationRepository;
import com.example.orientus.repository.ProgramRepository;
import com.example.orientus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final ProgramRepository programRepository;

    /**
     * Créer une nouvelle candidature
     */
    public Application createApplication(Application application, Long studentId, Long programId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        Program program = programRepository.findById(programId)
                .orElseThrow(() -> new ResourceNotFoundException("Program not found with id: " + programId));

        if (applicationRepository.existsByStudentIdAndProgramId(studentId, programId)) {
            throw new ConflictException("You have already applied to this program");
        }

        // Associer l'étudiant et le programme
        application.setStudent(student);
        application.setProgram(program);

        // Remplir les informations de l'étudiant depuis son profile
        application.setStudentFirstName(student.getFirstName());
        application.setStudentLastName(student.getLastName());
        application.setStudentEmail(student.getEmail());
        application.setStudentPhone(student.getPhone());
        application.setStudentNationality(student.getNationality());

        // Sauvegarder
        return applicationRepository.save(application);
    }

    /**
     * Récupérer toutes les candidatures (ADMIN)
     */
    public Page<Application> getAllApplications(Pageable pageable) {
        return applicationRepository.findAll(pageable);
    }

    /**
     * Récupérer les candidatures d'un étudiant
     */
    public Page<Application> getApplicationsByStudent(Long studentId, Pageable pageable) {
        return applicationRepository.findByStudentId(studentId, pageable);
    }

    /**
     * Récupérer une candidature par ID
     */
    public Application getApplicationById(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));
    }

    /**
     * Filtrer les candidatures par statut (ADMIN)
     */
    public Page<Application> getApplicationsByStatus(ApplicationStatus status, Pageable pageable) {
        return applicationRepository.findByStatus(status, pageable);
    }

    /**
     * Récupérer les candidatures par source (DIRECT ou AGENCY)
     */
    public Page<Application> getApplicationsBySource(ApplicationSource source, Pageable pageable) {
        return applicationRepository.findBySource(source, pageable);
    }

    /**
     * Récupérer les candidatures par source et statut
     */
    public Page<Application> getApplicationsBySourceAndStatus(ApplicationSource source, ApplicationStatus status, Pageable pageable) {
        return applicationRepository.findBySourceAndStatus(source, status, pageable);
    }

    /**
     * Récupérer les candidatures pour un programme spécifique
     */
    public Page<Application> getApplicationsByProgram(Long programId, Pageable pageable) {
        return applicationRepository.findByProgramId(programId, pageable);
    }

    /**
     * Changer le statut d'une candidature (ADMIN)
     */
    public Application updateApplicationStatus(Long id, ApplicationStatus newStatus) {
        Application application = getApplicationById(id);
        application.setStatus(newStatus);
        return applicationRepository.save(application);
    }

    /**
     * Supprimer une candidature (ADMIN)
     */
    public void deleteApplication(Long id) {
        Application application = getApplicationById(id);
        applicationRepository.delete(application);
    }

    /**
     * Avancer l'étape du timeline (ADMIN)
     */
    public Application updateApplicationStep(Long id, ApplicationStep step) {
        Application application = getApplicationById(id);
        application.setApplicationStep(step);
        return applicationRepository.save(application);
    }

    /**
     * Compter les candidatures par statut (pour statistiques admin)
     */
    public Long countApplicationsByStatus(ApplicationStatus status) {
        return applicationRepository.countByStatus(status);
    }

    /**
     * Compter toutes les candidatures d'un étudiant
     */
    public Long countApplicationsByStudent(Long studentId) {
        return applicationRepository.countByStudentId(studentId);
    }
}