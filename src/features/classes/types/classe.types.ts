export type RoleReferent = 'PRINCIPAL' | 'CO_REFERENT' | 'TUTEUR_ENTREPRISE';

export interface ClasseReferent {
  id?: number;
  professeurId: number;
  professeurNom?: string;
  professeurPrenom?: string;
  role: RoleReferent;
}

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
  referents?: ClasseReferent[];
}
