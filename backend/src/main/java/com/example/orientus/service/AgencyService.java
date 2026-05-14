package com.example.orientus.service;

import com.example.orientus.dto.AgencyApplicationRequest;
import com.example.orientus.entity.Application;
import com.example.orientus.entity.Program;
import com.example.orientus.enums.ApplicationSource;
import com.example.orientus.enums.ApplicationStatus;
import com.example.orientus.enums.ApplicationStep;
import com.example.orientus.repository.ApplicationRepository;
import com.example.orientus.repository.ProgramRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AgencyService {

    private final ApplicationRepository applicationRepository;
    private final ProgramRepository programRepository;

    /**
     * Soumettre une candidature via agence — sans compte étudiant requis.
     * Les informations de l'étudiant sont saisies directement par l'agence.
     */
    public Application submitAgencyApplication(AgencyApplicationRequest request, String agencyName) {

        Program program = programRepository.findById(request.getProgramId())
                .orElseThrow(() -> new RuntimeException("Programme introuvable : " + request.getProgramId()));

        Application application = new Application();

        // Pas de relation User — l'étudiant n'a pas de compte
        application.setStudent(null);
        application.setProgram(program);

        // Infos étudiant saisies par l'agence
        application.setStudentFirstName(request.getStudentFirstName());
        application.setStudentLastName(request.getStudentLastName());
        application.setStudentEmail(request.getStudentEmail());
        application.setStudentPhone(request.getStudentPhone());
        application.setStudentNationality(request.getStudentNationality());

        // Dossier
        application.setBudgetRange(request.getBudgetRange());
        application.setHasPassport(request.getHasPassport() != null ? request.getHasPassport() : false);
        application.setHasEnglishB2(request.getHasEnglishB2() != null ? request.getHasEnglishB2() : false);
        application.setHasFrenchB2(request.getHasFrenchB2() != null ? request.getHasFrenchB2() : false);
        application.setAdditionalNotes(request.getAdditionalNotes());

        // Source agence
        application.setSource(ApplicationSource.AGENCY);
        application.setAgencyName(agencyName);
        application.setApplicationStep(ApplicationStep.APPLICATION_RECEIVED);
        application.setStatus(ApplicationStatus.NON_REPONDU);

        return applicationRepository.save(application);
    }

    /**
     * Récupérer les candidatures d'une agence par son nom
     */
    public Page<Application> getApplicationsByAgencyName(String agencyName, Pageable pageable) {
        return applicationRepository.findByAgencyName(agencyName, pageable);
    }
}
