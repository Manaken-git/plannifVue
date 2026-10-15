import type { Classe } from '../../../classes/types/classe.types';
import type { ClassColorTheme, FlattenedPresence, MonthWeekSegment } from './classesPresence.types';

export const GOOGLE_CALENDAR_COLORS: ClassColorTheme[] = [
  { primary: '#4285F4', bg: 'rgba(66, 133, 244, 0.22)', border: 'rgba(66, 133, 244, 0.65)', text: '#93c5fd' }, // Blue
  { primary: '#0F9D58', bg: 'rgba(15, 157, 88, 0.22)', border: 'rgba(15, 157, 88, 0.65)', text: '#86efac' },   // Emerald
  { primary: '#F4B400', bg: 'rgba(244, 180, 0, 0.22)', border: 'rgba(244, 180, 0, 0.65)', text: '#fde047' },   // Amber
  { primary: '#EA4335', bg: 'rgba(234, 67, 53, 0.22)', border: 'rgba(234, 67, 53, 0.65)', text: '#fca5a5' },   // Coral
  { primary: '#A142F4', bg: 'rgba(161, 66, 244, 0.22)', border: 'rgba(161, 66, 244, 0.65)', text: '#d8b4fe' }, // Violet
  { primary: '#00ACC1', bg: 'rgba(0, 172, 193, 0.22)', border: 'rgba(0, 172, 193, 0.65)', text: '#67e8f9' },  // Cyan
  { primary: '#3949AB', bg: 'rgba(57, 73, 171, 0.24)', border: 'rgba(57, 73, 171, 0.70)', text: '#a5b4fc' },  // Indigo
  { primary: '#D81B60', bg: 'rgba(216, 27, 96, 0.22)', border: 'rgba(216, 27, 96, 0.65)', text: '#f472b6' },   // Rose
  { primary: '#F4511E', bg: 'rgba(244, 81, 30, 0.22)', border: 'rgba(244, 81, 30, 0.65)', text: '#fdba74' },   // Deep orange
  { primary: '#00897B', bg: 'rgba(0, 137, 123, 0.22)', border: 'rgba(0, 137, 123, 0.65)', text: '#5eead4' },  // Teal
  { primary: '#7CB342', bg: 'rgba(124, 179, 66, 0.22)', border: 'rgba(124, 179, 66, 0.65)', text: '#bef264' }, // Lime
  { primary: '#78909C', bg: 'rgba(120, 144, 156, 0.22)', border: 'rgba(120, 144, 156, 0.65)', text: '#cbd5e1' }, // Slate
];

export function getClassColor(classeId: number | undefined, index: number): ClassColorTheme {
  const seed = (classeId ?? index) % GOOGLE_CALENDAR_COLORS.length;
  return GOOGLE_CALENDAR_COLORS[Math.abs(seed)];
}

export function parseDateOnly(val: string): Date {
  const [y, m, d] = val.split('-').map(Number);
  const date = new Date(y, (m || 1) - 1, d || 1);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function formatDateIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function startOfWeek(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  const day = result.getDay();
  result.setDate(result.getDate() + (day === 0 ? -6 : 1 - day));
  return result;
}

export function endOfWeek(date: Date): Date {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function getWeekDays(baseDate: Date): Date[] {
  const start = startOfWeek(baseDate);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

/**
 * Generates weeks matrix for a given month (Lun - Dim)
 */
export function getMonthWeeks(year: number, monthIndex: number): Date[][] {
  const firstOfMonth = new Date(year, monthIndex, 1);
  const start = startOfWeek(firstOfMonth);

  const lastOfMonth = new Date(year, monthIndex + 1, 0);
  const end = endOfWeek(lastOfMonth);

  const weeks: Date[][] = [];
  const curr = new Date(start);

  while (curr <= end || weeks.length < 5) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(curr));
      curr.setDate(curr.getDate() + 1);
    }
    weeks.push(week);
    if (curr > end && weeks.length >= 5) break;
  }

  return weeks;
}

export function flattenPresences(classes: Classe[]): FlattenedPresence[] {
  const result: FlattenedPresence[] = [];

  classes.forEach((c, cIdx) => {
    if (!c.presences || c.presences.length === 0) return;
    const color = getClassColor(c.id, cIdx);

    c.presences.forEach((p, pIdx) => {
      if (!p.dateDebut || !p.dateFin) return;
      const startDate = parseDateOnly(p.dateDebut);
      const endDate = parseDateOnly(p.dateFin);

      result.push({
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
      });
    });
  });

  // Sort by start date then class name
  result.sort((a, b) => a.startDate.getTime() - b.startDate.getTime() || a.classeNom.localeCompare(b.classeNom));
  return result;
}

