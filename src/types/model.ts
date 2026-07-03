export interface PlageHoraire {
  id?: number;
  libelle: string;
}

export interface Equipement {
  id?: number;
  libelle: string;
}

export interface Matiere {
  id?: number;
  nom: string;
  volumeHoraireAnnuel?: number;
}

export interface ProfesseurDayOff {
  id?: number;
  professeurId?: number;
  dayOfWeek: number; // 0 = Lundi, 1 = Mardi, etc.
}

export interface Professeur {
  id?: number;
  nom: string;
  prenom: string;
  email?: string;
  nb_heures?: number;
  maxHeuresParJour?: number;
  maxHeuresParSemaine?: number;
  maxHeuresParSeance?: number;
  plageHorairePreferee?: PlageHoraire;
  daysOff?: ProfesseurDayOff[];
  matieres?: Matiere[];
}

export interface Salle {
  id?: number;
  code: string;
  capacite?: number;
  type?: string;
}

export interface Eleve {
  id?: number;
  nom: string;
  prenom: string;
  classe?: { id: number; nom?: string };
}

export interface ClassePresence {
  id?: number;
  classeId?: number;
  dateDebut: string; // ISO yyyy-MM-dd
  dateFin: string; // ISO yyyy-MM-dd
}

export interface Classe {
  id?: number;
  nom: string;
  eleves?: Eleve[];
  presences?: ClassePresence[];
}

export interface Creneau {
  id?: number;
  debut: string; // ISO LocalDateTime format
  fin: string; // ISO LocalDateTime format
}

export interface Seance {
  id?: number;
  professeur?: Professeur;
  classe?: Classe;
  matiere?: Matiere;
  salle?: Salle;
  creneau?: Creneau;
  type: 'COURS' | 'TP' | 'EXAMEN';
}

export interface MatiereClasseConfig {
  id?: number;
  classe?: Classe;
  matiere?: Matiere;
  dateDebut: string;
  dateFin: string;
}

export interface EquipementSalle {
  id?: number;
  salle?: Salle;
  equipement?: Equipement;
}

export interface DistanceSalle {
  id?: number;
  salle1?: Salle;
  salle2?: Salle;
  distance: number;
}

// Global planning solution interface as received/solved by Timefold
export interface Planning {
  seances: Seance[];
  creneaux: Creneau[];
  salles: Salle[];
  professeurs: Professeur[];
  classes: Classe[];
  matieres: Matiere[];
  professeurDayOffs: ProfesseurDayOff[];
  classePresences: ClassePresence[];
  matiereClasseConfigs: MatiereClasseConfig[];
  score?: {
    hardScore: number;
    softScore: number;
    feasible: boolean;
  };
}
