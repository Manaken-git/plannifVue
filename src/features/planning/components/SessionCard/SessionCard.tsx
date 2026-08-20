import type { Seance } from '../../types/planning.types';
import './SessionCard.css';

interface Props {
  seance: Seance;
  top: number;
  height: number;
  onClick: () => void;
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(11, 16);
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function colorIndex(seance: Seance) {
  const source = seance.matiereNom || String(seance.id || 0);
  return [...source].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 5;
}

export function SessionCard({ seance, top, height, onClick }: Props) {
  return (
    <button
      type="button"
      className={`session-card session-card--${colorIndex(seance)}`}
      style={{ top, height }}
      onClick={onClick}
      title={`${seance.matiereNom || 'Séance'} · ${seance.professeurNomComplet || 'Professeur non assigné'}`}
    >
      <span className="session-card__time">{formatTime(seance.debut)} – {formatTime(seance.fin)}</span>
      <strong>{seance.matiereNom || 'Matière inconnue'}</strong>
      <span className="session-card__meta">{seance.professeurNomComplet || 'Enseignant non assigné'}</span>
      <span className="session-card__meta">{seance.classeNom || 'Classe non assignée'} · {seance.salleCode || 'Salle non assignée'}</span>
    </button>
  );
}
