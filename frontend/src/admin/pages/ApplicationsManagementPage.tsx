import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { applicationService } from '../../services/applicationService';
import { formatDateShort } from '../../utils/formatters';
import { ApplicationSource, BUDGET_LABELS, STEP_LABELS } from '../../models/Application';
import type { Application } from '../../models/Application';

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

type SourceTab = 'DIRECT' | 'AGENCY';

const ApplicationsManagementPage = () => {
  const [activeTab, setActiveTab] = useState<SourceTab>('DIRECT');
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const source = activeTab as ApplicationSource;
      const data = await applicationService.getApplications(currentPage, 10, undefined, source);
      setApplications(data.applications);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
    } catch (err) {
      if (import.meta.env.DEV) console.error('Error fetching applications:', err);
      setError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, activeTab]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleTabChange = (tab: SourceTab) => {
    setActiveTab(tab);
    setCurrentPage(0);
    setSearchQuery('');
  };

  const handleDelete = async (id: number) => {
    setActionLoading(id);
    try {
      await applicationService.deleteApplication(id);
      setDeleteConfirm(null);
      setSuccessMessage('Candidature supprimée avec succès');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchApplications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete application');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      app.studentFirstName?.toLowerCase().includes(q) ||
      app.studentLastName?.toLowerCase().includes(q) ||
      app.studentEmail?.toLowerCase().includes(q) ||
      app.program?.title?.toLowerCase().includes(q) ||
      app.program?.university?.toLowerCase().includes(q) ||
      (activeTab === 'AGENCY' && app.agencyName?.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestion des candidatures</h1>
          <p className="text-slate-400 mt-1">{totalItems} candidature{totalItems !== 1 ? 's' : ''} — {activeTab === 'DIRECT' ? 'Directes' : 'Via Agences'}</p>
        </div>
      </div>

      {/* Tab Toggle */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-1.5 border border-slate-700/50 inline-flex gap-1">
        <button
          onClick={() => handleTabChange('DIRECT')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'DIRECT'
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Candidatures Directes
        </button>
        <button
          onClick={() => handleTabChange('AGENCY')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'AGENCY'
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Candidatures Agences
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-sm">
          {successMessage}
        </div>
      )}

      {/* Search */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder={activeTab === 'AGENCY' ? "Rechercher par nom, email, programme ou agence..." : "Rechercher par nom, email ou programme..."}
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredApplications.length === 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-12 border border-slate-700/50 text-center">
          <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-white mb-2">Aucune candidature</h3>
          <p className="text-slate-400">
            {activeTab === 'DIRECT'
              ? "Aucune candidature directe pour le moment."
              : "Aucune candidature soumise par des agences pour le moment."}
          </p>
        </div>
      )}

      {/* Table */}
      {!isLoading && filteredApplications.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Étudiant</th>
                  {activeTab === 'AGENCY' && (
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Agence</th>
                  )}
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Programme</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Budget</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Étape</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-300 whitespace-nowrap">
                      {formatDateShort(app.applicationDate)}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {app.studentFirstName} {app.studentLastName}
                        </p>
                        <p className="text-xs text-slate-400">{app.studentEmail}</p>
                      </div>
                    </td>
                    {activeTab === 'AGENCY' && (
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {app.agencyName || '—'}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-white truncate max-w-[180px]">{app.program?.title}</p>
                        <p className="text-xs text-slate-400">{app.program?.university}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300 whitespace-nowrap">
                      {BUDGET_LABELS[app.budgetRange]}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${stepBadgeStyles[app.applicationStep] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
                        {STEP_LABELS[app.applicationStep] ?? app.applicationStep}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/applications/${app.id}`}
                          className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                          title="Voir les détails"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(app.id)}
                          disabled={actionLoading === app.id}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-slate-400 hover:text-red-400"
                          title="Supprimer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
              <p className="text-sm text-slate-400">
                Page {currentPage + 1} sur {totalPages}
              </p>
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
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-md w-full border border-slate-700">
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
                  onClick={() => setDeleteConfirm(null)}
                  className="px-5 py-2.5 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={actionLoading === deleteConfirm}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading === deleteConfirm && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsManagementPage;
