import { Atom, BookOpen, Calculator, Globe2, Languages, Landmark } from 'lucide-react';
import type { Seance } from '../../types/planning.types';
import './SessionCard.css';

interface Props {
  seance: Seance;
  top: number;
  height: number;
  left?: number | string;
  width?: number | string;
  warning?: string;
  onClick: () => void;
}

const formatTime = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value.slice(11, 16)
    : date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

const colorIndex = (seance: Seance) =>
  [...(seance.matiereNom || String(seance.id || 0))].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 5;

function SubjectIcon({ name = '' }: { name?: string }) {
  const value = name.toLowerCase();
  if (value.includes('math')) return <Calculator size={13} />;
  if (value.includes('phys') || value.includes('bio')) return <Atom size={13} />;
  if (value.includes('anglais') || value.includes('fran')) return <Languages size={13} />;
  if (value.includes('histoire')) return <Landmark size={13} />;
  if (value.includes('géo')) return <Globe2 size={13} />;
  return <BookOpen size={13} />;
}

export function SessionCard({ seance, top, height, left, width, warning, onClick }: Props) {
  const customStyle: React.CSSProperties = {
    top,
    height,
    ...(left != null ? { left } : {}),
    ...(width != null ? { width } : {}),
  };

  return (
    <button
      type="button"
      className={`session-card session-card--${colorIndex(seance)}${warning ? ' has-warning' : ''}`}
      style={customStyle}
      onClick={onClick}
      title={`${seance.matiereNom || 'Séance'} · ${seance.professeurNomComplet || 'Professeur non assigné'}${warning ? ` — Alerte: ${warning}` : ''}`}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <span className="session-card__time">
          {formatTime(seance.debut)} – {formatTime(seance.fin)}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          {(seance.groupe || seance.groupeNom) && (
            <span style={{ fontSize: '9.5px', background: 'rgba(255,255,255,0.18)', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
              {seance.groupe || seance.groupeNom}
            </span>
          )}
          {(seance.type || seance.typeSeance) && (seance.type || seance.typeSeance) !== 'Cours' && (
            <span style={{ fontSize: '9px', background: 'rgba(59,130,246,0.3)', padding: '1px 4px', borderRadius: '4px', fontWeight: 600 }}>
              {seance.type || seance.typeSeance}
            </span>
          )}
          {(seance.alignementCode || seance.alignementId) && (
            <span title={`Alignement: ${seance.alignementCode || seance.alignementId}`} style={{ fontSize: '9px', background: 'rgba(168,85,247,0.3)', padding: '1px 4px', borderRadius: '4px' }}>
              ⚡
            </span>
          )}
        </div>
      </div>
      <span className="session-card__subject">
        <i><SubjectIcon name={seance.matiereNom} /></i>
        <strong>{seance.matiereNom || 'Matière inconnue'}</strong>
      </span>
      <span className="session-card__meta">
        {seance.professeurNomComplet || 'Enseignant non assigné'}
        {(seance.type === 'VIE_DE_CLASSE' || seance.matiereNom?.toLowerCase().includes('vie de classe')) && (
          <span style={{ marginLeft: 6, fontSize: '9px', background: '#fef3c7', color: '#b45309', padding: '1px 4px', borderRadius: 4, fontWeight: 700 }}>
            🌟 Référent
          </span>
        )}
      </span>
      <span className="session-card__meta">
        {seance.classeNom || 'Classe non assignée'} · {seance.salleCode || 'Salle non assignée'}
      </span>
    </button>
  );
}
