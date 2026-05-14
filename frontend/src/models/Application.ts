export const ApplicationStatus = {
  NON_REPONDU: 'NON_REPONDU',
  EN_COURS: 'EN_COURS',
  CONTACTE: 'CONTACTE',
} as const;

export type ApplicationStatus = typeof ApplicationStatus[keyof typeof ApplicationStatus];

export const ApplicationSource = {
  DIRECT: 'DIRECT',
  AGENCY: 'AGENCY',
} as const;

export type ApplicationSource = typeof ApplicationSource[keyof typeof ApplicationSource];

export const ApplicationStep = {
  APPLICATION_RECEIVED: 'APPLICATION_RECEIVED',
  STUDENT_CONTACTED: 'STUDENT_CONTACTED',
  DOSSIER_IN_PREPARATION: 'DOSSIER_IN_PREPARATION',
  DOSSIER_READY: 'DOSSIER_READY',
  UNIVERSITY_CONTACTED: 'UNIVERSITY_CONTACTED',
  UNIVERSITY_ACCEPTED: 'UNIVERSITY_ACCEPTED',
  UNIVERSITY_REJECTED: 'UNIVERSITY_REJECTED',
  VISA_PROCESSING: 'VISA_PROCESSING',
  VISA_ACCEPTED: 'VISA_ACCEPTED',
  VISA_REJECTED: 'VISA_REJECTED',
} as const;

export type ApplicationStep = typeof ApplicationStep[keyof typeof ApplicationStep];

export const BudgetRange = {
  RANGE_0_10K: 'RANGE_0_10K',
  RANGE_10K_20K: 'RANGE_10K_20K',
  RANGE_20K_30K: 'RANGE_20K_30K',
  RANGE_30K_PLUS: 'RANGE_30K_PLUS',
} as const;

export type BudgetRange = typeof BudgetRange[keyof typeof BudgetRange];

export const BUDGET_LABELS: Record<string, string> = {
  RANGE_0_10K: '0€ - 10,000€',
  RANGE_10K_20K: '10,000€ - 20,000€',
  RANGE_20K_30K: '20,000€ - 30,000€',
  RANGE_30K_PLUS: 'Plus de 30,000€',
};

export const STATUS_LABELS: Record<string, string> = {
  NON_REPONDU: 'Non répondu',
  EN_COURS: 'En cours',
  CONTACTE: 'Contacté',
};

export const STEP_LABELS: Record<ApplicationStep, string> = {
  APPLICATION_RECEIVED: 'Candidature reçue',
  STUDENT_CONTACTED: 'Étudiant contacté',
  DOSSIER_IN_PREPARATION: 'Dossier en préparation',
  DOSSIER_READY: 'Dossier préparé',
  UNIVERSITY_CONTACTED: 'Université contactée',
  UNIVERSITY_ACCEPTED: 'Accepté par l\'université',
  UNIVERSITY_REJECTED: 'Refusé par l\'université',
  VISA_PROCESSING: 'Traitement visa',
  VISA_ACCEPTED: 'Visa accordé',
  VISA_REJECTED: 'Visa refusé',
};

export const STEP_ORDER: ApplicationStep[] = [
  'APPLICATION_RECEIVED',
  'STUDENT_CONTACTED',
  'DOSSIER_IN_PREPARATION',
  'DOSSIER_READY',
  'UNIVERSITY_CONTACTED',
  'UNIVERSITY_ACCEPTED',
  'UNIVERSITY_REJECTED',
  'VISA_PROCESSING',
  'VISA_ACCEPTED',
  'VISA_REJECTED',
];

export interface Application {
  id: number;
  student: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  program: {
    id: number;
    title: string;
    university: string;
    country: string;
  };
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  studentPhone: string;
  studentNationality: string;
  budgetRange: BudgetRange;
  hasPassport: boolean;
  hasEnglishB2: boolean;
  hasFrenchB2: boolean;
  additionalNotes: string;
  status: ApplicationStatus;
  source: ApplicationSource;
  agencyName?: string;
  applicationStep: ApplicationStep;
  applicationDate: string;
  updatedAt: string;
}

export interface ApplicationRequest {
  budgetRange: BudgetRange;
  hasPassport: boolean;
  hasEnglishB2: boolean;
  hasFrenchB2: boolean;
  additionalNotes: string;
  source?: ApplicationSource;
  agencyName?: string;
}

export interface ApplicationsResponse {
  applications: Application[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export interface ApplicationStats {
  total: number;
  nonRepondu: number;
  enCours: number;
  contacte: number;
}
