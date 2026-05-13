// FeedbackButtons — Boutons pour noter les réponses du bot

import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, CheckCircle } from 'lucide-react';
import { sendFeedback } from '../services/chatbotService';

interface FeedbackButtonsProps {
  messageId: string;
  feedbackGiven: boolean;
  onFeedbackGiven: () => void;
}

const FeedbackButtons: React.FC<FeedbackButtonsProps> = ({
  messageId,
  feedbackGiven,
  onFeedbackGiven,
}) => {
  const [isSending, setIsSending] = useState(false);
  // Texte de confirmation affiché temporairement après feedback
  const [showThanks, setShowThanks] = useState(false);

  // Ne rien afficher si feedback déjà donné et la confirmation a disparu
  if (feedbackGiven && !showThanks) return null;

  const handleFeedback = async (rating: number) => {
    if (isSending || feedbackGiven) return;
    setIsSending(true);
    try {
      await sendFeedback(messageId, rating);
      onFeedbackGiven();
      setShowThanks(true);
      // Masquer le message de confirmation après 3 secondes
      setTimeout(() => setShowThanks(false), 3000);
    } catch {
      // Erreur silencieuse — le feedback n'est pas critique
    } finally {
      setIsSending(false);
    }
  };

  if (showThanks) {
    return (
      <span className="feedback-thanks" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <CheckCircle size={13} strokeWidth={1.75} /> Merci pour votre retour !
      </span>
    );
  }

  return (
    <div className="feedback-container">
      <button
        className="feedback-btn"
        onClick={() => handleFeedback(5)}
        disabled={isSending}
        aria-label="Réponse utile"
        type="button"
      >
        <ThumbsUp size={14} strokeWidth={1.75} />
      </button>
      <button
        className="feedback-btn"
        onClick={() => handleFeedback(1)}
        disabled={isSending}
        aria-label="Réponse pas utile"
        type="button"
      >
        <ThumbsDown size={14} strokeWidth={1.75} />
      </button>
    </div>
  );
};

export default React.memo(FeedbackButtons);
