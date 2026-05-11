import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import type { Program, SortOption } from '../models/Program';
import { DEGREE_LABELS, CATEGORY_LABELS, LANGUAGE_OPTIONS } from '../models/Program';
import { usePrograms } from '../hooks/usePrograms';
import { SkeletonProgramGrid, SkeletonSearchBar, SkeletonFilterSidebar, LoadingMessage } from '../components/SkeletonCard';

// ─── Multi-select state (arrays) ─────────────────────────────────────
interface MultiFilters {
  countries: string[];
  degrees: string[];
  categories: string[];
  language: string;
  search: string;
}

const EMPTY: MultiFilters = { countries: [], degrees: [], categories: [], language: '', search: '' };

function toggle(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
}

// ─── Program Card ────────────────────────────────────────────────────
const ProgramCard = React.memo(({ program }: { program: Program }) => (
  <div className="program-card bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col">
    <div className="relative h-44 flex-shrink-0">
      <img
        src={program.image || 'https://images.unsplash.com/photo-1562774053-701939374585?w=400'}
        alt={program.title}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      {program.universityLogo && (
        <div className="absolute bottom-3 left-3 w-12 h-12 bg-white rounded-lg shadow p-1.5 flex items-center justify-center">
          <img src={program.universityLogo} alt={program.university} className="w-full h-full object-contain" />
        </div>
      )}
      {program.featured && (
        <div className="absolute top-3 right-3 px-2 py-0.5 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full">⭐ Top</div>
      )}
    </div>
    <div className="p-4 flex flex-col flex-1">
      <p className="text-xs text-gray-500 mb-1 truncate">{program.university}</p>
      <h3 className="font-bold text-base text-blue-600 mb-1 line-clamp-2">
        <Link to={`/programs/${program.id}`}>{program.title}</Link>
      </h3>
      <p className="text-xs text-gray-500 mb-3">📍 {program.city}, {program.country}</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">{DEGREE_LABELS[program.degree] || program.degree}</span>
        {program.duration && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">⏱ {program.duration}</span>}
        {program.tuition ? <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">💰 {program.tuition.toLocaleString()}€/an</span> : null}
      </div>
      <p className="text-xs text-gray-500 line-clamp-2 flex-1">{program.description}</p>
      <Link to={`/programs/${program.id}`} className="mt-3 inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm">
        Voir le programme <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
      </Link>
    </div>
  </div>
));
ProgramCard.displayName = 'ProgramCard';

// ─── Filter checkbox row ─────────────────────────────────────────────
const CheckItem = ({ label, checked, count, onChange }: { label: string; checked: boolean; count?: number; onChange: () => void }) => (
  <label onClick={onChange} className="flex items-center justify-between cursor-pointer group py-1 rounded-lg px-2 hover:bg-blue-50 transition-colors">
    <div className="flex items-center gap-2">
      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${checked ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-400'}`}>
        {checked && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
      </div>
      <span className={`text-sm ${checked ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>{label}</span>
    </div>
    {count !== undefined && <span className="text-xs text-gray-400 ml-1">({count})</span>}
  </label>
);

// ─── Collapsible section ─────────────────────────────────────────────
const Section = ({ title, badge, open, onToggle, children }: { title: string; badge?: number; open: boolean; onToggle: () => void; children: React.ReactNode }) => (
  <div className="border-b border-gray-100 py-3">
    <button onClick={onToggle} className="flex items-center justify-between w-full text-left mb-1">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-800 text-sm">{title}</span>
        {badge ? <span className="px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full">{badge}</span> : null}
      </div>
      <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
    </button>
    <AnimatePresence>
      {open && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
          <div className="max-h-56 overflow-y-auto pr-1 space-y-0.5 scrollbar-thin">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────
const ProgramsPage = () => {
  const [, setSearchParams] = useSearchParams();
  const [mf, setMf] = useState<MultiFilters>(EMPTY);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState({ degree: true, category: true, country: false, language: false });

  const { programs, totalItems, totalPages, currentPage, isLoading, isFetching, filters, filterCounts, setPage, setFilters, setSortBy, sortBy, resetFilters: hookReset, mode, isFirstLoad, error, refetch } = usePrograms();

  // Convert multi-filters → single string for hook
  const applyFilters = useCallback((next: MultiFilters) => {
    setMf(next);
    setFilters({
      search: next.search,
      country: next.countries.join(','),
      degree: next.degrees.join(','),
      category: next.categories.join(','),
      language: next.language,
    });
  }, [setFilters]);

  const handleSearch = (v: string) => {
    const next = { ...mf, search: v };
    setMf(next);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => applyFilters(next), 300);
  };

  useEffect(() => () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); }, []);

  const reset = () => { setMf(EMPTY); hookReset(); setSearchParams(new URLSearchParams()); };

  const toggleCountry  = (v: string) => applyFilters({ ...mf, countries:  toggle(mf.countries,  v) });
  const toggleDegree   = (v: string) => applyFilters({ ...mf, degrees:    toggle(mf.degrees,    v) });
  const toggleCategory = (v: string) => applyFilters({ ...mf, categories: toggle(mf.categories, v) });
  const toggleLang     = (v: string) => applyFilters({ ...mf, language:   mf.language === v ? '' : v });
  const tog = (k: keyof typeof open) => setOpen(p => ({ ...p, [k]: !p[k] }));

  const activeCount = mf.countries.length + mf.degrees.length + mf.categories.length + (mf.language ? 1 : 0);
  const countryOptions = filters.countries.length > 0 ? filters.countries : [];
  const getCount = (type: 'byDegree' | 'byCategory' | 'byCountry' | 'byLanguage', k: string) => filterCounts[type]?.[k];

  // ─── Sidebar content ─────────────────────────────────────────────
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-gray-900">Filtres</h2>
          {activeCount > 0 && <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">{activeCount}</span>}
        </div>
        {activeCount > 0 && (
          <button onClick={reset} className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            Réinitialiser
          </button>
        )}
      </div>

      {/* Active pills */}
      {activeCount > 0 && (
        <div className="px-4 py-3 flex flex-wrap gap-1.5 border-b border-gray-100 flex-shrink-0">
          {mf.countries.map(c => (
            <span key={c} onClick={() => toggleCountry(c)} className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs cursor-pointer hover:bg-blue-200">
              🌍 {c} <span className="text-blue-400 hover:text-blue-700">×</span>
            </span>
          ))}
          {mf.degrees.map(d => (
            <span key={d} onClick={() => toggleDegree(d)} className="flex items-center gap-1 px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full text-xs cursor-pointer hover:bg-violet-200">
              🎓 {DEGREE_LABELS[d] || d} <span>×</span>
            </span>
          ))}
          {mf.categories.map(c => (
            <span key={c} onClick={() => toggleCategory(c)} className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs cursor-pointer hover:bg-green-200">
              📚 {CATEGORY_LABELS[c] || c} <span>×</span>
            </span>
          ))}
          {mf.language && (
            <span onClick={() => toggleLang(mf.language)} className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs cursor-pointer hover:bg-amber-200">
              🗣 {mf.language} <span>×</span>
            </span>
          )}
        </div>
      )}

      {/* Scrollable filter sections */}
      <div className="flex-1 overflow-y-auto px-4 py-1">
        <Section title="Type de diplôme" badge={mf.degrees.length || undefined} open={open.degree} onToggle={() => tog('degree')}>
          {Object.entries(DEGREE_LABELS).map(([v, l]) => (
            <CheckItem key={v} label={l} checked={mf.degrees.includes(v)} count={getCount('byDegree', v)} onChange={() => toggleDegree(v)} />
          ))}
        </Section>

        <Section title="Domaine d'études" badge={mf.categories.length || undefined} open={open.category} onToggle={() => tog('category')}>
          {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
            <CheckItem key={v} label={l} checked={mf.categories.includes(v)} count={getCount('byCategory', v)} onChange={() => toggleCategory(v)} />
          ))}
        </Section>

        <Section title="Pays" badge={mf.countries.length || undefined} open={open.country} onToggle={() => tog('country')}>
          {countryOptions.map(c => (
            <CheckItem key={c} label={c} checked={mf.countries.includes(c)} count={getCount('byCountry', c)} onChange={() => toggleCountry(c)} />
          ))}
        </Section>

        <Section title="Langue" badge={mf.language ? 1 : undefined} open={open.language} onToggle={() => tog('language')}>
          {LANGUAGE_OPTIONS.map(l => (
            <CheckItem key={l} label={l} checked={mf.language === l} onChange={() => toggleLang(l)} />
          ))}
        </Section>
      </div>
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-yellow-50 min-h-screen">
      <style>{`.program-card:hover { transform: translateY(-3px); }`}</style>

      {/* Main layout with proper top padding for navbar + banner */}
      <div className="pt-36 pb-6 min-h-screen flex flex-col">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col flex-1 min-h-0">

          {/* Page header */}
          <div className="flex-shrink-0 pb-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                    {isLoading ? (
                      <span className="inline-block w-24 h-8 bg-gray-200 rounded animate-pulse" />
                    ) : (
                      <>{totalItems.toLocaleString()}<span className="text-blue-600">+</span></>
                    )}
                  </h1>
                  <span className="text-xl sm:text-2xl font-semibold text-gray-700">Programmes</span>
                </div>
                <p className="text-gray-500 text-sm mt-2 flex items-center gap-2 font-medium">
                  <span>🏛 {filters.countries.length > 0 ? 'Universités du monde entier' : 'Universités partenaires'}</span>
                  <span className="text-gray-300">—</span>
                  <span>🌍 {filters.countries.length > 0 ? `${filters.countries.length} pays` : '14 pays'}</span>
                </p>
              </div>
              {/* Mobile filter button */}
              <button onClick={() => setIsFilterOpen(true)} className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex-shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
                Filtres {activeCount > 0 && <span className="px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full">{activeCount}</span>}
              </button>
            </div>
          </div>

          <LoadingMessage isFirstLoad={isFirstLoad && isLoading} />

          {/* Main 2-column layout — each column scrolls independently */}
          <div className="flex gap-6 flex-1" style={{ minHeight: 0, height: 'calc(100vh - 260px)' }}>

            {/* ── Sidebar Desktop ── */}
            <aside className="hidden lg:flex flex-col w-72 flex-shrink-0 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              {isLoading ? <SkeletonFilterSidebar /> : sidebarContent}
            </aside>

            {/* ── Main content ── */}
            <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Search + sort bar */}
              <div className="flex-shrink-0 mb-4">
                {isLoading ? <SkeletonSearchBar /> : (
                  <div className="bg-white rounded-xl shadow-md p-3 flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                      <input
                        type="text"
                        placeholder="Rechercher un programme, une université..."
                        value={mf.search}
                        onChange={e => handleSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-gray-400 text-sm hidden sm:block">Trier:</span>
                      <select value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)} className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                        <option value="recommended">Recommandé</option>
                        <option value="newest">Plus récent</option>
                        <option value="titleAsc">A → Z</option>
                        <option value="titleDesc">Z → A</option>
                        <option value="tuitionAsc">Frais ↑</option>
                        <option value="tuitionDesc">Frais ↓</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Fetching indicator */}
              {isFetching && !isLoading && (
                <div className="flex-shrink-0 mb-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center gap-3 text-sm text-blue-700">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"/>
                  Mise à jour...{mode === 'all' ? ' (filtrage instantané)' : ''}
                </div>
              )}

              {/* Programs grid — scrollable */}
              <div className="flex-1 overflow-y-auto pr-1">
                {isLoading ? (
                  <SkeletonProgramGrid count={6} />
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-xl text-center">
                    <p className="mb-3">{error instanceof Error ? error.message : 'Erreur de chargement'}</p>
                    <button onClick={() => refetch()} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Réessayer</button>
                  </div>
                ) : programs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun programme trouvé</h3>
                    <p className="text-gray-500 mb-4 text-sm">Essayez d'ajuster vos filtres</p>
                    <button onClick={reset} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Réinitialiser les filtres</button>
                  </div>
                ) : (
                  <>
                    <div className={`grid md:grid-cols-2 xl:grid-cols-2 gap-4 transition-opacity duration-200 ${isFetching && !isLoading ? 'opacity-60' : ''}`}>
                      {programs.map(p => <ProgramCard key={p.id} program={p} />)}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-6 pb-4">
                        <button onClick={() => setPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0}
                          className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                        </button>
                        {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                          let p = i;
                          if (totalPages > 7) {
                            if (currentPage < 4) p = i;
                            else if (currentPage > totalPages - 5) p = totalPages - 7 + i;
                            else p = currentPage - 3 + i;
                          }
                          return (
                            <button key={p} onClick={() => setPage(p)}
                              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${currentPage === p ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-700 hover:bg-blue-50'}`}>
                              {p + 1}
                            </button>
                          );
                        })}
                        <button onClick={() => setPage(Math.min(totalPages - 1, currentPage + 1))} disabled={currentPage === totalPages - 1}
                          className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                        </button>
                      </div>
                    )}

                    {/* CTA */}
                    <div className="mt-4 mb-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">🎓</div>
                        <div>
                          <h3 className="font-bold">Trouvez votre programme idéal</h3>
                          <p className="text-blue-100 text-sm">Notre IA vous recommande les meilleurs choix</p>
                        </div>
                      </div>
                      <Link to="/recommendations" className="px-5 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap text-sm">
                        Commencer →
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* ── Mobile sidebar overlay ── */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setIsFilterOpen(false)}>
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.25 }}
              className="absolute left-0 top-0 h-full w-80 bg-white flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-white">
                <h2 className="font-bold text-gray-900">Filtres {activeCount > 0 && <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">{activeCount}</span>}</h2>
                <div className="flex items-center gap-2">
                  {activeCount > 0 && <button onClick={reset} className="text-xs text-red-500 font-medium">Réinitialiser</button>}
                  <button onClick={() => setIsFilterOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">{sidebarContent}</div>
              <div className="flex-shrink-0 p-4 border-t border-gray-100">
                <button onClick={() => setIsFilterOpen(false)} className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 transition-colors">
                  Voir {totalItems} résultats
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProgramsPage;
