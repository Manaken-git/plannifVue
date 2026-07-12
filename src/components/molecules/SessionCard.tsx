import React from 'react';
import type { Seance } from '../../services/api';

interface SessionCardProps {
  seance: Seance;
  position: { top: number; height: number };
  onClick: () => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({ seance, position, onClick }) => {
  const colorIndex = (seance.id || 0) % 5;

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      className={`session-card color-${colorIndex}`}
      style={{
        top: `${position.top}px`,
        height: `${position.height}px`
      }}
      onClick={onClick}
    >
      <div className="session-subject">{seance.matiereNom || 'Matière inconnue'}</div>
      <div className="session-details">
        Prof. : {seance.professeurNomComplet || 'Non assigné'}<br />
        Classe : {seance.classeNom || 'Non assigné'}<br />
        Salle : {seance.salleCode || 'Non assigné'}
      </div>
      <div className="session-time">
        {formatTime(seance.debut)} - {formatTime(seance.fin)}
      </div>
    </div>
  );
};
