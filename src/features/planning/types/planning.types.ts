export interface Seance {
  id?: number;
  debut: string;
  fin: string;
  professeurNomComplet?: string;
  classeNom?: string;
  matiereNom?: string;
  salleCode?: string;
  type?: string;
  typeSeance?: string; // alias
  groupe?: string;
  groupeNom?: string; // alias
  alignementCode?: string;
  alignementId?: string; // alias
  equipementsRequis?: string[];
}

export interface SessionAssociations {
  professeurId?: number;
  classeId?: number;
  matiereId?: number;
  salleId?: number;
  type?: string;
  typeSeance?: string;
  groupe?: string;
  groupeNom?: string;
  alignementCode?: string;
  alignementId?: string;
}

export type CalendarFilterType = 'all' | 'professeur' | 'classe' | 'matiere' | 'salle';
export interface CalendarFilter {
  type: CalendarFilterType;
  value: string;
}