/**
 * Calculates how a presence spans across a specific week row (Monday = 0 ... Sunday = 6)
 */
export function getSegmentsForWeek(weekDays: Date[], presences: FlattenedPresence[]): MonthWeekSegment[] {
  const weekStart = weekDays[0];
  const weekEnd = weekDays[6];
  const segments: MonthWeekSegment[] = [];

  for (const item of presences) {
    // If no overlap with this week, skip
    if (item.endDate < weekStart || item.startDate > weekEnd) continue;

    let startCol = 0;
    let endCol = 6;
    let isSegmentStart = false;
    let isSegmentEnd = false;

    // Find start column
    for (let col = 0; col < 7; col++) {
      const day = weekDays[col];
      if (item.startDate <= day) {
        startCol = col;
        if (isSameDay(item.startDate, day)) {
          isSegmentStart = true;
        }
        break;
      }
    }

    // Find end column
    for (let col = 6; col >= 0; col--) {
      const day = weekDays[col];
      if (item.endDate >= day) {
        endCol = col;
        if (isSameDay(item.endDate, day)) {
          isSegmentEnd = true;
        }
        break;
      }
    }

    if (startCol <= endCol) {
      segments.push({
        presence: item,
        startCol,
        endCol,
        isSegmentStart,
        isSegmentEnd,
        totalDaysInSegment: endCol - startCol + 1,
      });
    }
  }

  // Stable sort: segments with larger width or earlier start first to stack nicely
  segments.sort((a, b) => {
    if (a.startCol !== b.startCol) return a.startCol - b.startCol;
    return b.totalDaysInSegment - a.totalDaysInSegment;
  });

  return segments;
}

export function isDateInsidePresence(date: Date, presence: FlattenedPresence): boolean {
  const t = date.getTime();
  const start = new Date(presence.startDate).setHours(0, 0, 0, 0);
  const end = new Date(presence.endDate).setHours(23, 59, 59, 999);
  return t >= start && t <= end;
}

export function getDurationDays(startDate: Date, endDate: Date): number {
  const diffMs = endDate.getTime() - startDate.getTime();
  return Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);
}

export function getDurationLabel(startDate: Date, endDate: Date): string {
  const days = getDurationDays(startDate, endDate);
  const weeks = Math.round((days / 7) * 10) / 10;
  if (days < 7) {
    return `${days} jour${days > 1 ? 's' : ''}`;
  }
  return `${days} jours (~${weeks} sem.)`;
}

export function getPresenceStatus(startDate: Date, endDate: Date): 'current' | 'upcoming' | 'past' {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  if (now > end) return 'past';
  if (now < startDate) return 'upcoming';
  return 'current';
}

/**
 * Export presence periods in iCalendar (.ics) format compatible with Google Calendar, Outlook, Apple Calendar
 */
export function exportPresencesToIcs(presences: FlattenedPresence[], filename = 'presence-classes.ics'): void {
  const pad = (n: number) => String(n).padStart(2, '0');
  const formatIcsDate = (d: Date, addDays = 0) => {
    const copy = new Date(d);
    if (addDays) copy.setDate(copy.getDate() + addDays);
    return `${copy.getFullYear()}${pad(copy.getMonth() + 1)}${pad(copy.getDate())}`;
  };

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Plannif//Presence Classes Calendar//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Présence des Classes',
    'X-WR-TIMEZONE:Europe/Paris',
  ];

  presences.forEach((item, index) => {
    const dtStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const dtStart = formatIcsDate(item.startDate);
    // DTEND for all-day events is exclusive in RFC 5545, so add 1 day
    const dtEnd = formatIcsDate(item.endDate, 1);

    lines.push(
      'BEGIN:VEVENT',
      `UID:presence-${item.classeId}-${index}-${dtStart}@plannif.local`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART;VALUE=DATE:${dtStart}`,
      `DTEND;VALUE=DATE:${dtEnd}`,
      `SUMMARY:Présence - ${item.classeNom}`,
      `DESCRIPTION:Période de présence à l\\'établissement pour la classe ${item.classeNom} (${item.effectif ?? 'Effectif non précisé'} élèves).`,
      'STATUS:CONFIRMED',
      'TRANSP:TRANSPARENT',
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');

  const content = lines.join('\r\n');
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
