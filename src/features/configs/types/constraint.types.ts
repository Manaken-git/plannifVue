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
