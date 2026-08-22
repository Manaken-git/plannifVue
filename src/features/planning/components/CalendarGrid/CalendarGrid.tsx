import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
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
}: Props) {
  const [
    weekStart,
    setWeekStart,
  ] = useState(
    () =>
      startOfWeek(
        new Date(),
      ),
  );

  const today =
    new Date();

  useEffect(() => {
    if (focusDate) setWeekStart(startOfWeek(new Date(focusDate)));
  }, [focusDate]);

  /* ------------------------------------------------------------------------ */
  /* Jours de la semaine                                                      */
  /* ------------------------------------------------------------------------ */

  const weekDays =
    useMemo(
      () =>
        Array.from(
          {
            length: 7,
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
      [weekStart],
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
        const first =
          weekDays[0];

        const last =
          weekDays[6];

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
      {/* Calendrier                                                           */}
      {/* ==================================================================== */}

      <div
        className="calendar-grid"
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
                  }`}
                  style={{
                    height:
                      calendarHeight,
                  }}
                >

                  {/* Lignes horaires */}

                  {hours.map(
                    (
                      hour,
                    ) => (
                      <div
                        key={
                          hour
                        }
                        className="calendar-grid__hour"
                        style={{
                          height:
                            HOUR_HEIGHT,
                        }}
                      />
                    ),
                  )}

                  {/* Séances */}

                  {visible.map(
                    (
                      seance,
                    ) => {
                      const pos =
                        position(
                          seance,
                        );

                      if (
                        !pos ||
                        pos.dayIndex !==
                          dayIndex
                      ) {
                        return null;
                      }

                      return (
                        <SessionCard
                          key={
                            seance.id ??
                            `${seance.debut}-${seance.matiereNom}`
                          }
                          seance={
                            seance
                          }
                          top={
                            pos.top
                          }
                          height={
                            pos.height
                          }
                          onClick={() =>
                            onEdit(
                              seance,
                            )
                          }
                        />
                      );
                    },
                  )}

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
    </section>
  );
}
