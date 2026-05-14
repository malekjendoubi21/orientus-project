import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { programService } from '../../services/programService';
import api from '../../services/api';
import { BudgetRange, BUDGET_LABELS } from '../../models/Application';
import type { Program } from '../../models/Program';
import { useAgencyAuth } from '../contexts/AgencyAuthContext';

type Step = 'program' | 'student' | 'details';

const AgencySubmitPage = () => {
  const { agencyUser } = useAgencyAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<Step>('program');

  // Programs
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  // Student info
  const [studentFirstName, setStudentFirstName] = useState('');
  const [studentLastName, setStudentLastName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentNationality, setStudentNationality] = useState('');

  // Application details
  const [budgetRange, setBudgetRange] = useState<BudgetRange | ''>('');
  const [hasPassport, setHasPassport] = useState(false);
  const [hasEnglishB2, setHasEnglishB2] = useState(false);
  const [hasFrenchB2, setHasFrenchB2] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchPrograms = useCallback(async () => {
    setIsLoadingPrograms(true);
    try {
      const data = await programService.getPrograms(currentPage, 12, {
        search: searchQuery || undefined,
        country: selectedCountry || undefined,
      });
      setPrograms(data.programs ?? []);
      setTotalPages(data.totalPages ?? 0);

      if (countries.length === 0) {
        const allData = await programService.getAllPrograms();
        if (allData?.filters?.countries) {
          setCountries(allData.filters.countries.sort());
        }
      }
    } catch {
      // fail silently
    } finally {
      setIsLoadingPrograms(false);
    }
  }, [currentPage, searchQuery, selectedCountry]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(0);
  };

  const handleCountryFilter = (c: string) => {
    setSelectedCountry(c);
    setCurrentPage(0);
  };

  const handleSelectProgram = (program: Program) => {
    setSelectedProgram(program);
    setCurrentStep('student');
    setError('');
  };

  const handleStudentNext = () => {
    if (!studentFirstName.trim() || !studentLastName.trim() || !studentEmail.trim()) {
      setError('Prénom, nom et email sont obligatoires.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(studentEmail)) {
      setError('Email invalide.');
      return;
    }
    setError('');
    setCurrentStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedProgram) { setError('Aucun programme sélectionné.'); return; }
    if (!budgetRange) { setError('Veuillez sélectionner un budget.'); return; }

    const agencyName = agencyUser
      ? `${agencyUser.firstName} ${agencyUser.lastName}`
      : 'Agence';

    setIsSubmitting(true);
    try {
      await api.post('/agency/applications', {
        programId: selectedProgram.id,
        studentFirstName,
        studentLastName,
        studentEmail,
        studentPhone,
        studentNationality,
        budgetRange,
        hasPassport,
        hasEnglishB2,
        hasFrenchB2,
        additionalNotes,
      }, {
        params: { agencyName },
      });

      navigate('/agency/applications');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Erreur lors de la soumission du dossier');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepLabels: Record<Step, string> = {
    program: '1. Choisir le programme',
    student: '2. Informations étudiant',
    details: '3. Dossier & soumission',
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Soumettre un dossier</h1>
        <p className="text-slate-400 mt-1">Candidature pour le compte de votre agence partenaire</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {(['program', 'student', 'details'] as Step[]).map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              currentStep === step
                ? 'bg-violet-600 text-white'
                : i < ['program', 'student', 'details'].indexOf(currentStep)
                ? 'bg-violet-600/30 text-violet-300'
                : 'bg-slate-800/50 text-slate-500'
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                i < ['program', 'student', 'details'].indexOf(currentStep)
                  ? 'bg-violet-500 text-white'
                  : currentStep === step
                  ? 'bg-white text-violet-600'
                  : 'bg-slate-700 text-slate-400'
              }`}>{i + 1}</span>
              <span className="hidden sm:inline">{stepLabels[step].slice(3)}</span>
            </div>
            {i < 2 && <div className="w-6 h-px bg-slate-700" />}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* ── STEP 1 : Choisir le programme ── */}
      {currentStep === 'program' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Rechercher un programme ou université..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-violet-500 text-sm transition-colors"
              />
            </div>
            <select
              value={selectedCountry}
              onChange={(e) => handleCountryFilter(e.target.value)}
              className="px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-violet-500 transition-colors min-w-[160px]"
            >
              <option value="">Tous les pays</option>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Programs grid */}
          {isLoadingPrograms ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
            </div>
          ) : programs.length === 0 ? (
            <div className="bg-slate-800/50 rounded-xl p-12 border border-slate-700/50 text-center">
              <p className="text-slate-400">Aucun programme trouvé.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {programs.map((program) => (
                <button
                  key={program.id}
                  onClick={() => handleSelectProgram(program)}
                  className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-violet-500/50 rounded-xl p-4 text-left transition-all group"
                >
                  {/* University logo */}
                  <div className="flex items-center gap-3 mb-3">
                    {program.universityLogo ? (
                      <img
                        src={program.universityLogo}
                        alt={program.university}
                        className="w-10 h-10 rounded-lg object-contain bg-white/10 p-1 flex-shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm leading-tight line-clamp-2 group-hover:text-violet-300 transition-colors">
                        {program.title}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-slate-400 text-xs truncate">{program.university}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {program.country}
                      </span>
                      <span className="px-1.5 py-0.5 bg-violet-500/20 text-violet-400 rounded text-xs font-medium">
                        {program.degree}
                      </span>
                      {program.language && (
                        <span className="px-1.5 py-0.5 bg-slate-700 text-slate-300 rounded text-xs">
                          {program.language}
                        </span>
                      )}
                    </div>
                    {program.tuition > 0 && (
                      <p className="text-emerald-400 text-xs font-semibold">{program.tuition.toLocaleString()}€/an</p>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-700/50">
                    <span className="text-violet-400 text-xs font-medium group-hover:text-violet-300">
                      Sélectionner ce programme →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg text-sm hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Précédent
              </button>
              <span className="text-slate-400 text-sm">
                Page {currentPage + 1} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
                className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg text-sm hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Suivant →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 2 : Informations étudiant ── */}
      {currentStep === 'student' && selectedProgram && (
        <div className="space-y-4 max-w-2xl">
          {/* Selected program recap */}
          <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-white font-semibold text-sm">{selectedProgram.title}</p>
              <p className="text-slate-400 text-xs">{selectedProgram.university} — {selectedProgram.country}</p>
            </div>
            <button
              onClick={() => { setSelectedProgram(null); setCurrentStep('program'); }}
              className="ml-auto text-slate-500 hover:text-red-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Student form */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Informations de l'étudiant</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Prénom *</label>
                <input type="text" value={studentFirstName} onChange={(e) => setStudentFirstName(e.target.value)} required
                  className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-violet-500 text-sm transition-colors"
                  placeholder="Ahmed" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Nom *</label>
                <input type="text" value={studentLastName} onChange={(e) => setStudentLastName(e.target.value)} required
                  className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-violet-500 text-sm transition-colors"
                  placeholder="Ben Ali" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email *</label>
                <input type="email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} required
                  className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-violet-500 text-sm transition-colors"
                  placeholder="ahmed@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Téléphone</label>
                <input type="tel" value={studentPhone} onChange={(e) => setStudentPhone(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-violet-500 text-sm transition-colors"
                  placeholder="+213 600 000 000" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Nationalité</label>
                <input type="text" value={studentNationality} onChange={(e) => setStudentNationality(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-violet-500 text-sm transition-colors"
                  placeholder="Algérienne, Tunisienne..." />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => { setCurrentStep('program'); setError(''); }}
              className="flex-1 py-3 bg-slate-700 text-slate-300 font-medium rounded-xl hover:bg-slate-600 transition-colors">
              ← Retour
            </button>
            <button onClick={handleStudentNext}
              className="flex-1 py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition-colors">
              Suivant →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3 : Dossier & Soumission ── */}
      {currentStep === 'details' && selectedProgram && (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
          {/* Recap */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-1">Programme</p>
              <p className="text-white text-sm font-semibold line-clamp-1">{selectedProgram.title}</p>
              <p className="text-slate-400 text-xs">{selectedProgram.university}</p>
            </div>
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-1">Étudiant</p>
              <p className="text-white text-sm font-semibold">{studentFirstName} {studentLastName}</p>
              <p className="text-slate-400 text-xs">{studentEmail}</p>
            </div>
          </div>

          {/* Budget */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Budget annuel estimé *</h2>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(BUDGET_LABELS).map(([value, label]) => (
                <button key={value} type="button" onClick={() => setBudgetRange(value as BudgetRange)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                    budgetRange === value
                      ? 'bg-violet-600 border-violet-600 text-white'
                      : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-violet-500/50 hover:text-white'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Documents disponibles</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { state: hasPassport, setter: setHasPassport, label: 'Passeport' },
                { state: hasEnglishB2, setter: setHasEnglishB2, label: 'Anglais B2' },
                { state: hasFrenchB2, setter: setHasFrenchB2, label: 'Français B2' },
              ].map(({ state, setter, label }) => (
                <button key={label} type="button" onClick={() => setter(!state)}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg border transition-all ${
                    state
                      ? 'bg-green-500/20 border-green-500/40 text-green-400'
                      : 'bg-slate-700/30 border-slate-600 text-slate-500 hover:border-slate-500'
                  }`}>
                  <span className="text-xl">{state ? '✅' : '○'}</span>
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Notes supplémentaires</h2>
            <textarea value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} rows={3}
              className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-violet-500 text-sm transition-colors resize-none"
              placeholder="Informations complémentaires sur l'étudiant..." />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => { setCurrentStep('student'); setError(''); }}
              className="flex-1 py-3 bg-slate-700 text-slate-300 font-medium rounded-xl hover:bg-slate-600 transition-colors">
              ← Retour
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex-1 py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {isSubmitting ? 'Envoi...' : 'Soumettre le dossier'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AgencySubmitPage;
