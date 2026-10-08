export interface ClassePresence {
  id?: number;
  dateDebut: string;
  dateFin: string;
}

export interface ClasseGroupe {
  id?: number;
  nom: string;
  effectif: number;
}

export interface Classe {
  id?: number;
  nom: string;
  effectif?: number;
  groupes?: ClasseGroupe[];
  heureDebutMin?: string;
  heureFinMax?: string;
  maxHeuresParJour?: number;
  pauseDejeunerDebutMin?: string;
  pauseDejeunerFinMax?: string;
  pauseDejeunerDureeMin?: number;
  dureePauseDejeunerMin?: number; // alias
  presences?: ClassePresence[];
}
