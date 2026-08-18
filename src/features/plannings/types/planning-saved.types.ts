import type { Seance } from '../../planning/types/planning.types';

export interface PlanningDTO {
  id?: number;
  nom: string;
  dateCreation: string;
  seances: Seance[];
}

export interface PlanningSaveDTO {
  id?: number;
  nom: string;
  dateCreation?: string;
  seances: Array<{
    id?: number;
    professeurId?: number;
    classeId?: number;
    matiereId?: number;
    salleId?: number;
    creneauId?: number;
    type?: string;
  }>;
}
