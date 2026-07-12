import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { SessionCard } from '../molecules/SessionCard';
import type { Seance, Professeur, Classe, Matiere, Salle } from '../../services/api';

interface CalendarGridProps {
  seances: Seance[];
  professeurs: Professeur[];
  classes: Classe[];
  matieres: Matiere[];
  salles: Salle[];
  calendarFilter: {
    type: 'all' | 'professeur' | 'classe' | 'matiere' | 'salle';
    value: string;
  };
  onFilterChange: (filter: { type: 'all' | 'professeur' | 'classe' | 'matiere' | 'salle'; value: string }) => void;
  onEditSession: (seance: Seance) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  seances,
  professeurs,
  classes,
  matieres,
  salles,
  calendarFilter,
  onFilterChange,
  onEditSession
}) => {
  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  const hoursOfDay = Array.from({ length: 9 }, (_, i) => 8 + i); // 8 to 16

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const getSessionPosition = (seance: Seance) => {
    const start = new Date(seance.debut);
    const end = new Date(seance.fin);
    
    const day = start.getDay(); 
    if (day < 1 || day > 5) return null;

    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;

    const top = (startHour - 8) * 80;
    const height = (endHour - startHour) * 80;

    return {
      dayIndex: day - 1,
      top,
      height
    };
  };

  return (
    <div className="table-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="calendar-controls">
        <div className="calendar-filters">
          <SlidersHorizontal size={16} style={{ color: 'var(--text-secondary)' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Filtrer le planning :</span>
          
          <select 
            className="calendar-select"
            value={calendarFilter.type}
            onChange={(e) => onFilterChange({ type: e.target.value as any, value: '' })}
          >
            <option value="all">Tout afficher</option>
            <option value="professeur">Par Enseignant</option>
            <option value="classe">Par Classe</option>
            <option value="matiere">Par Matière</option>
            <option value="salle">Par Salle</option>
          </select>

          {calendarFilter.type === 'professeur' && (
            <select 
              className="calendar-select"
              value={calendarFilter.value}
              onChange={(e) => onFilterChange({ ...calendarFilter, value: e.target.value })}
            >
              <option value="">Sélectionnez un professeur</option>
              {professeurs.map(p => (
                <option key={p.id} value={`${p.prenom} ${p.nom}`}>{p.prenom} {p.nom}</option>
              ))}
            </select>
          )}

          {calendarFilter.type === 'classe' && (
            <select 
              className="calendar-select"
              value={calendarFilter.value}
              onChange={(e) => onFilterChange({ ...calendarFilter, value: e.target.value })}
            >
              <option value="">Sélectionnez une classe</option>
              {classes.map(c => (
                <option key={c.id} value={c.nom}>{c.nom}</option>
              ))}
            </select>
          )}

          {calendarFilter.type === 'matiere' && (
            <select 
              className="calendar-select"
              value={calendarFilter.value}
              onChange={(e) => onFilterChange({ ...calendarFilter, value: e.target.value })}
            >
              <option value="">Sélectionnez une matière</option>
              {matieres.map(m => (
                <option key={m.id} value={m.nom}>{m.nom}</option>
              ))}
            </select>
          )}

          {calendarFilter.type === 'salle' && (
            <select 
              className="calendar-select"
              value={calendarFilter.value}
              onChange={(e) => onFilterChange({ ...calendarFilter, value: e.target.value })}
            >
              <option value="">Sélectionnez une salle</option>
              {salles.map(s => (
                <option key={s.id} value={s.code}>{s.code}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="calendar-grid">
        <div className="calendar-header-cell" style={{ borderRight: '1px solid var(--border-color)' }}>Heures</div>
        {daysOfWeek.map(day => (
          <div key={day} className="calendar-header-cell">{day}</div>
        ))}

        <div className="calendar-time-col">
          {hoursOfDay.map(hour => (
            <div key={hour} className="calendar-time-slot">
              {formatHour(hour)}
            </div>
          ))}
        </div>

        {Array.from({ length: 5 }).map((_, dayIdx) => {
          const daySessions = seances.filter(s => {
            const pos = getSessionPosition(s);
            return pos && pos.dayIndex === dayIdx;
          });

          return (
            <div key={dayIdx} className="calendar-day-col">
              <div className="calendar-hour-grid">
                {hoursOfDay.map(hour => (
                  <div key={hour} className="calendar-hour-line" />
                ))}
              </div>

              {daySessions.map(seance => {
                const pos = getSessionPosition(seance);
                if (!pos) return null;

                return (
                  <SessionCard 
                    key={seance.id}
                    seance={seance}
                    position={pos}
                    onClick={() => onEditSession(seance)}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
