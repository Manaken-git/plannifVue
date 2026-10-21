import {
  Atom,
  BookOpen,
  Calculator,
  Clock,
  Globe2,
  Landmark,
  Languages,
  Lock,
  Unlock,
} from 'lucide-react';
import { useState } from 'react';
import type { Seance } from '../../types/planning.types';
import './SessionCard.css';

interface Props {
  seance: Seance;
  top: number;
  height: number;
  left?: number | string;
  width?: number | string;
  isNarrow?: boolean;
  isRightAligned?: boolean;
  warning?: string;
  onClick: () => void;
  onTogglePin?: (seance: Seance) => void;
  onOpenQuickPopover?: (seance: Seance, rect: DOMRect) => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, seance: Seance) => void;
  onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
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

export function SessionCard({
  seance,
  top,
  height,
  left,
  width,
  isNarrow,
  isRightAligned,
  warning,
  onClick,
  onTogglePin,
  onOpenQuickPopover,
  onDragStart,
  onDragEnd,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);

  const customStyle: React.CSSProperties = {
    top,
    height,
    ...(left != null ? { left } : {}),
    ...(width != null ? { width } : {}),
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.dataTransfer.setData('application/json', JSON.stringify(seance));
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.(e, seance);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(false);
    onDragEnd?.(e);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`session-card session-card--${colorIndex(seance)}${
        warning ? ' has-warning' : ''
      }${isDragging ? ' is-dragging' : ''}${
        isNarrow ? ' is-narrow' : ''
      }${
        isRightAligned ? ' is-right-aligned' : ''
      }`}
      style={customStyle}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      title={`${seance.matiereNom || 'Séance'} · ${
        seance.professeurNomComplet || 'Professeur non assigné'
      }${warning ? ` — Alerte: ${warning}` : ''}`}
    >
      {/* Top Header info */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <span className="session-card__time">
          {formatTime(seance.debut)} – {formatTime(seance.fin)}
          {seance.pinned && (
            <span
              className="session-card__pin-badge"
              title="Séance verrouillée (ne sera pas déplacée par le solveur Timefold)"
            >
              🔒
            </span>
          )}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          {(seance.groupe || seance.groupeNom) && (
            <span
              style={{
                fontSize: '9.5px',
                background: 'rgba(255,255,255,0.18)',
                padding: '1px 5px',
                borderRadius: '4px',
                fontWeight: 600,
              }}
            >
              {seance.groupe || seance.groupeNom}
            </span>
          )}
          {(seance.type || seance.typeSeance) &&
            (seance.type || seance.typeSeance) !== 'Cours' && (
              <span
                style={{
                  fontSize: '9px',
                  background: 'rgba(59,130,246,0.3)',
                  padding: '1px 4px',
                  borderRadius: '4px',
                  fontWeight: 600,
                }}
              >
                {seance.type || seance.typeSeance}
              </span>
            )}
          {(seance.alignementCode || seance.alignementId) && (
            <span
              title={`Alignement: ${seance.alignementCode || seance.alignementId}`}
              style={{
                fontSize: '9px',
                background: 'rgba(168,85,247,0.3)',
                padding: '1px 4px',
                borderRadius: '4px',
              }}
            >
              ⚡
            </span>
          )}
        </div>
      </div>

      {/* Subject */}
      <span className="session-card__subject">
        <i>
          <SubjectIcon name={seance.matiereNom} />
        </i>
        <strong>{seance.matiereNom || 'Matière inconnue'}</strong>
      </span>

      {/* Teacher / Class / Room */}
      <span className="session-card__meta">
        {seance.professeurNomComplet || 'Enseignant non assigné'}
        {(seance.type === 'VIE_DE_CLASSE' ||
          seance.matiereNom?.toLowerCase().includes('vie de classe')) && (
          <span
            style={{
              marginLeft: 6,
              fontSize: '9px',
              background: '#fef3c7',
              color: '#b45309',
              padding: '1px 4px',
              borderRadius: 4,
              fontWeight: 700,
            }}
          >
            🌟 Référent
          </span>
        )}
      </span>
      <span className="session-card__meta">
        {seance.classeNom || 'Classe non assignée'} · {seance.salleCode || 'Salle non assignée'}
      </span>

      {/* Hover Micro-actions bar (Piste C + Quick Popover trigger) */}
      <div
        className="session-card__quick-actions"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >

        {onTogglePin && (
          <button
            type="button"
            className="session-card__quick-btn"
            title={seance.pinned ? 'Déverrouiller la séance' : 'Verrouiller la séance (Pinning)'}
            onClick={() => onTogglePin(seance)}
          >
            {seance.pinned ? <Lock size={11} color="#f59e0b" /> : <Unlock size={11} />}
          </button>
        )}

        {onOpenQuickPopover && (
          <button
            type="button"
            className="session-card__quick-btn"
            title="Ajustement rapide de l'horaire"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              onOpenQuickPopover(seance, rect);
            }}
          >
            <Clock size={11} />
          </button>
        )}
      </div>
    </div>
  );
}
