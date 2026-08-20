export interface ClassePresence {
  id?: number;
  dateDebut: string;
  dateFin: string;
}

export interface Classe {
  id?: number;
  nom: string;
  presences?: ClassePresence[];
}
