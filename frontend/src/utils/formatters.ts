/**
 * Date relative : "il y a 5 min", "il y a 2h", "hier", "12/03"
 */
export const relativeDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  if (hours < 24) return `il y a ${hours}h`;
  if (days === 1) return 'hier';
  if (days < 7) return `il y a ${days}j`;
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
};

/**
 * Séparateur de date : "Aujourd'hui", "Hier", "12 Mars 2026"
 */
export const dateSeparator = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = today.getTime() - messageDay.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) return "Aujourd'hui";
  if (days === 1) return 'Hier';
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
};

/**
 * Heure seule : "14:32"
 */
export const timeStr = (dateStr: string): string => {
  return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

/**
 * Date formatée complète : "12 mars 2026"
 */
export const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Date avec heure : "12 mars 2026, 14:32"
 */
export const formatDateTime = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Date courte : "12/03/2026"
 */
export const formatDateShort = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('fr-FR');
};

/**
 * Tronquer un texte
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
