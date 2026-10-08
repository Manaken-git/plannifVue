export interface MatiereClasseConfig {
  id?: number;
  classeId?: number;
  classeNom?: string;
  matiereId?: number;
  matiereNom?: string;
  dateDebut?: string | null;
  dateFin?: string | null;
  volumeHorairePeriode?: number | null;
  prioriteMatin?: boolean;
  chargeCognitiveElevee?: boolean;
  autoriserBlocDouble?: boolean;
  dureeParDefautMinutes?: number | null;
  equipementsRequis?: string[];
  typeSalleRequis?: string;
}
