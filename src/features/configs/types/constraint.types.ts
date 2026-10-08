export type ConstraintScoreLevel = 'HARD' | 'SOFT';

export type ConstraintCategory = 'ROOM' | 'STUDENT' | 'TEACHER' | 'PEDAGOGY';

export interface ConstraintConfigItem {
  id: string;
  label: string;
  description: string;
  category: ConstraintCategory;
  level: ConstraintScoreLevel;
  weight: number;
  isProportional: boolean;
  unitLabel?: string;
  active: boolean;
}

export interface ConstraintConfiguration {
  id?: number;
  nom: string;
  description?: string;
  constraints: ConstraintConfigItem[];
}

export interface ScoreConstraintConfigDTO {
  id?: number;
  nom: string;
  isDefault?: boolean;
  roomConflictWeight?: number;
  teacherConflictWeight?: number;
  studentGroupConflictWeight?: number;
  teacherDayOffWeight?: number;
  teacherMaxHoursPerDayWeight?: number;
  teacherMaxHoursPerWeekWeight?: number;
  teacherMaxGapWeight?: number;
  seanceDurationMatchWeight?: number;
  studentLunchBreakWeight?: number;
  teacherLunchBreakWeight?: number;
  studentDailySpanWeight?: number;
  studentGapWeight?: number;
  travelDistanceWeight?: number;
  cognitiveLoadMorningWeight?: number;
  twoHourBlockWeight?: number;
}
