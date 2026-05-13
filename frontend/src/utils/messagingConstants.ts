export const conversationStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'En attente', color: 'text-amber-400', bg: 'bg-amber-500/20' },
  ACTIVE: { label: 'Actif', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  REJECTED: { label: 'Refusé', color: 'text-red-400', bg: 'bg-red-500/20' },
  CLOSED: { label: 'Fermé', color: 'text-slate-400', bg: 'bg-slate-500/20' },
};
