import type { Matiere } from '../../matieres/types/matiere.types';
import type { Seance } from '../../planning/types/planning.types';

export interface PlageHoraire {
  id?: number;
  libelle: string;
}

export interface ProfesseurDayOff {
  id?: number;
  jourSemaine: number;
}

export interface Professeur {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  nb_heures: number;
  maxHeuresParJour?: number;
  maxHeuresParSemaine?: number;
  maxHeuresParSeance?: number;
  plageHorairePreferee?: PlageHoraire | null;
  seances?: Seance[];
  daysOff?: ProfesseurDayOff[];
  matieres?: Matiere[];
}
