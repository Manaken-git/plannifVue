export interface Seance {
  id?: number;
  debut: string;
  fin: string;
  professeurNomComplet?: string;
  classeNom?: string;
  matiereNom?: string;
  salleCode?: string;
}

export interface SessionAssociations {
  professeurId?: number;
  classeId?: number;
  matiereId?: number;
  salleId?: number;
}

export type CalendarFilterType = 'all' | 'professeur' | 'classe' | 'matiere' | 'salle';
export interface CalendarFilter {
  type: CalendarFilterType;
  value: string;
}
