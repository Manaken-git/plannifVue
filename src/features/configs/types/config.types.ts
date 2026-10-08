export interface MatiereClasseConfig {
  id?: number;
  classeId?: number;
  classeNom?: string;
  matiereId?: number;
  matiereNom?: string;
  dateDebut?: string | null;
  dateFin?: string | null;
  volumeHorairePeriode?: number | null;
  typeSalleRequis?: string;
  dureeCoursMinutes?: number | null;
  dureeTpMinutes?: number | null;
  forteChargeCognitive?: boolean;
  autoriserBlocDeuxHeures?: boolean;
  equipementsRequis?: Array<{ id?: number; libelle?: string } | string>;

  // Aliases de compatibilité
  prioriteMatin?: boolean;
  chargeCognitiveElevee?: boolean;
  autoriserBlocDouble?: boolean;
  dureeParDefautMinutes?: number | null;
}
