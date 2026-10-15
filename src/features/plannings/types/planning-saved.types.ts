import type { Seance } from '../../planning/types/planning.types';

export interface SeanceNonPlanifieeDTO {
  id?: number;
  debut?: string | null;
  fin?: string | null;
  professeurNomComplet?: string | null;
  classeNom?: string | null;
  matiereNom?: string | null;
  salleCode?: string | null;
  type?: string | null;
  groupe?: string | null;
  alignementCode?: string | null;
  motifEchec?: string;
}

export interface PlanningDTO {
  id?: number;
  nom: string;
  dateCreation: string;
  seances: Seance[];
  seancesNonPlanifiees?: SeanceNonPlanifieeDTO[];
}

export interface SeanceSaveDTO {
  id?: number;
  professeurId?: number | null;
  classeId?: number | null;
  matiereId?: number | null;
  salleId?: number | null;
  type?: string | null;
  debut?: string | null;
  fin?: string | null;
  groupe?: string | null;
  alignementCode?: string | null;
  creneauId?: number;
}

export interface PlanningSaveDTO {
  id?: number;
  nom: string;
  dateCreation?: string;
  seances: SeanceSaveDTO[];
}
