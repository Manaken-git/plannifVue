import {
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Layers,
  SlidersHorizontal,
} from 'lucide-react';
import {
  useMemo,
  useEffect,
  useState,
  type CSSProperties,
} from 'react';

import { Button } from '../../../../shared/ui/Button/Button';
import { DatePicker } from '../../../../shared/ui/DatePicker/DatePicker';

import type { Classe } from '../../../classes/types/classe.types';
import type { Matiere } from '../../../matieres/types/matiere.types';
import type { PlanningDTO } from '../../../plannings/types/planning-saved.types';
import type { Professeur } from '../../../professeurs/types/professeur.types';
import type { Salle } from '../../../salles/types/salle.types';

import { SessionCard } from '../SessionCard/SessionCard';
import { QuickReschedulePopover } from '../QuickReschedulePopover/QuickReschedulePopover';

import type {
  CalendarFilter,
  CalendarFilterType,
  Seance,
} from '../../types/planning.types';

import './CalendarGrid.css';

interface Props {
  seances: Seance[];
  professeurs: Professeur[];
  classes: Classe[];
  matieres: Matiere[];
  salles: Salle[];
  plannings: PlanningDTO[];

  selectedPlanningId: number | null;

  onPlanningChange: (
    id: number | null,
  ) => void;

  filter: CalendarFilter;

  onFilterChange: (
    filter: CalendarFilter,
  ) => void;

  onEdit: (
    seance: Seance,
  ) => void;

  onCreate: () => void;
  focusDate?: string;

  onQuickReschedule?: (
    seance: Seance,
    newDebut: string,
    newFin: string,
    pinned?: boolean,
  ) => Promise<void> | void;

  onTogglePin?: (
    seance: Seance,
  ) => Promise<void> | void;
}

/* ========================================================================== */
/* Configuration                                                              */
/* ========================================================================== */

/**
 * Plage affichée lorsqu'aucune séance
 * n'est présente dans la semaine.
 */
const DEFAULT_START_HOUR = 8;
const DEFAULT_END_HOUR = 18;

/**
 * Échelle verticale.
 *
 * 1h   = 96px
 * 30m  = 48px
 * 15m  = 24px
 */
const HOUR_HEIGHT = 96;

/**
 * Hauteur minimale pour conserver
 * une séance courte cliquable/lisible.
 */
const MIN_SESSION_HEIGHT = 48;

/**
 * Ajoute une heure sous la dernière séance.
 *
 * Ex :
 * dernière séance terminée à 16h
 * => planning visible jusqu'à 17h.
 */
const END_PADDING_HOURS = 1;

/* ========================================================================== */
/* Date helpers                                                               */
/* ========================================================================== */

function startOfWeek(
  date: Date,
) {
  const result = new Date(date);

  const day =
    result.getDay();

  result.setDate(
    result.getDate() +
      (
        day === 0
          ? -6
          : 1 - day
      ),
  );

  result.setHours(
    0,
    0,
    0,
    0,
  );

  return result;
}

function isSameDay(
  a: Date,
  b: Date,
) {
  return (
    a.getFullYear() ===
      b.getFullYear() &&
    a.getMonth() ===
      b.getMonth() &&
    a.getDate() ===
      b.getDate()
  );
}

function asDate(
  value: string,
) {
  const date =
    new Date(value);

  return Number.isNaN(
    date.getTime(),
  )
    ? null
    : date;
}

function dateValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function minutesFromMidnight(
  date: Date,
) {
  return (
    date.getHours() * 60 +
    date.getMinutes()
  );
}

function floorHour(
  minutes: number,
) {
  return Math.floor(
    minutes / 60,
  );
}

function ceilHour(
  minutes: number,
) {
  return Math.ceil(
    minutes / 60,
  );
}

/* ========================================================================== */
/* Component                                                                  */
/* ========================================================================== */

