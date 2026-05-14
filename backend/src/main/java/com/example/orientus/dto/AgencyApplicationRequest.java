package com.example.orientus.dto;

import com.example.orientus.enums.BudgetRange;
import lombok.Data;

/**
 * DTO pour la soumission d'une candidature via agence partenaire.
 * L'étudiant n'a pas besoin de compte sur la plateforme.
 */
@Data
public class AgencyApplicationRequest {

    // Programme visé
    private Long programId;

    // Infos étudiant (saisies par l'agence)
    private String studentFirstName;
    private String studentLastName;
    private String studentEmail;
    private String studentPhone;
    private String studentNationality;

    // Dossier
    private BudgetRange budgetRange;
    private Boolean hasPassport;
    private Boolean hasEnglishB2;
    private Boolean hasFrenchB2;
    private String additionalNotes;
}
