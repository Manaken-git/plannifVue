import type { Classe, ClassePresence } from '../../../classes/types/classe.types';

export type AgendaViewMode = 'month' | 'week' | 'agenda' | 'year';

export interface ClassColorTheme {
  primary: string;
  bg: string;
  border: string;
  text: string;
}

export interface FlattenedPresence {
  key: string;
  presenceId?: number;
  classeId: number;
  classeNom: string;
  effectif?: number;
  dateDebut: string; // YYYY-MM-DD
  dateFin: string;   // YYYY-MM-DD
  startDate: Date;
  endDate: Date;
  color: ClassColorTheme;
  classe: Classe;
  presence: ClassePresence;
  periodIndex: number;
}

export interface MonthWeekSegment {
  presence: FlattenedPresence;
  startCol: number; // 0 to 6 (Mon to Sun)
  endCol: number;   // 0 to 6 (Mon to Sun)
  isSegmentStart: boolean; // true if this segment is the true start date of the period
  isSegmentEnd: boolean;   // true if this segment is the true end date of the period
  totalDaysInSegment: number;
}