export function CalendarGrid({
  seances,
  professeurs,
  classes,
  matieres,
  salles,
  plannings,

  selectedPlanningId,
  onPlanningChange,

  filter,
  onFilterChange,

  onEdit,
  onCreate,
  focusDate,
  onQuickReschedule,
  onTogglePin,
}: Props) {
  const [draggedSeance, setDraggedSeance] = useState<Seance | null>(null);
  const [dragOverDayIndex, setDragOverDayIndex] = useState<number | null>(null);
  const [dragPreview, setDragPreview] = useState<{
    dayIndex: number;
    top: number;
    height: number;
    timeLabel: string;
  } | null>(null);
  const [quickPopoverSession, setQuickPopoverSession] = useState<{
    seance: Seance;
    rect: DOMRect;
  } | null>(null);
  const [
    weekStart,
    setWeekStart,
  ] = useState(
    () =>
      startOfWeek(
        new Date(),
      ),
  );

  const [showWeekend, setShowWeekend] = useState(false);

  const today =
    new Date();

  useEffect(() => {
    if (focusDate) setWeekStart(startOfWeek(new Date(focusDate)));
  }, [focusDate]);

  /* ------------------------------------------------------------------------ */
  /* Détection de séances le week-end                                         */
  /* ------------------------------------------------------------------------ */

  const hasWeekendSessions = useMemo(() => {
    const saturday = new Date(weekStart);
    saturday.setDate(weekStart.getDate() + 5);
    const sunday = new Date(weekStart);
    sunday.setDate(weekStart.getDate() + 6);

    return seances.some((seance) => {
      const date = asDate(seance.debut);
      if (!date) return false;
      return isSameDay(date, saturday) || isSameDay(date, sunday);
    });
  }, [seances, weekStart]);

  const is5Days = !showWeekend && !hasWeekendSessions;

  /* ------------------------------------------------------------------------ */
  /* Jours de la semaine (5 jours Lun-Ven ou 7 jours)                         */
  /* ------------------------------------------------------------------------ */

  const weekDays =
    useMemo(
      () =>
        Array.from(
          {
            length: is5Days ? 5 : 7,
          },
          (
            _,
            index,
          ) => {
            const day =
              new Date(
                weekStart,
              );

            day.setDate(
              weekStart.getDate() +
                index,
            );

            return day;
          },
        ),
      [weekStart, is5Days],
    );

  /* ------------------------------------------------------------------------ */
  /* Séances visibles cette semaine                                           */
  /* ------------------------------------------------------------------------ */

  const visible =
    useMemo(
      () =>
        seances.filter(
          (
            seance,
          ) => {
            const date =
              asDate(
                seance.debut,
              );

            if (!date) {
              return false;
            }

            return weekDays.some(
              (
                day,
              ) =>
                isSameDay(
                  date,
                  day,
                ),
            );
          },
        ),
      [
        seances,
        weekDays,
      ],
    );

  /* ------------------------------------------------------------------------ */
  /* Plage horaire automatique                                                */
  /* ------------------------------------------------------------------------ */

  const visibleRange =
    useMemo(
      () => {
        if (
          visible.length ===
          0
        ) {
          return {
            startHour:
              DEFAULT_START_HOUR,

            endHour:
              DEFAULT_END_HOUR,
          };
        }

        let earliestStart =
          Number.POSITIVE_INFINITY;

        let latestEnd =
          Number.NEGATIVE_INFINITY;

        visible.forEach(
          (
            seance,
          ) => {
            const start =
              asDate(
                seance.debut,
              );

            const end =
              asDate(
                seance.fin,
              );

            if (
              !start ||
              !end
            ) {
              return;
            }

            earliestStart =
              Math.min(
                earliestStart,
                minutesFromMidnight(
                  start,
                ),
              );

            latestEnd =
              Math.max(
                latestEnd,
                minutesFromMidnight(
                  end,
                ),
              );
          },
        );

        if (
          !Number.isFinite(
            earliestStart,
          ) ||
          !Number.isFinite(
            latestEnd,
          )
        ) {
          return {
            startHour:
              DEFAULT_START_HOUR,

            endHour:
              DEFAULT_END_HOUR,
          };
        }

        const startHour =
          Math.max(
            0,
            floorHour(
              earliestStart,
            ),
          );

        const endHour =
          Math.min(
            24,
            ceilHour(
              latestEnd,
            ) +
              END_PADDING_HOURS,
          );

        return {
          startHour,

          endHour:
            Math.max(
              startHour +
                1,
              endHour,
            ),
        };
      },
      [visible],
    );

  /* ------------------------------------------------------------------------ */
  /* Liste des heures                                                         */
  /* ------------------------------------------------------------------------ */

  const hours =
    useMemo(
      () =>
        Array.from(
          {
            length:
              visibleRange.endHour -
              visibleRange.startHour,
          },
          (
            _,
            index,
          ) =>
            visibleRange.startHour +
            index,
        ),
      [
        visibleRange,
      ],
    );

  const calendarHeight =
    hours.length *
    HOUR_HEIGHT;

  /* ------------------------------------------------------------------------ */
  /* Libellé semaine                                                          */
  /* ------------------------------------------------------------------------ */

  const weekLabel =
    useMemo(
      () => {
        if (!weekDays || weekDays.length === 0) {
          return '';
        }

        const first =
          weekDays[0];

        const last =
          weekDays[
            weekDays.length - 1
          ];

        const formatter =
          new Intl.DateTimeFormat(
            'fr-FR',
            {
              day: 'numeric',
              month: 'short',
            },
          );

        return `${formatter.format(first)} — ${formatter.format(last)} ${last.getFullYear()}`;
      },
      [weekDays],
    );

  /* ------------------------------------------------------------------------ */
  /* Navigation                                                               */
  /* ------------------------------------------------------------------------ */

  const shiftWeek = (
    amount: number,
  ) => {
    setWeekStart(
      (
        current,
      ) => {
        const next =
          new Date(
            current,
          );

        next.setDate(
          next.getDate() +
            amount * 7,
        );

        return next;
      },
    );
  };

  const goToToday =
    () => {
      setWeekStart(
        startOfWeek(
          new Date(),
        ),
      );
    };

  /* ------------------------------------------------------------------------ */
  /* Position d'une séance                                                    */
  /* ------------------------------------------------------------------------ */

  const position = (
    seance: Seance,
  ) => {
    const start =
      asDate(
        seance.debut,
      );

    const end =
      asDate(
        seance.fin,
      );

    if (
      !start ||
      !end
    ) {
      return null;
    }

    const dayIndex =
      weekDays.findIndex(
        (
          day,
        ) =>
          isSameDay(
            day,
            start,
          ),
      );

    if (
      dayIndex < 0
    ) {
      return null;
    }

    const startMinutes =
      minutesFromMidnight(
        start,
      );

    const durationMinutes =
      (
        end.getTime() -
        start.getTime()
      ) /
      60_000;

    if (
      durationMinutes <=
      0
    ) {
      return null;
    }

    const gridStartMinutes =
      visibleRange.startHour *
      60;

    const top =
      (
        (
          startMinutes -
          gridStartMinutes
        ) /
        60
      ) *
      HOUR_HEIGHT;

    const height =
      (
        durationMinutes /
        60
      ) *
      HOUR_HEIGHT;

    return {
      dayIndex,

      top:
        Math.max(
          0,
          top,
        ),

      height:
        Math.max(
          MIN_SESSION_HEIGHT,
          height,
        ),
    };
  };

  /* ------------------------------------------------------------------------ */
  /* Filtres                                                                  */
  /* ------------------------------------------------------------------------ */

  const setType = (
    type: CalendarFilterType,
  ) => {
    onFilterChange({
      type,
      value: '',
    });
  };

  /* ======================================================================== */
  /* Render                                                                   */
  /* ======================================================================== */

  return (
    <section className="calendar-panel">

      {/* ==================================================================== */}
      {/* Toolbar                                                              */}
      {/* ==================================================================== */}

      <div className="calendar-toolbar">

        {/* Navigation semaine */}

        <div className="calendar-week-nav">
          <Button
            variant="icon"
            onClick={() =>
              shiftWeek(
                -1,
              )
            }
            aria-label="Semaine précédente"
            icon={
              <ChevronLeft
                size={16}
              />
            }
          />

          <DatePicker value={dateValue(weekStart)} displayLabel={weekLabel} onChange={(value) => setWeekStart(startOfWeek(new Date(`${value}T12:00:00`)))} />

          <Button
            variant="icon"
            onClick={() =>
              shiftWeek(
                1,
              )
            }
            aria-label="Semaine suivante"
            icon={
              <ChevronRight
                size={16}
              />
            }
          />

          <button
            type="button"
            className="calendar-today"
            onClick={
              goToToday
            }
          >
            Aujourd'hui
          </button>
        </div>

        {/* Filtres */}

        <div className="calendar-filters">

          {/* Source planning */}

          <label>
            <span>
              Source
            </span>

            <select
              value={
                selectedPlanningId ??
                ''
              }
              onChange={(
                event,
              ) =>
                onPlanningChange(
                  event
                    .target
                    .value
                    ? Number(
                        event
                          .target
                          .value,
                      )
                    : null,
                )
              }
            >
              <option value="">
                Séances globales
              </option>

              {plannings.map(
                (
                  planning,
                ) => (
                  <option
                    key={
                      planning.id
                    }
                    value={
                      planning.id
                    }
                  >
                    {
                      planning.nom
                    }
                  </option>
                ),
              )}
            </select>
          </label>

          {/* Type de filtre */}

          <div className="calendar-filter-select">
            <SlidersHorizontal
              size={14}
            />

            <select
              value={
                filter.type
              }
              onChange={(
                event,
              ) =>
                setType(
                  event
                    .target
                    .value as CalendarFilterType,
                )
              }
            >
              <option value="all">
                Tous
              </option>

              <option value="professeur">
                Enseignant
              </option>

              <option value="classe">
                Classe
              </option>

              <option value="matiere">
                Matière
              </option>

              <option value="salle">
                Salle
              </option>
            </select>
          </div>

          {/* Enseignant */}

          {filter.type ===
            'professeur' && (
            <select
              value={
                filter.value
              }
              onChange={(
                event,
              ) =>
                onFilterChange(
                  {
                    ...filter,

                    value:
                      event
                        .target
                        .value,
                  },
                )
              }
            >
              <option value="">
                Tous les enseignants
              </option>

              {professeurs.map(
                (
                  professeur,
                ) => (
                  <option
                    key={
                      professeur.id
                    }
                    value={`${professeur.prenom} ${professeur.nom}`}
                  >
                    {
                      professeur.prenom
                    }{' '}
                    {
                      professeur.nom
                    }
                  </option>
                ),
              )}
            </select>
          )}

          {/* Classe */}

          {filter.type ===
            'classe' && (
            <select
              value={
                filter.value
              }
              onChange={(
                event,
              ) =>
                onFilterChange(
                  {
                    ...filter,

                    value:
                      event
                        .target
                        .value,
                  },
                )
              }
            >
              <option value="">
                Toutes les classes
              </option>

              {classes.map(
                (
                  classe,
                ) => (
                  <option
                    key={
                      classe.id
                    }
                    value={
                      classe.nom
                    }
                  >
                    {
                      classe.nom
                    }
                  </option>
                ),
              )}
            </select>
          )}

          {/* Matière */}

          {filter.type ===
            'matiere' && (
            <select
              value={
                filter.value
              }
              onChange={(
                event,
              ) =>
                onFilterChange(
                  {
                    ...filter,

                    value:
                      event
                        .target
                        .value,
                  },
                )
              }
            >
              <option value="">
                Toutes les matières
              </option>

              {matieres.map(
                (
                  matiere,
                ) => (
                  <option
                    key={
                      matiere.id
                    }
                    value={
                      matiere.nom
                    }
                  >
                    {
                      matiere.nom
                    }
                  </option>
                ),
              )}
            </select>
          )}

          {/* Salle */}

          {filter.type ===
            'salle' && (
            <select
              value={
                filter.value
              }
              onChange={(
                event,
              ) =>
                onFilterChange(
                  {
                    ...filter,

                    value:
                      event
                        .target
                        .value,
                  },
                )
              }
            >
              <option value="">
                Toutes les salles
              </option>

              {salles.map(
                (
                  salle,
                ) => (
                  <option
                    key={
                      salle.id
                    }
                    value={
                      salle.code
                    }
                  >
                    {
                      salle.code
                    }
                  </option>
                ),
              )}
            </select>
          )}

        </div>
      </div>

      {/* ==================================================================== */}
      {/* Barre d'accès rapide aux classes & toggle semaine                     */}
      {/* ==================================================================== */}
      <div className="calendar-quick-strip">
        <div className="calendar-quick-classes">
          <span className="calendar-quick-label">
            <Layers size={13} />
            <span>Classes :</span>
          </span>
          <button
            type="button"
            className={`calendar-class-pill ${filter.type === 'all' || (filter.type === 'classe' && !filter.value) ? 'is-active' : ''}`}
            onClick={() => onFilterChange({ type: 'all', value: '' })}
          >
            Toutes
          </button>
          {classes.map((c) => {
            const isActive = filter.type === 'classe' && filter.value === c.nom;
            return (
              <button
                key={c.id ?? c.nom}
                type="button"
                className={`calendar-class-pill ${isActive ? 'is-active' : ''}`}
                onClick={() => {
                  if (isActive) {
                    onFilterChange({ type: 'all', value: '' });
                  } else {
                    onFilterChange({ type: 'classe', value: c.nom });
                  }
                }}
              >
                {c.nom}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className={`calendar-view-toggle ${is5Days ? 'is-5d' : 'is-7d'}`}
          onClick={() => setShowWeekend((prev) => !prev)}
          title={
            hasWeekendSessions
              ? 'Séances planifiées le week-end (affichage 7j actif)'
              : is5Days
                ? 'Afficher Samedi et Dimanche'
                : 'Masquer le week-end (Semaine Lun-Ven)'
          }
        >
          <Calendar size={13} />
          <span>{is5Days ? '5 jours' : '7 jours'}</span>
          {hasWeekendSessions && <span className="calendar-weekend-dot" title="Séances présentes le week-end" />}
        </button>
      </div>

      {/* ==================================================================== */}
      {/* Calendrier                                                           */}
      {/* ==================================================================== */}

      <div
        className={`calendar-grid ${is5Days ? 'calendar-grid--5-days' : 'calendar-grid--7-days'}`}
        style={
          {
            '--calendar-height':
              `${calendarHeight}px`,

            '--hour-height':
              `${HOUR_HEIGHT}px`,
          } as CSSProperties
        }
      >

        {/* ================================================================ */}
        {/* Header fixe                                                      */}
        {/* ================================================================ */}

        <div className="calendar-grid__header">

          <div className="calendar-grid__corner">
            Heure
          </div>

          {weekDays.map(
            (
              day,
            ) => {
              const isToday =
                isSameDay(
                  day,
                  today,
                );

              return (
                <div
                  key={
                    day.toISOString()
                  }
                  className={`calendar-grid__day-header${
                    isToday
                      ? ' is-today'
                      : ''
                  }`}
                >
                  <span>
                    {new Intl.DateTimeFormat(
                      'fr-FR',
                      {
                        weekday:
                          'short',
                      },
                    )
                      .format(
                        day,
                      )
                      .replace(
                        '.',
                        '',
                      )}
                  </span>

                  <strong>
                    {
                      day.getDate()
                    }
                  </strong>
                </div>
              );
            },
          )}

        </div>

        {/* ================================================================ */}
        {/* Body scrollable                                                  */}
        {/* ================================================================ */}

        <div className="calendar-grid__body-scroll">

          <div className="calendar-grid__body">

            {/* ------------------------------------------------------------ */}
            {/* Horaires                                                     */}
            {/* ------------------------------------------------------------ */}

            <div className="calendar-grid__times">
              {hours.map(
                (
                  hour,
                ) => (
                  <div
                    key={
                      hour
                    }
                    style={{
                      height:
                        HOUR_HEIGHT,
                    }}
                  >
                    <span>
                      {String(
                        hour,
                      ).padStart(
                        2,
                        '0',
                      )}
                      :00
                    </span>
                  </div>
                ),
              )}
            </div>

            {/* ------------------------------------------------------------ */}
            {/* Jours                                                        */}
            {/* ------------------------------------------------------------ */}

            {weekDays.map(
              (
                day,
                dayIndex,
              ) => (
                <div
                  key={
                    day.toISOString()
                  }
                  className={`calendar-grid__column${
                    isSameDay(
                      day,
                      today,
                    )
                      ? ' is-today'
                      : ''
                  }${dragOverDayIndex === dayIndex ? ' is-drag-over' : ''}`}
                  style={{
                    height:
                      calendarHeight,
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';

                    const columnEl = e.currentTarget;
                    const rect = columnEl.getBoundingClientRect();
                    const offsetY = Math.max(0, e.clientY - rect.top);

                    const totalMinutesFromStart = (offsetY / HOUR_HEIGHT) * 60;
                    const roundedMinutes = Math.round(totalMinutesFromStart / 30) * 30;
                    const startHour = visibleRange.startHour + Math.floor(roundedMinutes / 60);
                    const startMinute = roundedMinutes % 60;

                    const previewTop = ((startHour - visibleRange.startHour) * 60 + startMinute) * (HOUR_HEIGHT / 60);

                    let durationMinutes = 60;
                    if (draggedSeance) {
                      const diff = (new Date(draggedSeance.fin).getTime() - new Date(draggedSeance.debut).getTime()) / (60 * 1000);
                      if (diff > 0) durationMinutes = diff;
                    }
                    const previewHeight = (durationMinutes / 60) * HOUR_HEIGHT;

                    const pad = (n: number) => String(n).padStart(2, '0');
                    const endTotalMin = startHour * 60 + startMinute + durationMinutes;
                    const endHour = Math.floor(endTotalMin / 60);
                    const endMinute = endTotalMin % 60;
                    const timeLabel = `${pad(startHour)}:${pad(startMinute)} – ${pad(endHour)}:${pad(endMinute)}`;

                    if (
                      !dragPreview ||
                      dragPreview.dayIndex !== dayIndex ||
                      dragPreview.top !== previewTop ||
                      dragPreview.height !== previewHeight
                    ) {
                      setDragPreview({
                        dayIndex,
                        top: previewTop,
                        height: previewHeight,
                        timeLabel,
                      });
                    }

                    if (dragOverDayIndex !== dayIndex) {
                      setDragOverDayIndex(dayIndex);
                    }
                  }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setDragOverDayIndex(null);
                      setDragPreview(null);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverDayIndex(null);
                    setDragPreview(null);
                    let seanceToMove = draggedSeance;
                    if (!seanceToMove) {
                      try {
                        const raw = e.dataTransfer.getData('application/json');
                        if (raw) seanceToMove = JSON.parse(raw);
                      } catch {}
                    }
                    if (!seanceToMove) return;

                    const columnEl = e.currentTarget;
                    const rect = columnEl.getBoundingClientRect();
                    const offsetY = Math.max(0, e.clientY - rect.top);

                    const totalMinutesFromStart = (offsetY / HOUR_HEIGHT) * 60;
                    const roundedMinutes = Math.round(totalMinutesFromStart / 30) * 30;
                    const startHour = visibleRange.startHour + Math.floor(roundedMinutes / 60);
                    const startMinute = roundedMinutes % 60;

                    const targetDay = weekDays[dayIndex];
                    const pad = (n: number) => String(n).padStart(2, '0');
                    const year = targetDay.getFullYear();
                    const month = pad(targetDay.getMonth() + 1);
                    const dayStr = pad(targetDay.getDate());
                    const newDebut = `${year}-${month}-${dayStr}T${pad(startHour)}:${pad(startMinute)}:00`;

                    const originalDurationMs = Math.max(
                      30 * 60 * 1000,
                      new Date(seanceToMove.fin).getTime() - new Date(seanceToMove.debut).getTime()
                    );
                    const newEndDate = new Date(new Date(newDebut).getTime() + originalDurationMs);
                    const newFin = `${newEndDate.getFullYear()}-${pad(newEndDate.getMonth() + 1)}-${pad(newEndDate.getDate())}T${pad(newEndDate.getHours())}:${pad(newEndDate.getMinutes())}:00`;

                    onQuickReschedule?.(seanceToMove, newDebut, newFin, true);
                    setDraggedSeance(null);
                  }}
                >

                  {/* Lignes horaires */}

                  {hours.map(
                    (
                      h,
                    ) => (
                      <div
                        key={
                          h
                        }
                        className="calendar-grid__hour"
                        style={{
                          height:
                            HOUR_HEIGHT,
                        }}
                      />
                    ),
                  )}

                  {/* Zone de pause méridienne lycée (11h30 - 14h00) */}
                  {visibleRange.startHour <= 11.5 && visibleRange.endHour >= 14 && (
                    <div
                      className="calendar-grid__lunch-break"
                      style={{
                        position: 'absolute',
                        top: (11.5 - visibleRange.startHour) * HOUR_HEIGHT,
                        height: 2.5 * HOUR_HEIGHT,
                        left: 0,
                        right: 0,
                        background: 'repeating-linear-gradient(45deg, rgba(245, 158, 11, 0.03), rgba(245, 158, 11, 0.03) 10px, transparent 10px, transparent 20px)',
                        borderTop: '1px dashed rgba(245, 158, 11, 0.25)',
                        borderBottom: '1px dashed rgba(245, 158, 11, 0.25)',
                        pointerEvents: 'none',
                        zIndex: 1,
                      }}
                    >
                      <span style={{ fontSize: '10px', color: 'rgba(245, 158, 11, 0.7)', padding: '2px 6px', fontWeight: 500 }}>
                        Pause méridienne
                      </span>
                    </div>
                  )}

                  {/* Ombre portée de largage / Drop Target Preview */}
                  {dragPreview && dragPreview.dayIndex === dayIndex && (
                    <div
                      className="calendar-grid__drop-preview"
                      style={{
                        top: dragPreview.top,
                        height: dragPreview.height,
                      }}
                    >
                      <div className="calendar-grid__drop-preview-content">
                        <span className="calendar-grid__drop-preview-time">{dragPreview.timeLabel}</span>
                        <span className="calendar-grid__drop-preview-label">Déplacer ici</span>
                      </div>
                    </div>
                  )}

                  {/* Séances avec support des demi-groupes parallèles et alertes */}
                  {(() => {
                    const daySessions = visible.filter((seance) => {
                      const pos = position(seance);
                      return pos && pos.dayIndex === dayIndex;
                    });

                    return daySessions.map((seance) => {
                      const pos = position(seance)!;

                      // Détection de chevauchement (demi-groupes / alignements)
                      const overlapping = daySessions.filter((other) => {
                        if (other === seance) return false;
                        const s1 = new Date(seance.debut).getTime();
                        const e1 = new Date(seance.fin).getTime();
                        const s2 = new Date(other.debut).getTime();
                        const e2 = new Date(other.fin).getTime();
                        return s1 < e2 && s2 < e1;
                      });

                      let left: string | undefined;
                      let width: string | undefined;
                      let isNarrow = false;
                      let isRightAligned = false;

                      if (overlapping.length > 0) {
                        const allCluster = [seance, ...overlapping].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
                        const myIdx = allCluster.findIndex((s) => (s.id ?? s.debut) === (seance.id ?? seance.debut));
                        const totalCol = allCluster.length;
                        left = `calc(${myIdx * (100 / totalCol)}% + 3px)`;
                        width = `calc(${100 / totalCol}% - 6px)`;
                        isNarrow = totalCol >= 2;
                        isRightAligned = myIdx >= Math.floor(totalCol / 2);
                      }

                      // Alerte de capacité de la salle vs effectif
                      const salle = salles.find((s) => s.code === seance.salleCode);
                      const classe = classes.find((c) => c.nom === seance.classeNom);
                      let warning: string | undefined;
                      if (salle && classe) {
                        const grp = seance.groupe || seance.groupeNom;
                        const needed = grp && grp !== 'Classe entière'
                          ? Math.ceil((classe.effectif ?? 30) / 2)
                          : (classe.effectif ?? 30);
                        if (salle.capacite < needed) {
                          warning = `Capacité insuffisante (${salle.capacite} places pour ${needed} élèves)`;
                        }
                      }

                      return (
                        <SessionCard
                          key={seance.id ?? `${seance.debut}-${seance.matiereNom}`}
                          seance={seance}
                          top={pos.top}
                          height={pos.height}
                          left={left}
                          width={width}
                          isNarrow={isNarrow}
                          isRightAligned={isRightAligned}
                          warning={warning}
                          onClick={() => onEdit(seance)}
                          onTogglePin={onTogglePin}
                          onOpenQuickPopover={(s, rect) => setQuickPopoverSession({ seance: s, rect })}
                          onDragStart={(_, s) => setDraggedSeance(s)}
                          onDragEnd={() => {
                            setDraggedSeance(null);
                            setDragOverDayIndex(null);
                            setDragPreview(null);
                          }}
                        />
                      );
                    });
                  })()}

                </div>
              ),
            )}

            {/* ------------------------------------------------------------ */}
            {/* Empty state                                                  */}
            {/* ------------------------------------------------------------ */}

            {visible.length ===
              0 && (
              <div className="calendar-grid__empty">

                <div className="calendar-grid__empty-icon">
                  <CalendarDays
                    size={22}
                  />
                </div>

                <strong>
                  Aucune séance cette semaine
                </strong>

                <p>
                  Créez une séance ou changez de
                  semaine pour afficher le planning.
                </p>

                <Button
                  variant="secondary"
                  onClick={
                    onCreate
                  }
                >
                  Créer une séance
                </Button>

              </div>
            )}

          </div>
        </div>

      </div>

      {quickPopoverSession && (
        <QuickReschedulePopover
          seance={quickPopoverSession.seance}
          anchorRect={quickPopoverSession.rect}
          days={weekDays}
          onClose={() => setQuickPopoverSession(null)}
          onApply={(newDebut, newFin, pinned) => {
            onQuickReschedule?.(quickPopoverSession.seance, newDebut, newFin, pinned);
            setQuickPopoverSession(null);
          }}
          onOpenFullEdit={(s) => {
            setQuickPopoverSession(null);
            onEdit(s);
          }}
        />
      )}
    </section>
  );
}
