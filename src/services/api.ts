// API Client for spring boot backend

export interface PlageHoraire {
  id?: number;
  libelle: string;
}

export interface Professeur {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  nb_heures: number;
  plageHorairePreferee?: PlageHoraire | null;
}

export interface Eleve {
  id?: number;
  nom: string;
  prenom: string;
  classeId?: number; // Internal frontend field to trace association
}

export interface Classe {
  id?: number;
  nom: string;
}

export interface Matiere {
  id?: number;
  nom: string;
  volumeHoraireAnnuel: number;
}

export interface Salle {
  id?: number;
  code: string;
  capacite: number;
  type: string;
}

export interface Seance {
  id?: number;
  debut: string; // ISO string 'YYYY-MM-DDTHH:mm:ss'
  fin: string;   // ISO string 'YYYY-MM-DDTHH:mm:ss'
  professeurNomComplet?: string;
  classeNom?: string;
  matiereNom?: string;
  salleCode?: string;
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }
  if (response.status === 244 || response.status === 204) {
    return null;
  }
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return null;
};

export const api = {
  // PROFESSEURS
  professeurs: {
    list: (): Promise<Professeur[]> => 
      fetch('/profs/list').then(handleResponse),
    create: (data: Professeur): Promise<Professeur> => 
      fetch('/profs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(handleResponse),
    update: (data: Professeur): Promise<Professeur> => 
      fetch('/profs/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(handleResponse),
    delete: (id: number): Promise<void> => 
      fetch(`/profs/delete/${id}`, { method: 'DELETE' }).then(handleResponse),
  },

  // ELEVES
  eleves: {
    listAll: (): Promise<Eleve[]> => 
      fetch('/eleves/list').then(handleResponse),
    listByClasse: (classeId: number): Promise<Eleve[]> => 
      fetch(`/eleves/list/${classeId}`).then(handleResponse),
    create: (data: Eleve, classeId?: number): Promise<Eleve> => {
      const url = `/eleves/create${classeId ? `?classeId=${classeId}` : ''}`;
      return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(handleResponse);
    },
    update: (data: Eleve, classeId?: number): Promise<Eleve> => {
      const url = `/eleves/update${classeId ? `?classeId=${classeId}` : ''}`;
      return fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(handleResponse);
    },
    delete: (id: number): Promise<void> => 
      fetch(`/eleves/delete/${id}`, { method: 'DELETE' }).then(handleResponse),
  },

  // CLASSES
  classes: {
    list: (): Promise<Classe[]> => 
      fetch('/classes/list').then(handleResponse),
    create: (data: Classe): Promise<Classe> => 
      fetch('/classes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(handleResponse),
    update: (data: Classe): Promise<Classe> => 
      fetch('/classes/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(handleResponse),
    delete: (id: number): Promise<void> => 
      fetch(`/classes/delete/${id}`, { method: 'DELETE' }).then(handleResponse),
  },

  // MATIERES
  matieres: {
    list: (): Promise<Matiere[]> => 
      fetch('/matieres/list').then(handleResponse),
    create: (data: Matiere): Promise<Matiere> => 
      fetch('/matieres/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(handleResponse),
    update: (data: Matiere): Promise<Matiere> => 
      fetch('/matieres/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(handleResponse),
    delete: (id: number): Promise<void> => 
      fetch(`/matieres/delete/${id}`, { method: 'DELETE' }).then(handleResponse),
  },

  // SALLES
  salles: {
    list: (): Promise<Salle[]> => 
      fetch('/salles/list').then(handleResponse),
    create: (data: Salle): Promise<Salle> => 
      fetch('/salles/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(handleResponse),
    update: (data: Salle): Promise<Salle> => 
      fetch('/salles/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(handleResponse),
    delete: (id: number): Promise<void> => 
      fetch(`/salles/delete/${id}`, { method: 'DELETE' }).then(handleResponse),
  },

  // SEANCES
  seances: {
    list: (): Promise<Seance[]> => 
      fetch('/seances/list').then(handleResponse),
    create: (
      data: Seance,
      professeurId?: number,
      classeId?: number,
      matiereId?: number,
      salleId?: number
    ): Promise<Seance> => {
      const params = new URLSearchParams();
      if (professeurId) params.append('professeurId', professeurId.toString());
      if (classeId) params.append('classeId', classeId.toString());
      if (matiereId) params.append('matiereId', matiereId.toString());
      if (salleId) params.append('salleId', salleId.toString());
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      return fetch(`/seances/create${queryString}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(handleResponse);
    },
    update: (
      data: Seance,
      professeurId?: number,
      classeId?: number,
      matiereId?: number,
      salleId?: number
    ): Promise<Seance> => {
      const params = new URLSearchParams();
      if (professeurId) params.append('professeurId', professeurId.toString());
      if (classeId) params.append('classeId', classeId.toString());
      if (matiereId) params.append('matiereId', matiereId.toString());
      if (salleId) params.append('salleId', salleId.toString());
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      return fetch(`/seances/update${queryString}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(handleResponse);
    },
    delete: (id: number): Promise<void> => 
      fetch(`/seances/delete/${id}`, { method: 'DELETE' }).then(handleResponse),
  }
};
