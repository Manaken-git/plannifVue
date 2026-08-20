import { CalendarDays, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState, type CSSProperties } from 'react';
import { Button } from '../../../../shared/ui/Button/Button';
import type { Classe } from '../../../classes/types/classe.types';
import type { Matiere } from '../../../matieres/types/matiere.types';
import type { PlanningDTO } from '../../../plannings/types/planning-saved.types';
import type { Professeur } from '../../../professeurs/types/professeur.types';
import type { Salle } from '../../../salles/types/salle.types';
import { SessionCard } from '../SessionCard/SessionCard';
import type { CalendarFilter, CalendarFilterType, Seance } from '../../types/planning.types';
import './CalendarGrid.css';

interface Props {
  seances: Seance[];
  professeurs: Professeur[];
  classes: Classe[];
  matieres: Matiere[];
  salles: Salle[];
  plannings: PlanningDTO[];
  selectedPlanningId: number | null;
  onPlanningChange: (id: number | null) => void;
  filter: CalendarFilter;
  onFilterChange: (filter: CalendarFilter) => void;
  onEdit: (seance: Seance) => void;
  onCreate: () => void;
}

const START_HOUR = 8;
const END_HOUR = 17;
const HOUR_HEIGHT = 68;
const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, index) => START_HOUR + index);

function startOfWeek(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  result.setDate(result.getDate() + (day === 0 ? -6 : 1 - day));
  result.setHours(0, 0, 0, 0);
  return result;
}
function isSameDay(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
function asDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? null : date; }

export function CalendarGrid({ seances, professeurs, classes, matieres, salles, plannings, selectedPlanningId, onPlanningChange, filter, onFilterChange, onEdit, onCreate }: Props) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const weekDays = useMemo(() => Array.from({ length: 5 }, (_, index) => { const day = new Date(weekStart); day.setDate(weekStart.getDate() + index); return day; }), [weekStart]);
  const visible = useMemo(() => seances.filter((seance) => { const date = asDate(seance.debut); return date ? weekDays.some((day) => isSameDay(date, day)) : false; }), [seances, weekDays]);
  const weekLabel = useMemo(() => {
    const first = weekDays[0]; const last = weekDays[4]; const formatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
    return `${formatter.format(first)} — ${formatter.format(last)} ${last.getFullYear()}`;
  }, [weekDays]);

  const shiftWeek = (amount: number) => setWeekStart((current) => { const next = new Date(current); next.setDate(next.getDate() + amount * 7); return next; });
  const position = (seance: Seance) => {
    const start = asDate(seance.debut); const end = asDate(seance.fin); if (!start || !end) return null;
    const dayIndex = weekDays.findIndex((day) => isSameDay(day, start)); if (dayIndex < 0) return null;
    const startValue = start.getHours() + start.getMinutes() / 60; const endValue = end.getHours() + end.getMinutes() / 60;
    return { dayIndex, top: Math.max(0, (startValue - START_HOUR) * HOUR_HEIGHT), height: Math.max(32, (endValue - startValue) * HOUR_HEIGHT) };
  };
  const setType = (type: CalendarFilterType) => onFilterChange({ type, value: '' });

  return <section className="calendar-panel">
    <div className="calendar-toolbar">
      <div className="calendar-week-nav"><Button variant="icon" onClick={() => shiftWeek(-1)} aria-label="Semaine précédente" icon={<ChevronLeft size={16} />} /><div className="calendar-week-copy"><span>Semaine</span><strong>{weekLabel}</strong></div><Button variant="icon" onClick={() => shiftWeek(1)} aria-label="Semaine suivante" icon={<ChevronRight size={16} />} /><button type="button" className="calendar-today" onClick={() => setWeekStart(startOfWeek(new Date()))}>Aujourd'hui</button></div>
      <div className="calendar-filters"><label><span>Source</span><select value={selectedPlanningId ?? ''} onChange={(e) => onPlanningChange(e.target.value ? Number(e.target.value) : null)}><option value="">Séances globales</option>{plannings.map((planning) => <option key={planning.id} value={planning.id}>{planning.nom}</option>)}</select></label><div className="calendar-filter-select"><SlidersHorizontal size={13} /><select value={filter.type} onChange={(e) => setType(e.target.value as CalendarFilterType)}><option value="all">Tous</option><option value="professeur">Enseignant</option><option value="classe">Classe</option><option value="matiere">Matière</option><option value="salle">Salle</option></select></div>{filter.type === 'professeur' && <select value={filter.value} onChange={(e) => onFilterChange({ ...filter, value: e.target.value })}><option value="">Tous les enseignants</option>{professeurs.map((p) => <option key={p.id} value={`${p.prenom} ${p.nom}`}>{p.prenom} {p.nom}</option>)}</select>}{filter.type === 'classe' && <select value={filter.value} onChange={(e) => onFilterChange({ ...filter, value: e.target.value })}><option value="">Toutes les classes</option>{classes.map((c) => <option key={c.id} value={c.nom}>{c.nom}</option>)}</select>}{filter.type === 'matiere' && <select value={filter.value} onChange={(e) => onFilterChange({ ...filter, value: e.target.value })}><option value="">Toutes les matières</option>{matieres.map((m) => <option key={m.id} value={m.nom}>{m.nom}</option>)}</select>}{filter.type === 'salle' && <select value={filter.value} onChange={(e) => onFilterChange({ ...filter, value: e.target.value })}><option value="">Toutes les salles</option>{salles.map((s) => <option key={s.id} value={s.code}>{s.code}</option>)}</select>}</div>
    </div>

    <div className="calendar-grid" style={{ '--calendar-height': `${hours.length * HOUR_HEIGHT}px` } as CSSProperties}>
      <div className="calendar-grid__corner">Heure</div>
      {weekDays.map((day) => { const today = isSameDay(day, new Date()); return <div key={day.toISOString()} className={`calendar-grid__day-header${today ? ' is-today' : ''}`}><span>{new Intl.DateTimeFormat('fr-FR', { weekday: 'short' }).format(day).replace('.', '')}</span><strong>{day.getDate()}</strong></div>; })}
      <div className="calendar-grid__times">{hours.map((hour) => <div key={hour} style={{ height: HOUR_HEIGHT }}><span>{String(hour).padStart(2, '0')}:00</span></div>)}</div>
      {weekDays.map((day, dayIndex) => <div key={day.toISOString()} className={`calendar-grid__column${isSameDay(day, new Date()) ? ' is-today' : ''}`} style={{ height: hours.length * HOUR_HEIGHT }}>{hours.map((hour) => <div key={hour} className="calendar-grid__hour" style={{ height: HOUR_HEIGHT }} />)}{visible.map((seance) => { const pos = position(seance); if (!pos || pos.dayIndex !== dayIndex) return null; return <SessionCard key={seance.id ?? `${seance.debut}-${seance.matiereNom}`} seance={seance} top={pos.top} height={pos.height} onClick={() => onEdit(seance)} />; })}</div>)}
      {visible.length === 0 && <div className="calendar-grid__empty"><div className="calendar-grid__empty-icon"><CalendarDays size={20} /></div><strong>Aucune séance cette semaine</strong><p>Créez une séance ou changez de semaine pour afficher le planning.</p><Button variant="secondary" onClick={onCreate}>Créer une séance</Button></div>}
    </div>
  </section>;
}
