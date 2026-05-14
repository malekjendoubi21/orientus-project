import { ApplicationStep, STEP_LABELS } from '../models/Application';

interface TimelineStep {
  key: ApplicationStep;
  label: string;
  shortLabel: string;
  isTerminal?: boolean;
  terminalType?: 'success' | 'danger';
}

const TIMELINE_STEPS: TimelineStep[] = [
  { key: 'APPLICATION_RECEIVED',   label: 'Candidature reçue',        shortLabel: 'Reçue' },
  { key: 'STUDENT_CONTACTED',      label: 'Étudiant contacté',         shortLabel: 'Contacté' },
  { key: 'DOSSIER_IN_PREPARATION', label: 'Dossier en préparation',    shortLabel: 'Dossier...' },
  { key: 'DOSSIER_READY',          label: 'Dossier préparé',           shortLabel: 'Prêt' },
  { key: 'UNIVERSITY_CONTACTED',   label: 'Université contactée',      shortLabel: 'Univ.' },
  { key: 'UNIVERSITY_ACCEPTED',    label: 'Accepté par l\'université', shortLabel: 'Accepté', isTerminal: true, terminalType: 'success' },
  { key: 'UNIVERSITY_REJECTED',    label: 'Refusé par l\'université',  shortLabel: 'Refusé',  isTerminal: true, terminalType: 'danger' },
  { key: 'VISA_PROCESSING',        label: 'Traitement visa',           shortLabel: 'Visa...' },
  { key: 'VISA_ACCEPTED',          label: 'Visa accordé',              shortLabel: 'Visa ✓',  isTerminal: true, terminalType: 'success' },
  { key: 'VISA_REJECTED',          label: 'Visa refusé',               shortLabel: 'Visa ✗',  isTerminal: true, terminalType: 'danger' },
];

const STEP_INDEX: Record<ApplicationStep, number> = Object.fromEntries(
  TIMELINE_STEPS.map((s, i) => [s.key, i])
) as Record<ApplicationStep, number>;

function getStepStatus(stepKey: ApplicationStep, currentStep: ApplicationStep): 'done' | 'active' | 'pending' {
  const stepIdx = STEP_INDEX[stepKey];
  const currentIdx = STEP_INDEX[currentStep];
  if (stepIdx < currentIdx) return 'done';
  if (stepIdx === currentIdx) return 'active';
  return 'pending';
}

interface ApplicationTimelineProps {
  currentStep: ApplicationStep;
  variant?: 'dark' | 'light';
  compact?: boolean;
}

