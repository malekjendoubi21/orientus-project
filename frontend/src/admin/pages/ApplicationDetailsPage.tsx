import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { applicationService } from '../../services/applicationService';
import { formatDateTime } from '../../utils/formatters';
import { ApplicationSource, ApplicationStep, BUDGET_LABELS, STEP_LABELS } from '../../models/Application';
import type { Application } from '../../models/Application';
import ApplicationTimeline from '../../components/ApplicationTimeline';

const ADVANCE_STEP_OPTIONS: { value: ApplicationStep; label: string }[] = [
  { value: 'STUDENT_CONTACTED',      label: 'Étudiant contacté' },
  { value: 'DOSSIER_IN_PREPARATION', label: 'Dossier en préparation' },
  { value: 'DOSSIER_READY',          label: 'Dossier préparé' },
  { value: 'UNIVERSITY_CONTACTED',   label: 'Université contactée' },
  { value: 'UNIVERSITY_ACCEPTED',    label: 'Accepté par l\'université ✅' },
  { value: 'UNIVERSITY_REJECTED',    label: 'Refusé par l\'université ❌' },
  { value: 'VISA_PROCESSING',        label: 'Traitement visa' },
  { value: 'VISA_ACCEPTED',          label: 'Visa accordé ✅' },
  { value: 'VISA_REJECTED',          label: 'Visa refusé ❌' },
];

const ApplicationDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedStep, setSelectedStep] = useState<ApplicationStep>('STUDENT_CONTACTED');

  useEffect(() => {
    let cancelled = false;
    const fetchApplication = async () => {
      if (!id) return;
      setIsLoading(true);
      setError('');
      try {
        const data = await applicationService.getApplicationById(Number(id));
        if (!cancelled) {
          setApplication(data);
          // Pre-select the next logical step
          const currentIdx = ADVANCE_STEP_OPTIONS.findIndex((o) => o.value === data.applicationStep);
          if (currentIdx !== -1 && currentIdx < ADVANCE_STEP_OPTIONS.length - 1) {
            setSelectedStep(ADVANCE_STEP_OPTIONS[currentIdx + 1].value);
          }
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load application');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchApplication();
    return () => { cancelled = true; };
  }, [id]);

  const handleAdvanceStep = async () => {
    if (!application) return;
    setActionLoading(true);
    try {
      const result = await applicationService.updateApplicationStep(application.id, selectedStep);
      setApplication(result.application);
      setSuccessMessage(`Étape mise à jour : ${STEP_LABELS[selectedStep]}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update step');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!application) return;
    setActionLoading(true);
    try {
      await applicationService.deleteApplication(application.id);
      navigate('/admin/applications');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete application');
      setActionLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-12 border border-slate-700/50 text-center">
        <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-semibold text-white mb-2">Candidature introuvable</h3>
        <p className="text-slate-400 mb-6">{error || "Cette candidature n'existe pas."}</p>
        <Link
          to="/admin/applications"
          className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
        >
          Retour aux candidatures
        </Link>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/applications')}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Détails de la candidature</h1>
            <p className="text-slate-400 text-sm mt-0.5">#{application.id} — {formatDateTime(application.applicationDate)}</p>
          </div>
        </div>
        {/* Source badge */}
        <div className="flex items-center gap-3">
          {application.source === ApplicationSource.AGENCY ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Via Agence{application.agencyName ? ` — ${application.agencyName}` : ''}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Candidature Directe
            </span>
          )}
        </div>
      </motion.div>

      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-sm"
        >
          {successMessage}
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Info */}
          <motion.div variants={itemVariants} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Informations de l'étudiant
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Nom complet</p>
                <p className="text-white font-medium">{application.studentFirstName} {application.studentLastName}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Email</p>
                <p className="text-white font-medium">{application.studentEmail}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Téléphone</p>
                <p className="text-white font-medium">{application.studentPhone || 'Non renseigné'}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Nationalité</p>
                <p className="text-white font-medium">{application.studentNationality || 'Non renseignée'}</p>
              </div>
            </div>
          </motion.div>

          {/* Program Info */}
          <motion.div variants={itemVariants} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Programme
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Programme</p>
                <p className="text-white font-medium">{application.program?.title}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Université</p>
                <p className="text-white font-medium">{application.program?.university}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4 sm:col-span-2">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Pays</p>
                <p className="text-white font-medium">{application.program?.country}</p>
              </div>
            </div>
          </motion.div>

          {/* Budget & Documents */}
          <motion.div variants={itemVariants} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Budget & Documents
            </h2>
            <div className="space-y-4">
              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Budget estimé</p>
                <p className="text-white font-semibold text-lg">{BUDGET_LABELS[application.budgetRange]}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { flag: application.hasPassport, label: 'Passeport' },
                  { flag: application.hasEnglishB2, label: 'Anglais B2' },
                  { flag: application.hasFrenchB2, label: 'Français B2' },
                ].map(({ flag, label }) => (
                  <div key={label} className={`rounded-lg p-4 text-center ${flag ? 'bg-green-500/10 border border-green-500/20' : 'bg-slate-700/30'}`}>
                    <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${flag ? 'bg-green-500/20' : 'bg-slate-600/50'}`}>
                      {flag ? (
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    <p className={`text-sm font-medium ${flag ? 'text-green-400' : 'text-slate-500'}`}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Additional Notes */}
          {application.additionalNotes && (
            <motion.div variants={itemVariants} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Notes supplémentaires
              </h2>
              <p className="text-slate-300 leading-relaxed whitespace-pre-line">{application.additionalNotes}</p>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Advance Step Block */}
          <motion.div variants={itemVariants} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Avancer le statut
            </h2>
            <div className="space-y-3">
              <select
                value={selectedStep}
                onChange={(e) => setSelectedStep(e.target.value as ApplicationStep)}
                className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
              >
                {ADVANCE_STEP_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button
                onClick={handleAdvanceStep}
                disabled={actionLoading || selectedStep === application.applicationStep}
                className="w-full py-2.5 px-4 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                Valider
              </button>
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div variants={itemVariants} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Timeline
            </h2>
            <ApplicationTimeline currentStep={application.applicationStep} variant="dark" />
          </motion.div>

          {/* Actions */}
          <motion.div variants={itemVariants} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-4">Actions</h2>
            <div className="space-y-3">
              <a
                href={`mailto:${application.studentEmail}?subject=Votre candidature - ${application.program?.title}`}
                className="w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Envoyer un email
              </a>
              <div className="border-t border-slate-700 pt-3">
                <button
                  onClick={() => setDeleteConfirm(true)}
                  disabled={actionLoading}
                  className="w-full py-2.5 px-4 bg-red-600/20 text-red-400 border border-red-500/30 font-medium rounded-lg hover:bg-red-600/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Supprimer la candidature
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-md w-full border border-slate-700"
          >
            <div className="text-center">
              <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Confirmer la suppression</h3>
              <p className="text-slate-400 text-sm mb-6">
                Êtes-vous sûr de vouloir supprimer cette candidature ? Cette action est irréversible.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="px-5 py-2.5 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  Supprimer
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default ApplicationDetailsPage;
