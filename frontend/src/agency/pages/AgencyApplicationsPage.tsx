import { useState, useEffect, useCallback } from 'react';
import { applicationService } from '../../services/applicationService';
import { formatDateShort } from '../../utils/formatters';
import { BUDGET_LABELS, STEP_LABELS } from '../../models/Application';
import type { Application } from '../../models/Application';
import ApplicationTimeline from '../../components/ApplicationTimeline';
import { useAgencyAuth } from '../contexts/AgencyAuthContext';

const stepBadgeStyles: Record<string, string> = {
  APPLICATION_RECEIVED:   'bg-blue-500/20 text-blue-400 border-blue-500/30',
  STUDENT_CONTACTED:      'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  DOSSIER_IN_PREPARATION: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  DOSSIER_READY:          'bg-yellow-600/20 text-yellow-300 border-yellow-600/30',
  UNIVERSITY_CONTACTED:   'bg-purple-500/20 text-purple-400 border-purple-500/30',
  UNIVERSITY_ACCEPTED:    'bg-green-500/20 text-green-400 border-green-500/30',
  UNIVERSITY_REJECTED:    'bg-red-500/20 text-red-400 border-red-500/30',
  VISA_PROCESSING:        'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  VISA_ACCEPTED:          'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  VISA_REJECTED:          'bg-red-600/20 text-red-400 border-red-600/30',
};

const AgencyApplicationsPage = () => {
  const { agencyUser } = useAgencyAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const agencyName = agencyUser
    ? `${agencyUser.firstName} ${agencyUser.lastName}`
    : '';

  const fetchApplications = useCallback(async () => {
    if (!agencyName) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await applicationService.getAgencyApplications(agencyName, currentPage, 10);
      setApplications(data.applications);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des dossiers');
    } finally {
      setIsLoading(false);
    }
  }, [agencyName, currentPage]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const filtered = applications.filter((app) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      app.studentFirstName?.toLowerCase().includes(q) ||
      app.studentLastName?.toLowerCase().includes(q) ||
      app.studentEmail?.toLowerCase().includes(q) ||
      app.program?.title?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Mes Dossiers</h1>
        <p className="text-slate-400 mt-1">{totalItems} dossier{totalItems !== 1 ? 's' : ''} soumis</p>
      </div>

      {/* Search */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher par nom, email ou programme..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-12 border border-slate-700/50 text-center">
          <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-white mb-2">Aucun dossier</h3>
          <p className="text-slate-400">Vous n'avez pas encore soumis de dossiers.</p>
        </div>
      )}

      {/* Cards */}
      {!isLoading && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((app) => (
            <div key={app.id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
              {/* Card Header */}
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <h3 className="text-base font-bold text-white">
                        {app.studentFirstName} {app.studentLastName}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">
                      {app.program?.title} — {app.program?.university}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${stepBadgeStyles[app.applicationStep] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        {STEP_LABELS[app.applicationStep] ?? app.applicationStep}
                      </span>
                      <span className="text-xs text-slate-500">{formatDateShort(app.applicationDate)}</span>
                      <span className="text-xs text-slate-500">{BUDGET_LABELS[app.budgetRange]}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white text-xs font-medium transition-all flex-shrink-0"
                  >
                    <span>{expandedId === app.id ? 'Masquer' : 'Voir suivi'}</span>
                    <svg
                      className={`w-3.5 h-3.5 transition-transform ${expandedId === app.id ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Compact timeline always visible */}
                <div className="mt-5 pt-4 border-t border-slate-700/50">
                  <ApplicationTimeline currentStep={app.applicationStep} variant="dark" compact />
                </div>
              </div>

              {/* Expanded timeline */}
              {expandedId === app.id && (
                <div className="border-t border-slate-700/50 px-6 py-5 bg-slate-900/50">
                  <h4 className="text-sm font-semibold text-slate-300 mb-4">Détail du suivi</h4>
                  <ApplicationTimeline currentStep={app.applicationStep} variant="dark" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">Page {currentPage + 1} sur {totalPages}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="px-3 py-1.5 bg-slate-700/50 text-slate-300 rounded-lg text-sm hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Précédent
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="px-3 py-1.5 bg-slate-700/50 text-slate-300 rounded-lg text-sm hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencyApplicationsPage;
