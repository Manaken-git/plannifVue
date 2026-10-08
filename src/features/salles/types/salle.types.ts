export interface Salle {
  id?: number;
  code: string;
  capacite: number;
  type: string;
  batiment?: string;
  etage?: number;
  equipements?: string[];
}