const ApplicationTimeline = ({ currentStep, variant = 'light', compact = false }: ApplicationTimelineProps) => {
  const isDark = variant === 'dark';

  const mainSteps = TIMELINE_STEPS.filter(
    (s) => !['UNIVERSITY_REJECTED', 'VISA_REJECTED'].includes(s.key)
  );

  const isRejected =
    currentStep === 'UNIVERSITY_REJECTED' || currentStep === 'VISA_REJECTED';

  const displaySteps = isRejected
    ? TIMELINE_STEPS.filter((s) => {
        const idx = STEP_INDEX[s.key];
        const curIdx = STEP_INDEX[currentStep];
        return idx <= curIdx;
      })
    : mainSteps;

  if (compact) {
    return (
      <div className="w-full overflow-x-auto">
        <div className="flex items-center gap-0 min-w-max py-2">
          {displaySteps.map((step, i) => {
            const status = getStepStatus(step.key, currentStep);
            const isLast = i === displaySteps.length - 1;

            return (
              <div key={step.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                      status === 'done'
                        ? isDark
                          ? 'bg-violet-600 border-violet-600 text-white'
                          : 'bg-blue-600 border-blue-600 text-white'
                        : status === 'active'
                        ? step.terminalType === 'success'
                          ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-400/30'
                          : step.terminalType === 'danger'
                          ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-400/30'
                          : isDark
                          ? 'bg-violet-500 border-violet-400 text-white shadow-lg shadow-violet-400/30 animate-pulse'
                          : 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-400/30 animate-pulse'
                        : isDark
                        ? 'bg-slate-700 border-slate-600 text-slate-500'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    }`}
                  >
                    {status === 'done' ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : status === 'active' && step.terminalType === 'danger' ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <span>{i + 1}</span>
                    )}
                  </div>
                  <span
                    className={`mt-1.5 text-[10px] font-medium text-center w-14 leading-tight ${
                      status === 'active'
                        ? step.terminalType === 'success'
                          ? 'text-green-500'
                          : step.terminalType === 'danger'
                          ? 'text-red-500'
                          : isDark
                          ? 'text-violet-400'
                          : 'text-blue-600'
                        : status === 'done'
                        ? isDark
                          ? 'text-slate-300'
                          : 'text-gray-600'
                        : isDark
                        ? 'text-slate-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.shortLabel}
                  </span>
                </div>
                {!isLast && (
                  <div
                    className={`w-6 h-0.5 mb-5 flex-shrink-0 ${
                      status === 'done'
                        ? isDark
                          ? 'bg-violet-600'
                          : 'bg-blue-500'
                        : isDark
                        ? 'bg-slate-700'
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col gap-3">
        {TIMELINE_STEPS.map((step) => {
          const status = getStepStatus(step.key, currentStep);
          const isSkipped =
            (step.key === 'UNIVERSITY_REJECTED' && currentStep !== 'UNIVERSITY_REJECTED') ||
            (step.key === 'VISA_REJECTED' && currentStep !== 'VISA_REJECTED');

          if (isSkipped && status === 'pending') return null;

          return (
            <div key={step.key} className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all ${
                  status === 'done'
                    ? isDark
                      ? 'bg-violet-600 border-violet-600 text-white'
                      : 'bg-blue-600 border-blue-600 text-white'
                    : status === 'active'
                    ? step.terminalType === 'success'
                      ? 'bg-green-500 border-green-500 text-white shadow-md shadow-green-400/30'
                      : step.terminalType === 'danger'
                      ? 'bg-red-500 border-red-500 text-white shadow-md shadow-red-400/30'
                      : isDark
                      ? 'bg-violet-500 border-violet-400 text-white animate-pulse'
                      : 'bg-blue-500 border-blue-400 text-white animate-pulse'
                    : isDark
                    ? 'bg-slate-700/50 border-slate-600 text-slate-500'
                    : 'bg-gray-100 border-gray-200 text-gray-400'
                }`}
              >
                {status === 'done' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : status === 'active' && step.terminalType === 'danger' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : status === 'active' && step.terminalType === 'success' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    status === 'active'
                      ? 'bg-white'
                      : isDark ? 'bg-slate-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
              <div>
                <p
                  className={`text-sm font-medium ${
                    status === 'active'
                      ? step.terminalType === 'success'
                        ? 'text-green-500'
                        : step.terminalType === 'danger'
                        ? 'text-red-400'
                        : isDark
                        ? 'text-white'
                        : 'text-blue-700'
                      : status === 'done'
                      ? isDark
                        ? 'text-slate-300'
                        : 'text-gray-700'
                      : isDark
                      ? 'text-slate-600'
                      : 'text-gray-400'
                  }`}
                >
                  {STEP_LABELS[step.key]}
                </p>
                {status === 'active' && (
                  <span
                    className={`text-xs font-semibold ${
                      step.terminalType === 'success'
                        ? 'text-green-500'
                        : step.terminalType === 'danger'
                        ? 'text-red-400'
                        : isDark
                        ? 'text-violet-400'
                        : 'text-blue-600'
                    }`}
                  >
                    {step.terminalType ? (step.terminalType === 'success' ? '✅ Étape finale' : '❌ Étape finale') : '⏳ En cours'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApplicationTimeline;
