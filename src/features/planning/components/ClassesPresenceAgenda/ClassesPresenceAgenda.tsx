import {
  Calendar as CalendarIcon,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Menu,
  Plus,
  Search,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useToast } from '../../../../app/providers/useToast';
import type { Classe } from '../../../classes/types/classe.types';
import { classesApi } from '../../../classes/api/classes.api';
import { Button } from '../../../../shared/ui/Button/Button';
import type { Seance } from '../../types/planning.types';
import type {
  AgendaViewMode,
  FlattenedPresence,
} from './classesPresence.types';
import {
  exportPresencesToIcs,
  formatDateIso,
  getClassColor,
  getMonthWeeks,
  getPresenceStatus,
  getSegmentsForWeek,
  getWeekDays,
  isDateInsidePresence,
  isSameDay,
  parseDateOnly,
} from './classesPresence.utils';
import { PresenceDetailModal } from './PresenceDetailModal';
import { PresencePeriodModal } from './PresencePeriodModal';
import './ClassesPresenceAgenda.css';

interface Props {
  classes: Classe[];
  seances?: Seance[];
  onRefreshClasses: () => Promise<void>;
  onViewScheduleForClass: (classeNom: string) => void;
}

export function ClassesPresenceAgenda({
  classes,
  seances = [],
  onRefreshClasses,
  onViewScheduleForClass,
}: Props) {
  const { notify } = useToast();

  // Current view date anchor
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  // View mode: month (default), week, agenda, year
  const [viewMode, setViewMode] = useState<AgendaViewMode>('month');

  // Sidebar toggle (for responsiveness or user preference)
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Selected class IDs for filtering (default: all classes checked)
  const [selectedClassIds, setSelectedClassIds] = useState<Set<number>>(() => {
    return new Set(classes.map((c) => c.id ?? 0));
  });

  // Search filter for classes in sidebar
  const [classSearch, setClassSearch] = useState('');

  // Modals state
  const [detailItem, setDetailItem] = useState<FlattenedPresence | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const [periodModalOpen, setPeriodModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<FlattenedPresence | null>(null);
  const [modalDefaultDate, setModalDefaultDate] = useState<string | undefined>(undefined);
  const [savingPeriod, setSavingPeriod] = useState(false);

  // Mini-calendar month anchor
  const [miniCalMonth, setMiniCalMonth] = useState<Date>(() => new Date(currentDate));

  // Flatten all presences for active classes
  const allPresences = useMemo(() => {
    return classes.flatMap((c, cIdx) => {
      if (!c.presences) return [];
      const color = getClassColor(c.id, cIdx);
      return c.presences
        .filter((p) => p.dateDebut && p.dateFin)
        .map((p, pIdx): FlattenedPresence => {
          const startDate = parseDateOnly(p.dateDebut);
          const endDate = parseDateOnly(p.dateFin);
          return {
            key: `${c.id ?? cIdx}-${p.id ?? pIdx}`,
            presenceId: p.id,
            classeId: c.id ?? cIdx,
            classeNom: c.nom,
            effectif: c.effectif,
            dateDebut: p.dateDebut,
            dateFin: p.dateFin,
            startDate,
            endDate,
            color,
            classe: c,
            presence: p,
            periodIndex: pIdx,
          };
        });
    });
  }, [classes]);

  // Filtered presences based on sidebar checkboxes
  const visiblePresences = useMemo(() => {
    return allPresences.filter((p) => selectedClassIds.has(p.classeId));
  }, [allPresences, selectedClassIds]);

  // Classes present today
  const todayDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const classesPresentTodayCount = useMemo(() => {
    return classes.filter((c) => {
      return (c.presences ?? []).some((p) => {
        if (!p.dateDebut || !p.dateFin) return false;
        const start = parseDateOnly(p.dateDebut);
        const end = parseDateOnly(p.dateFin);
        end.setHours(23, 59, 59, 999);
        return todayDate >= start && todayDate <= end;
      });
    }).length;
  }, [classes, todayDate]);

  // Navigation handlers
  const handleToday = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    setCurrentDate(now);
    setMiniCalMonth(new Date(now));
  };

  const handlePrev = () => {
    setCurrentDate((prev) => {
      const copy = new Date(prev);
      if (viewMode === 'month') {
        copy.setMonth(copy.getMonth() - 1);
      } else if (viewMode === 'week') {
        copy.setDate(copy.getDate() - 7);
      } else if (viewMode === 'year') {
        copy.setFullYear(copy.getFullYear() - 1);
      } else {
        copy.setMonth(copy.getMonth() - 1);
      }
      return copy;
    });
  };

  const handleNext = () => {
    setCurrentDate((prev) => {
      const copy = new Date(prev);
      if (viewMode === 'month') {
        copy.setMonth(copy.getMonth() + 1);
      } else if (viewMode === 'week') {
        copy.setDate(copy.getDate() + 7);
      } else if (viewMode === 'year') {
        copy.setFullYear(copy.getFullYear() + 1);
      } else {
        copy.setMonth(copy.getMonth() + 1);
      }
      return copy;
    });
  };

  // Header title label
  const headerTitle = useMemo(() => {
    const year = currentDate.getFullYear();
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    }
    if (viewMode === 'week') {
      const days = getWeekDays(currentDate);
      const first = days[0];
      const last = days[6];
      if (first.getMonth() === last.getMonth()) {
        return `${first.getDate()} - ${last.getDate()} ${first.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;
      }
      return `${first.getDate()} ${first.toLocaleDateString('fr-FR', { month: 'short' })} - ${last.getDate()} ${last.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}`;
    }
    if (viewMode === 'year') {
      return `Année ${year}`;
    }
    return `Planning de présence ${year}`;
  }, [currentDate, viewMode]);

  // Class selection toggle
  const toggleClass = (id: number) => {
    setSelectedClassIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllClasses = () => {
    setSelectedClassIds(new Set(classes.map((c) => c.id ?? 0)));
  };

  const deselectAllClasses = () => {
    setSelectedClassIds(new Set());
  };

  // Filter classes shown in sidebar
  const filteredSidebarClasses = useMemo(() => {
    if (!classSearch.trim()) return classes;
    const q = classSearch.toLowerCase();
    return classes.filter((c) => c.nom.toLowerCase().includes(q));
  }, [classes, classSearch]);

  // Open detail modal
  const openDetail = (item: FlattenedPresence) => {
    setDetailItem(item);
    setDetailModalOpen(true);
  };

  // Open period form for creation
  const handleOpenCreatePeriod = (dateIso?: string) => {
    setEditingPeriod(null);
    setModalDefaultDate(dateIso);
    setPeriodModalOpen(true);
  };

  // Open period form for edition
  const handleOpenEditPeriod = (item: FlattenedPresence) => {
    setDetailModalOpen(false);
    setEditingPeriod(item);
    setPeriodModalOpen(true);
  };

  // Save period (create or update)
  const handleSavePeriod = async (
    classeId: number,
    dateDebut: string,
    dateFin: string,
    periodIndex?: number
  ) => {
    const targetClass = classes.find((c) => c.id === classeId);
    if (!targetClass) throw new Error('Classe introuvable.');

    setSavingPeriod(true);
    try {
      const currentPresences = targetClass.presences ? [...targetClass.presences] : [];

      if (periodIndex !== undefined && periodIndex >= 0 && periodIndex < currentPresences.length) {
        // Edit existing period
        currentPresences[periodIndex] = {
          ...currentPresences[periodIndex],
          dateDebut,
          dateFin,
        };
      } else {
        // Add new period
        currentPresences.push({
          dateDebut,
          dateFin,
        });
      }

      const updated: Classe = {
        ...targetClass,
        presences: currentPresences,
      };

      await classesApi.update(updated);
      await onRefreshClasses();
      notify('Période de présence enregistrée avec succès.');
    } catch (err) {
      notify(err instanceof Error ? err.message : "Erreur lors de l'enregistrement.", 'error');
      throw err;
    } finally {
      setSavingPeriod(false);
    }
  };

  // Delete period
  const handleDeletePeriod = async (item: FlattenedPresence) => {
    if (!window.confirm(`Supprimer la période de présence pour ${item.classeNom} (du ${item.dateDebut} au ${item.dateFin}) ?`)) {
      return;
    }

    try {
      const targetClass = classes.find((c) => c.id === item.classeId);
      if (!targetClass) return;

      const updatedPresences = (targetClass.presences ?? []).filter((_, idx) => idx !== item.periodIndex);
      const updated: Classe = {
        ...targetClass,
        presences: updatedPresences,
      };

      await classesApi.update(updated);
      await onRefreshClasses();
      setDetailModalOpen(false);
      notify('Période supprimée.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erreur de suppression.', 'error');
    }
  };

  // Export to .ics
  const handleExportIcs = () => {
    if (visiblePresences.length === 0) {
      notify('Aucune présence à exporter avec les filtres actuels.', 'warning');
      return;
    }
    exportPresencesToIcs(visiblePresences, 'presence-classes.ics');
    notify('Fichier .ics téléchargé pour Google Agenda.');
  };

  // View schedule in main timetable
  const handleViewSchedule = (item: FlattenedPresence) => {
    setDetailModalOpen(false);
    onViewScheduleForClass(item.classeNom);
  };

  // Mini-calendar generation
  const miniCalWeeks = useMemo(() => {
    return getMonthWeeks(miniCalMonth.getFullYear(), miniCalMonth.getMonth());
  }, [miniCalMonth]);

  // Month view weeks matrix
  const monthWeeks = useMemo(() => {
    return getMonthWeeks(currentDate.getFullYear(), currentDate.getMonth());
  }, [currentDate]);

  // Week view days
  const weekDays = useMemo(() => {
    return getWeekDays(currentDate);
  }, [currentDate]);

  return (
    <div className="google-agenda">
      {/* ==================================================================== */}
      {/* Top Google Calendar Toolbar                                          */}
      {/* ==================================================================== */}
      <header className="google-agenda__toolbar">
        <div className="google-agenda__toolbar-left">
          <Button
            variant="icon"
            onClick={() => setSidebarOpen((v) => !v)}
            title="Menu latéral Google Agenda"
            aria-label="Menu"
            icon={<Menu size={18} />}
          />

          <div className="google-agenda__logo">
            <div className="google-agenda__calendar-icon">
              <span className="google-agenda__icon-month">
                {currentDate.toLocaleDateString('fr-FR', { month: 'short' }).slice(0, 3).toUpperCase()}
              </span>
              <span className="google-agenda__icon-day">{currentDate.getDate()}</span>
            </div>
            <div className="google-agenda__logo-text">
              <strong>Présence des classes</strong>
              <small>Suivi des sessions & alternances</small>
            </div>
          </div>

          <button
            type="button"
            className="google-agenda__today-btn"
            onClick={handleToday}
          >
            Aujourd'hui
          </button>

          <div className="google-agenda__nav-arrows">
            <Button
              variant="icon"
              onClick={handlePrev}
              title="Précédent"
              aria-label="Précédent"
              icon={<ChevronLeft size={16} />}
            />
            <Button
              variant="icon"
              onClick={handleNext}
              title="Suivant"
              aria-label="Suivant"
              icon={<ChevronRight size={16} />}
            />
          </div>

          <h2 className="google-agenda__title">{headerTitle}</h2>
        </div>

        <div className="google-agenda__toolbar-right">
          {/* View switcher: Mois, Semaine, Planning, Année */}
          <div className="google-agenda__view-switcher" role="tablist">
            <button
              type="button"
              className={`google-agenda__view-btn${viewMode === 'month' ? ' is-active' : ''}`}
              onClick={() => setViewMode('month')}
            >
              Mois
            </button>
            <button
              type="button"
              className={`google-agenda__view-btn${viewMode === 'week' ? ' is-active' : ''}`}
              onClick={() => setViewMode('week')}
            >
              Semaine
            </button>
            <button
              type="button"
              className={`google-agenda__view-btn${viewMode === 'agenda' ? ' is-active' : ''}`}
              onClick={() => setViewMode('agenda')}
            >
              Planning
            </button>
            <button
              type="button"
              className={`google-agenda__view-btn${viewMode === 'year' ? ' is-active' : ''}`}
              onClick={() => setViewMode('year')}
            >
              Année
            </button>
          </div>

          <Button
            variant="secondary"
            onClick={handleExportIcs}
            icon={<Download size={14} />}
            title="Exporter pour Google Agenda, Apple Calendar ou Outlook (.ics)"
          >
            Exporter (.ics)
          </Button>

          <Button
            variant="primary"
            onClick={() => handleOpenCreatePeriod(formatDateIso(currentDate))}
            icon={<Plus size={14} />}
          >
            Période
          </Button>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* Main Layout (Sidebar + Calendar View)                                */}
      {/* ==================================================================== */}
      <div className="google-agenda__container">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="google-agenda__sidebar">
            {/* Quick Action Button in Sidebar */}
            <button
              type="button"
              className="google-agenda__sidebar-create-btn"
              onClick={() => handleOpenCreatePeriod(formatDateIso(currentDate))}
            >
              <Plus size={18} />
              <span>Ajouter une présence</span>
            </button>

            {/* Mini Calendar */}
            <div className="google-agenda__minical">
              <div className="google-agenda__minical-header">
                <strong>
                  {miniCalMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </strong>
                <div className="google-agenda__minical-nav">
                  <button
                    type="button"
                    onClick={() =>
                      setMiniCalMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
                    }
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setMiniCalMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))
                    }
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              <div className="google-agenda__minical-grid">
                <div className="google-agenda__minical-days-row">
                  {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                    <span key={i}>{d}</span>
                  ))}
                </div>
                {miniCalWeeks.map((week, wIdx) => (
                  <div key={wIdx} className="google-agenda__minical-week">
                    {week.map((day) => {
                      const isCurrMonth = day.getMonth() === miniCalMonth.getMonth();
                      const isToday = isSameDay(day, todayDate);
                      const isSelected = isSameDay(day, currentDate);
                      return (
                        <button
                          key={day.toISOString()}
                          type="button"
                          className={`google-agenda__minical-cell${
                            !isCurrMonth ? ' is-outside' : ''
                          }${isToday ? ' is-today' : ''}${isSelected ? ' is-selected' : ''}`}
                          onClick={() => {
                            setCurrentDate(new Date(day));
                            if (viewMode === 'year') setViewMode('month');
                          }}
                        >
                          {day.getDate()}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Status overview */}
            <div className="google-agenda__quick-stats">
              <div className="google-agenda__quick-stat">
                <span className="google-agenda__quick-stat-badge is-active" />
                <span>
                  <strong>{classesPresentTodayCount}</strong> classe{classesPresentTodayCount > 1 ? 's' : ''} présente{classesPresentTodayCount > 1 ? 's' : ''} aujourd'hui
                </span>
              </div>
              <div className="google-agenda__quick-stat">
                <span className="google-agenda__quick-stat-badge" />
                <span>
                  <strong>{classes.length}</strong> classes configurées
                </span>
              </div>
            </div>

            {/* Classes List / Calendars section */}
            <div className="google-agenda__classes-section">
              <div className="google-agenda__classes-header">
                <span className="google-agenda__classes-title">Mes classes</span>
                <div className="google-agenda__classes-quick-actions">
                  <button type="button" onClick={selectAllClasses} title="Tout cocher">
                    Toutes
                  </button>
                  <button type="button" onClick={deselectAllClasses} title="Tout décocher">
                    Aucune
                  </button>
                </div>
              </div>

              {/* Class search */}
              <div className="google-agenda__classes-search">
                <Search size={13} />
                <input
                  type="text"
                  placeholder="Filtrer une classe..."
                  value={classSearch}
                  onChange={(e) => setClassSearch(e.target.value)}
                />
              </div>

              {/* Class checkboxes */}
              <div className="google-agenda__classes-list">
                {filteredSidebarClasses.map((c, cIdx) => {
                  const classId = c.id ?? cIdx;
                  const isChecked = selectedClassIds.has(classId);
                  const color = getClassColor(c.id, cIdx);
                  const periodCount = (c.presences ?? []).filter((p) => p.dateDebut && p.dateFin).length;
                  const isCurrentlyPresent = (c.presences ?? []).some((p) => {
                    if (!p.dateDebut || !p.dateFin) return false;
                    const start = parseDateOnly(p.dateDebut);
                    const end = parseDateOnly(p.dateFin);
                    end.setHours(23, 59, 59, 999);
                    return todayDate >= start && todayDate <= end;
                  });

                  return (
                    <label
                      key={classId}
                      className={`google-agenda__class-item${isChecked ? ' is-checked' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleClass(classId)}
                      />
                      <span
                        className="google-agenda__checkbox-custom"
                        style={{
                          borderColor: color.primary,
                          backgroundColor: isChecked ? color.primary : 'transparent',
                        }}
                      >
                        {isChecked && <span className="google-agenda__check-mark">✓</span>}
                      </span>
                      <div className="google-agenda__class-label">
                        <span className="google-agenda__class-name" title={c.nom}>
                          {c.nom}
                        </span>
                        <span className="google-agenda__class-meta">
                          {periodCount > 0 ? `${periodCount} période${periodCount > 1 ? 's' : ''}` : 'Aucune période'}
                          {isCurrentlyPresent && (
                            <span className="google-agenda__present-pill">Présente</span>
                          )}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </aside>
        )}

        {/* View content */}
        <main className="google-agenda__view">
          {/* ================================================================ */}
          {/* 1. MONTH VIEW (Vue Mois Google Calendar avec barres continues)    */}
          {/* ================================================================ */}
          {viewMode === 'month' && (
            <div className="google-agenda__month-view">
              {/* Day headers: Lun - Dim */}
              <div className="google-agenda__month-header">
                {['LUN.', 'MAR.', 'MER.', 'JEU.', 'VEN.', 'SAM.', 'DIM.'].map((dayName, idx) => (
                  <div key={idx} className="google-agenda__month-header-cell">
                    {dayName}
                  </div>
                ))}
              </div>

              {/* Weeks grid */}
              <div className="google-agenda__month-weeks">
                {monthWeeks.map((week, wIdx) => {
                  const segments = getSegmentsForWeek(week, visiblePresences);

                  return (
                    <div key={wIdx} className="google-agenda__month-week-row">
                      {/* Day cells background */}
                      <div className="google-agenda__month-week-cells">
                        {week.map((day, dIdx) => {
                          const isCurrMonth = day.getMonth() === currentDate.getMonth();
                          const isToday = isSameDay(day, todayDate);
                          const dayIso = formatDateIso(day);

                          return (
                            <div
                              key={dIdx}
                              className={`google-agenda__month-cell${
                                !isCurrMonth ? ' is-outside' : ''
                              }${isToday ? ' is-today' : ''}`}
                              onClick={() => handleOpenCreatePeriod(dayIso)}
                              title="Cliquer pour ajouter une période commençant ce jour"
                            >
                              <div className="google-agenda__month-cell-header">
                                <span className={`google-agenda__day-number${isToday ? ' is-today-badge' : ''}`}>
                                  {day.getDate()}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Overlapping presence bars container */}
                      <div className="google-agenda__month-week-events">
                        {segments.map((seg, sIdx) => {
                          const { presence, startCol, totalDaysInSegment, isSegmentStart, isSegmentEnd } = seg;

                          return (
                            <button
                              key={`${presence.key}-${wIdx}-${sIdx}`}
                              type="button"
                              className={`google-agenda__event-bar${
                                isSegmentStart ? ' is-start' : ''
                              }${isSegmentEnd ? ' is-end' : ''}`}
                              style={{
                                gridColumn: `${startCol + 1} / span ${totalDaysInSegment}`,
                                backgroundColor: presence.color.bg,
                                borderColor: presence.color.border,
                                color: presence.color.text,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                openDetail(presence);
                              }}
                              title={`${presence.classeNom} (du ${presence.dateDebut} au ${presence.dateFin})`}
                            >
                              <span
                                className="google-agenda__event-bar-dot"
                                style={{ backgroundColor: presence.color.primary }}
                              />
                              <span className="google-agenda__event-bar-title">
                                {presence.classeNom}
                              </span>
                              {isSegmentStart && (
                                <span className="google-agenda__event-bar-dates">
                                  ({presence.dateDebut.slice(5)} au {presence.dateFin.slice(5)})
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* 2. WEEK VIEW (Vue Semaine Google Calendar avec détails)           */}
          {/* ================================================================ */}
          {viewMode === 'week' && (
            <div className="google-agenda__week-view">
              {/* Day header */}
              <div className="google-agenda__week-header">
                {weekDays.map((day, idx) => {
                  const isToday = isSameDay(day, todayDate);
                  return (
                    <div
                      key={idx}
                      className={`google-agenda__week-header-cell${isToday ? ' is-today' : ''}`}
                    >
                      <span className="google-agenda__week-header-name">
                        {day.toLocaleDateString('fr-FR', { weekday: 'short' }).toUpperCase()}
                      </span>
                      <span className={`google-agenda__week-header-num${isToday ? ' is-today' : ''}`}>
                        {day.getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* All-day multi-day presence banner across week */}
              <div className="google-agenda__week-all-day-row">
                <div className="google-agenda__week-all-day-label">
                  <CalendarDays size={13} />
                  <span>Présences</span>
                </div>
                <div className="google-agenda__week-all-day-grid">
                  {getSegmentsForWeek(weekDays, visiblePresences).map((seg, sIdx) => {
                    const { presence, startCol, totalDaysInSegment, isSegmentStart, isSegmentEnd } = seg;
                    return (
                      <button
                        key={`${presence.key}-wk-${sIdx}`}
                        type="button"
                        className={`google-agenda__event-bar is-week-bar${
                          isSegmentStart ? ' is-start' : ''
                        }${isSegmentEnd ? ' is-end' : ''}`}
                        style={{
                          gridColumn: `${startCol + 1} / span ${totalDaysInSegment}`,
                          backgroundColor: presence.color.bg,
                          borderColor: presence.color.border,
                          color: presence.color.text,
                        }}
                        onClick={() => openDetail(presence)}
                      >
                        <span
                          className="google-agenda__event-bar-dot"
                          style={{ backgroundColor: presence.color.primary }}
                        />
                        <span className="google-agenda__event-bar-title">{presence.classeNom}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detailed day-by-day columns */}
              <div className="google-agenda__week-columns">
                {weekDays.map((day, idx) => {
                  const isToday = isSameDay(day, todayDate);
                  const presentClasses = visiblePresences.filter((p) => isDateInsidePresence(day, p));
                  const dayIso = formatDateIso(day);

                  // Sessions for this day in timetable
                  const daySessions = seances.filter((s) => s.debut && s.debut.startsWith(dayIso));

                  return (
                    <div
                      key={idx}
                      className={`google-agenda__week-col${isToday ? ' is-today' : ''}`}
                    >
                      <div className="google-agenda__week-col-header">
                        <span className="google-agenda__week-col-count">
                          {presentClasses.length} classe{presentClasses.length > 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="google-agenda__week-col-content">
                        {presentClasses.length === 0 ? (
                          <div className="google-agenda__week-empty">
                            <span>Aucune présence</span>
                            <button
                              type="button"
                              className="google-agenda__week-add-link"
                              onClick={() => handleOpenCreatePeriod(dayIso)}
                            >
                              + Ajouter
                            </button>
                          </div>
                        ) : (
                          presentClasses.map((item) => {
                            const classSessionsCount = daySessions.filter(
                              (s) => s.classeNom === item.classeNom
                            ).length;

                            return (
                              <div
                                key={item.key}
                                className="google-agenda__week-class-card"
                                style={{
                                  borderLeft: `4px solid ${item.color.primary}`,
                                  background: item.color.bg,
                                }}
                                onClick={() => openDetail(item)}
                              >
                                <div className="google-agenda__week-card-top">
                                  <strong>{item.classeNom}</strong>
                                </div>
                                <div className="google-agenda__week-card-info">
                                  {item.effectif ? `${item.effectif} élèves` : ''}
                                  {(item.classe.heureDebutMin || item.classe.heureFinMax) && (
                                    <span> • {item.classe.heureDebutMin ?? '8h'}-{item.classe.heureFinMax ?? '18h'}</span>
                                  )}
                                </div>
                                {classSessionsCount > 0 && (
                                  <div className="google-agenda__week-card-sessions">
                                    {classSessionsCount} cours planifié{classSessionsCount > 1 ? 's' : ''}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* 3. AGENDA / SCHEDULE VIEW (Vue Planning Google Agenda en liste)  */}
          {/* ================================================================ */}
          {viewMode === 'agenda' && (
            <div className="google-agenda__schedule-view">
              {visiblePresences.length === 0 ? (
                <div className="google-agenda__empty-state">
                  <CalendarIcon size={42} />
                  <h3>Aucune période de présence</h3>
                  <p>Sélectionnez des classes dans la barre latérale ou créez une nouvelle période de présence.</p>
                  <Button
                    variant="primary"
                    onClick={() => handleOpenCreatePeriod()}
                    icon={<Plus size={14} />}
                  >
                    Ajouter une période
                  </Button>
                </div>
              ) : (
                <div className="google-agenda__schedule-list">
                  {visiblePresences.map((item) => {
                    const status = getPresenceStatus(item.startDate, item.endDate);

                    return (
                      <div
                        key={item.key}
                        className="google-agenda__schedule-card"
                        style={{ borderLeft: `5px solid ${item.color.primary}` }}
                        onClick={() => openDetail(item)}
                      >
                        <div className="google-agenda__schedule-date-col">
                          <span className="google-agenda__schedule-day">
                            {item.startDate.getDate()} {item.startDate.toLocaleDateString('fr-FR', { month: 'short' })}
                          </span>
                          <span className="google-agenda__schedule-arrow">➔</span>
                          <span className="google-agenda__schedule-day">
                            {item.endDate.getDate()} {item.endDate.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                          </span>
                        </div>

                        <div className="google-agenda__schedule-info-col">
                          <div className="google-agenda__schedule-title-row">
                            <span
                              className="google-agenda__schedule-dot"
                              style={{ backgroundColor: item.color.primary }}
                            />
                            <strong>{item.classeNom}</strong>
                            {status === 'current' && (
                              <span className="google-agenda__badge-status is-current">En cours</span>
                            )}
                            {status === 'upcoming' && (
                              <span className="google-agenda__badge-status is-upcoming">À venir</span>
                            )}
                            {status === 'past' && (
                              <span className="google-agenda__badge-status is-past">Terminée</span>
                            )}
                          </div>
                          <div className="google-agenda__schedule-meta-row">
                            <span>Effectif : {item.effectif ? `${item.effectif} élèves` : 'Non précisé'}</span>
                            <span>•</span>
                            <span>Du {item.dateDebut} au {item.dateFin}</span>
                          </div>
                        </div>

                        <div className="google-agenda__schedule-action-col">
                          <Button
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewSchedule(item);
                            }}
                          >
                            Emploi du temps
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================================================================ */}
          {/* 4. YEAR VIEW (Vue Année Google Calendar)                         */}
          {/* ================================================================ */}
          {viewMode === 'year' && (
            <div className="google-agenda__year-view">
              <div className="google-agenda__year-grid">
                {Array.from({ length: 12 }, (_, monthIdx) => {
                  const mDate = new Date(currentDate.getFullYear(), monthIdx, 1);
                  const weeks = getMonthWeeks(currentDate.getFullYear(), monthIdx);

                  return (
                    <div
                      key={monthIdx}
                      className="google-agenda__year-month-card"
                      onClick={() => {
                        setCurrentDate(mDate);
                        setViewMode('month');
                      }}
                    >
                      <h4 className="google-agenda__year-month-title">
                        {mDate.toLocaleDateString('fr-FR', { month: 'long' })}
                      </h4>

                      <div className="google-agenda__year-mini-grid">
                        <div className="google-agenda__year-mini-days">
                          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                            <span key={i}>{d}</span>
                          ))}
                        </div>
                        {weeks.map((week, wIdx) => (
                          <div key={wIdx} className="google-agenda__year-mini-week">
                            {week.map((day) => {
                              const isCurrMonth = day.getMonth() === monthIdx;
                              const isToday = isSameDay(day, todayDate);
                              const presentClasses = visiblePresences.filter((p) =>
                                isDateInsidePresence(day, p)
                              );
                              const hasPresence = presentClasses.length > 0;
                              const firstColor = presentClasses[0]?.color.primary;

                              return (
                                <span
                                  key={day.toISOString()}
                                  className={`google-agenda__year-mini-cell${
                                    !isCurrMonth ? ' is-outside' : ''
                                  }${isToday ? ' is-today' : ''}${hasPresence ? ' has-presence' : ''}`}
                                  style={{
                                    backgroundColor: hasPresence ? `${firstColor}40` : undefined,
                                    borderColor: hasPresence ? firstColor : undefined,
                                  }}
                                  title={
                                    hasPresence
                                      ? `${day.toLocaleDateString('fr-FR')} : ${presentClasses
                                          .map((c) => c.classeNom)
                                          .join(', ')}`
                                      : undefined
                                  }
                                >
                                  {day.getDate()}
                                </span>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ==================================================================== */}
      {/* Event Details Modal                                                  */}
      {/* ==================================================================== */}
      <PresenceDetailModal
        open={detailModalOpen}
        item={detailItem}
        onClose={() => setDetailModalOpen(false)}
        onEdit={handleOpenEditPeriod}
        onDelete={handleDeletePeriod}
        onViewSchedule={handleViewSchedule}
      />

      {/* ==================================================================== */}
      {/* Add / Edit Period Modal                                              */}
      {/* ==================================================================== */}
      <PresencePeriodModal
        open={periodModalOpen}
        item={editingPeriod}
        classes={classes}
        defaultDate={modalDefaultDate}
        onClose={() => setPeriodModalOpen(false)}
        onSave={handleSavePeriod}
        loading={savingPeriod}
      />
    </div>
  );
}
