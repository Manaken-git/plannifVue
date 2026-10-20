import { Clock, Lock, Unlock, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../../../../shared/ui/Button/Button';
import type { Seance } from '../../types/planning.types';
import './QuickReschedulePopover.css';

interface Props {
  seance: Seance;
  anchorRect?: { top: number; left: number; bottom: number; right: number };
  days: Date[];
  onClose: () => void;
  onApply: (newDebut: string, newFin: string, pinned: boolean) => Promise<void> | void;
  onOpenFullEdit: (seance: Seance) => void;
}

const PRESET_SLOTS = [
  { label: '08:00 - 10:00', start: '08:00', end: '10:00' },
  { label: '10:00 - 12:00', start: '10:00', end: '12:00' },
  { label: '13:30 - 15:30', start: '13:30', end: '15:30' },
  { label: '15:30 - 17:30', start: '15:30', end: '17:30' },
];

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

export function QuickReschedulePopover({
  seance,
  anchorRect,
  days,
  onClose,
  onApply,
  onOpenFullEdit,
}: Props) {
  const initialDate = new Date(seance.debut);
  const initialEndDate = new Date(seance.fin);

  // Compute duration in ms
  const durationMs = Math.max(30 * 60 * 1000, initialEndDate.getTime() - initialDate.getTime());

  // Selected day (index in `days` or date ISO)
  const currentDayIndex = days.findIndex(
    (d) => d.toDateString() === initialDate.toDateString()
  );
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(
    currentDayIndex >= 0 ? currentDayIndex : 0
  );

  const initialStartTime = seance.debut.slice(11, 16);
  const initialEndTime = seance.fin.slice(11, 16);

  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [pinned, setPinned] = useState<boolean>(seance.pinned ?? true);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Position calculation
  const popoverStyle: React.CSSProperties = anchorRect
    ? {
        top: Math.min(window.innerHeight - 380, Math.max(16, anchorRect.top)),
        left: Math.min(window.innerWidth - 360, Math.max(16, anchorRect.right + 12)),
      }
    : {
        top: '25%',
        left: 'calc(50% - 170px)',
      };

  const handleDaySelect = (dayIndex: number) => {
    setSelectedDayIdx(dayIndex);
  };

  const handlePresetSelect = (presetStart: string, presetEnd: string) => {
    setStartTime(presetStart);
    setEndTime(presetEnd);
  };

  const handleStartTimeChange = (newStart: string) => {
    setStartTime(newStart);
    // Keep duration
    const [h, m] = newStart.split(':').map(Number);
    if (!Number.isNaN(h) && !Number.isNaN(m)) {
      const dummy = new Date(2026, 0, 1, h, m);
      const endDummy = new Date(dummy.getTime() + durationMs);
      const endH = String(endDummy.getHours()).padStart(2, '0');
      const endM = String(endDummy.getMinutes()).padStart(2, '0');
      setEndTime(`${endH}:${endM}`);
    }
  };

  const handleSave = async () => {
    const baseDay = days[selectedDayIdx] ?? initialDate;
    const year = baseDay.getFullYear();
    const month = String(baseDay.getMonth() + 1).padStart(2, '0');
    const day = String(baseDay.getDate()).padStart(2, '0');

    const newDebut = `${year}-${month}-${day}T${startTime}:00`;
    const newFin = `${year}-${month}-${day}T${endTime}:00`;

    await onApply(newDebut, newFin, pinned);
    onClose();
  };

  return (
    <div
      className="quick-reschedule-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="quick-reschedule-popover"
        style={popoverStyle}
        role="dialog"
        aria-modal="true"
        aria-label="Changement d'horaire rapide"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="quick-reschedule-popover__header">
          <div className="quick-reschedule-popover__title">
            <Clock size={16} color="var(--primary)" />
            <span>Déplacer la séance</span>
          </div>
          <button
            type="button"
            className="session-card__quick-btn"
            style={{ width: 24, height: 24 }}
            onClick={onClose}
            aria-label="Fermer"
          >
            <X size={15} />
          </button>
        </header>

        {/* Day selection */}
        <div className="quick-reschedule-popover__section">
          <span className="quick-reschedule-popover__label">Jour de la semaine</span>
          <div className="quick-reschedule-popover__days">
            {days.slice(0, 5).map((d, idx) => {
              const label = DAY_LABELS[idx] || `J${idx + 1}`;
              const isActive = selectedDayIdx === idx;
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  className={`quick-reschedule-popover__day-btn ${isActive ? 'is-active' : ''}`}
                  onClick={() => handleDaySelect(idx)}
                >
                  {label} {d.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Preset Slots */}
        <div className="quick-reschedule-popover__section">
          <span className="quick-reschedule-popover__label">Créneaux standards</span>
          <div className="quick-reschedule-popover__slots">
            {PRESET_SLOTS.map((slot) => {
              const isActive = startTime === slot.start && endTime === slot.end;
              return (
                <button
                  key={slot.label}
                  type="button"
                  className={`quick-reschedule-popover__slot-btn ${isActive ? 'is-active' : ''}`}
                  onClick={() => handlePresetSelect(slot.start, slot.end)}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Start / End input */}
        <div className="quick-reschedule-popover__section">
          <span className="quick-reschedule-popover__label">Horaire précis</span>
          <div className="quick-reschedule-popover__custom-time">
            <input
              type="time"
              className="quick-reschedule-popover__time-input"
              value={startTime}
              onChange={(e) => handleStartTimeChange(e.target.value)}
            />
            <span style={{ color: 'var(--text-muted)' }}>à</span>
            <input
              type="time"
              className="quick-reschedule-popover__time-input"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        {/* Pinning Lock */}
        <label className="quick-reschedule-popover__pin-toggle">
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            {pinned ? <Lock size={15} color="#f59e0b" /> : <Unlock size={15} color="var(--text-muted)" />}
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              Verrouiller la séance (Pinning)
            </span>
          </div>
          <input
            type="checkbox"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
          />
        </label>

        {/* Bottom actions */}
        <div className="quick-reschedule-popover__actions">
          <button
            type="button"
            className="quick-reschedule-popover__more-link"
            onClick={() => {
              onClose();
              onOpenFullEdit(seance);
            }}
          >
            Plus d'options...
          </button>
          <div style={{ display: 'flex', gap: 6 }}>
            <Button variant="secondary" onClick={onClose}>
              Annuler
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Appliquer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
