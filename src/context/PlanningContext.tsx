import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Professeur,
  Salle,
  Classe,
  Matiere,
  Creneau,
  Seance,
  Equipement,
  PlageHoraire,
  Planning,
} from '../types/model';

// ─── Helpers HTTP ────────────────────────────────────────────────────────────

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`[API ${options?.method || 'GET'} ${url}] ${res.status}: ${text}`);
  }
  // 204 No Content → pas de corps JSON
  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

// ─── Seance : format backend (dénormalisé) → format frontend (normalisé) ────

interface SeanceBackendDTO {
  id?: number;
  debut?: string;
  fin?: string;
  professeurNomComplet?: string;
  classeNom?: string;
  matiereNom?: string;
  salleCode?: string;
}

/** Convertit un SeanceDTO backend vers l'objet Seance du frontend */
function seanceFromDTO(
  dto: SeanceBackendDTO,
  allClasses: Classe[],
  allMatieres: Matiere[],
  allProfesseurs: Professeur[],
  allSalles: Salle[]
): Seance {
  return {
    id: dto.id,
    type: 'COURS', // par défaut – le backend ne le renvoie pas dans le DTO résumé
    classe: allClasses.find((c) => c.nom === dto.classeNom),
    matiere: allMatieres.find((m) => m.nom === dto.matiereNom),
    salle: allSalles.find((s) => s.code === dto.salleCode),
    professeur: dto.professeurNomComplet
      ? allProfesseurs.find(
          (p) =>
            `${p.prenom} ${p.nom}` === dto.professeurNomComplet ||
            `${p.nom} ${p.prenom}` === dto.professeurNomComplet
        )
      : undefined,
    creneau:
      dto.debut && dto.fin ? { debut: dto.debut, fin: dto.fin } : undefined,
  };
}

// ─── Types du contexte ───────────────────────────────────────────────────────

interface PlanningContextType {
  professeurs: Professeur[];
  salles: Salle[];
  classes: Classe[];
  matieres: Matiere[];
  creneaux: Creneau[];
  seances: Seance[];
  equipements: Equipement[];
  plagesHoraires: PlageHoraire[];
  loading: boolean;
  error: string | null;

  // Solved planning result
  solvedPlanning: Planning | null;
  isSolving: boolean;
  solveError: string | null;

  // CRUD Operations
  saveProfesseur: (prof: Professeur) => Promise<void>;
  deleteProfesseur: (id: number) => Promise<void>;

  saveSalle: (salle: Salle) => Promise<void>;
  deleteSalle: (id: number) => Promise<void>;

  saveClasse: (classe: Classe) => Promise<void>;
  deleteClasse: (id: number) => Promise<void>;

  saveMatiere: (matiere: Matiere) => Promise<void>;
  deleteMatiere: (id: number) => Promise<void>;

  saveCreneau: (creneau: Creneau) => void;
  deleteCreneau: (id: number) => void;

  saveSeance: (seance: Seance) => Promise<void>;
  deleteSeance: (id: number) => Promise<void>;

  saveEquipement: (equip: Equipement) => void;
  deleteEquipement: (id: number) => void;

  savePlageHoraire: (plage: PlageHoraire) => void;
  deletePlageHoraire: (id: number) => void;

  // Utility Actions
  solvePlanning: () => Promise<void>;
  resetPlanning: () => void;
  importPlanningData: (data: Planning) => void;
  exportPlanningData: () => Planning;
  refreshAll: () => Promise<void>;
}

const PlanningContext = createContext<PlanningContextType | undefined>(undefined);

// ─── Données locales uniquement (pas d'API backend) ──────────────────────────

const initialCreneaux: Creneau[] = [
  { id: 1, debut: '2024-09-02T08:00:00', fin: '2024-09-02T09:00:00' },
  { id: 2, debut: '2024-09-02T09:00:00', fin: '2024-09-02T10:00:00' },
];
const initialEquipements: Equipement[] = [
  { id: 1, libelle: 'Vidéoprojecteur' },
  { id: 2, libelle: 'Ordinateurs' },
];
const initialPlagesHoraires: PlageHoraire[] = [
  { id: 1, libelle: 'Matin (8h-12h)' },
  { id: 2, libelle: 'Après-midi (13h30-17h30)' },
];

// ─── Provider ────────────────────────────────────────────────────────────────

export const PlanningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [professeurs, setProfesseurs] = useState<Professeur[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [seances, setSeances] = useState<Seance[]>([]);

  // Données locales
  const [creneaux, setCreneaux] = useState<Creneau[]>(() =>
    JSON.parse(localStorage.getItem('plannif_creneaux') || JSON.stringify(initialCreneaux))
  );
  const [equipements, setEquipements] = useState<Equipement[]>(() =>
    JSON.parse(localStorage.getItem('plannif_equipements') || JSON.stringify(initialEquipements))
  );
  const [plagesHoraires, setPlagesHoraires] = useState<PlageHoraire[]>(() =>
    JSON.parse(localStorage.getItem('plannif_plagesHoraires') || JSON.stringify(initialPlagesHoraires))
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [solvedPlanning, setSolvedPlanning] = useState<Planning | null>(null);
  const [isSolving, setIsSolving] = useState(false);
  const [solveError, setSolveError] = useState<string | null>(null);

  // Persist creneaux / equipements / plagesHoraires locally
  useEffect(() => {
    localStorage.setItem('plannif_creneaux', JSON.stringify(creneaux));
  }, [creneaux]);
  useEffect(() => {
    localStorage.setItem('plannif_equipements', JSON.stringify(equipements));
  }, [equipements]);
  useEffect(() => {
    localStorage.setItem('plannif_plagesHoraires', JSON.stringify(plagesHoraires));
  }, [plagesHoraires]);

  // ── Chargement initial depuis l'API ───────────────────────────────────────

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [profsData, sallesData, classesData, matieresData, seancesData] = await Promise.all([
        apiFetch<Professeur[]>('/profs/list'),
        apiFetch<Salle[]>('/salles/list'),
        apiFetch<Classe[]>('/classes/list'),
        apiFetch<Matiere[]>('/matieres/list'),
        apiFetch<SeanceBackendDTO[]>('/seances/list'),
      ]);

      setProfesseurs(profsData);
      setSalles(sallesData);
      setClasses(classesData);
      setMatieres(matieresData);

      // Convertir les séances backend en séances frontend
      setSeances(
        seancesData.map((dto) =>
          seanceFromDTO(dto, classesData, matieresData, profsData, sallesData)
        )
      );
    } catch (err: any) {
      console.error('Erreur lors du chargement des données :', err);
      setError(err.message || 'Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // ── Professeurs ───────────────────────────────────────────────────────────

  const saveProfesseur = async (prof: Professeur): Promise<void> => {
    try {
      if (prof.id) {
        const updated = await apiFetch<Professeur>('/profs/update', {
          method: 'PUT',
          body: JSON.stringify(prof),
        });
        setProfesseurs((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        const created = await apiFetch<Professeur>('/profs/create', {
          method: 'POST',
          body: JSON.stringify(prof),
        });
        setProfesseurs((prev) => [...prev, created]);
      }
    } catch (err: any) {
      console.error('saveProfesseur error:', err);
      throw err;
    }
  };

  const deleteProfesseur = async (id: number): Promise<void> => {
    await apiFetch<void>(`/profs/delete/${id}`, { method: 'DELETE' });
    setProfesseurs((prev) => prev.filter((p) => p.id !== id));
  };

  // ── Salles ────────────────────────────────────────────────────────────────

  const saveSalle = async (salle: Salle): Promise<void> => {
    if (salle.id) {
      const updated = await apiFetch<Salle>('/salles/update', {
        method: 'PUT',
        body: JSON.stringify(salle),
      });
      setSalles((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } else {
      const created = await apiFetch<Salle>('/salles/create', {
        method: 'POST',
        body: JSON.stringify(salle),
      });
      setSalles((prev) => [...prev, created]);
    }
  };

  const deleteSalle = async (id: number): Promise<void> => {
    await apiFetch<void>(`/salles/delete/${id}`, { method: 'DELETE' });
    setSalles((prev) => prev.filter((s) => s.id !== id));
  };

  // ── Classes ───────────────────────────────────────────────────────────────

  const saveClasse = async (classe: Classe): Promise<void> => {
    if (classe.id) {
      const updated = await apiFetch<Classe>('/classes/update', {
        method: 'PUT',
        body: JSON.stringify({ id: classe.id, nom: classe.nom }),
      });
      setClasses((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
    } else {
      const created = await apiFetch<Classe>('/classes/create', {
        method: 'POST',
        body: JSON.stringify({ nom: classe.nom }),
      });
      setClasses((prev) => [...prev, { ...classe, ...created }]);
    }
  };

  const deleteClasse = async (id: number): Promise<void> => {
    await apiFetch<void>(`/classes/delete/${id}`, { method: 'DELETE' });
    setClasses((prev) => prev.filter((c) => c.id !== id));
  };

  // ── Matières ──────────────────────────────────────────────────────────────

  const saveMatiere = async (matiere: Matiere): Promise<void> => {
    if (matiere.id) {
      const updated = await apiFetch<Matiere>('/matieres/update', {
        method: 'PUT',
        body: JSON.stringify(matiere),
      });
      setMatieres((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    } else {
      const created = await apiFetch<Matiere>('/matieres/create', {
        method: 'POST',
        body: JSON.stringify(matiere),
      });
      setMatieres((prev) => [...prev, created]);
    }
  };

  const deleteMatiere = async (id: number): Promise<void> => {
    await apiFetch<void>(`/matieres/delete/${id}`, { method: 'DELETE' });
    setMatieres((prev) => prev.filter((m) => m.id !== id));
  };

  // ── Séances ───────────────────────────────────────────────────────────────

  const saveSeance = async (seance: Seance): Promise<void> => {
    // Le backend SeanceDTO est dénormalisé ; on passe les IDs en query params
    const params = new URLSearchParams();
    if (seance.professeur?.id) params.set('professeurId', String(seance.professeur.id));
    if (seance.classe?.id)     params.set('classeId',     String(seance.classe.id));
    if (seance.matiere?.id)    params.set('matiereId',    String(seance.matiere.id));
    if (seance.salle?.id)      params.set('salleId',      String(seance.salle.id));

    const body: SeanceBackendDTO = {
      id: seance.id,
      debut: seance.creneau?.debut,
      fin: seance.creneau?.fin,
    };

    const query = params.toString() ? `?${params}` : '';

    if (seance.id) {
      const updated = await apiFetch<SeanceBackendDTO>(`/seances/update${query}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      const mapped = seanceFromDTO(updated, classes, matieres, professeurs, salles);
      setSeances((prev) => prev.map((s) => (s.id === mapped.id ? mapped : s)));
    } else {
      const created = await apiFetch<SeanceBackendDTO>(`/seances/create${query}`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      const mapped = seanceFromDTO(created, classes, matieres, professeurs, salles);
      setSeances((prev) => [...prev, mapped]);
    }
  };

  const deleteSeance = async (id: number): Promise<void> => {
    await apiFetch<void>(`/seances/delete/${id}`, { method: 'DELETE' });
    setSeances((prev) => prev.filter((s) => s.id !== id));
  };

  // ── Créneaux (locaux) ─────────────────────────────────────────────────────

  const localSave = <T extends { id?: number }>(
    list: T[],
    setList: React.Dispatch<React.SetStateAction<T[]>>,
    item: T
  ) => {
    if (item.id) {
      setList(list.map((x) => (x.id === item.id ? item : x)));
    } else {
      const newId = list.reduce((max, x) => Math.max(max, x.id || 0), 0) + 1;
      setList([...list, { ...item, id: newId }]);
    }
  };

  const saveCreneau = (creneau: Creneau) => localSave(creneaux, setCreneaux, creneau);
  const deleteCreneau = (id: number) => setCreneaux((prev) => prev.filter((c) => c.id !== id));

  const saveEquipement = (equip: Equipement) => localSave(equipements, setEquipements, equip);
  const deleteEquipement = (id: number) => setEquipements((prev) => prev.filter((e) => e.id !== id));

  const savePlageHoraire = (plage: PlageHoraire) => localSave(plagesHoraires, setPlagesHoraires, plage);
  const deletePlageHoraire = (id: number) => setPlagesHoraires((prev) => prev.filter((p) => p.id !== id));

  // ── Solveur ───────────────────────────────────────────────────────────────

  const solvePlanning = async () => {
    setIsSolving(true);
    setSolveError(null);
    try {
      const payload = exportPlanningData();
      const response = await fetch('/planning/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
      }
      const result: Planning = await response.json();
      setSolvedPlanning(result);
      if (result.seances) {
        setSeances(result.seances);
      }
    } catch (err: any) {
      console.error('Erreur lors de la résolution du planning:', err);
      setSolveError(err.message || 'Erreur réseau/serveur lors de la résolution.');
    } finally {
      setIsSolving(false);
    }
  };

  // ── Utilitaires ───────────────────────────────────────────────────────────

  const resetPlanning = () => {
    setCreneaux(initialCreneaux);
    setEquipements(initialEquipements);
    setPlagesHoraires(initialPlagesHoraires);
    setSolvedPlanning(null);
    setSolveError(null);
    localStorage.removeItem('plannif_creneaux');
    localStorage.removeItem('plannif_equipements');
    localStorage.removeItem('plannif_plagesHoraires');
    refreshAll();
  };

  const importPlanningData = (data: Planning) => {
    if (data.professeurs) setProfesseurs(data.professeurs);
    if (data.salles) setSalles(data.salles);
    if (data.classes) setClasses(data.classes);
    if (data.matieres) setMatieres(data.matieres);
    if (data.creneaux) setCreneaux(data.creneaux);
    if (data.seances) setSeances(data.seances);
    setSolvedPlanning(null);
  };

  const exportPlanningData = (): Planning => {
    const professeurDayOffs = professeurs.flatMap((p) =>
      (p.daysOff || []).map((d) => ({ ...d, professeurId: p.id }))
    );
    return {
      seances,
      creneaux,
      salles,
      professeurs,
      classes,
      matieres,
      professeurDayOffs,
      classePresences: classes.flatMap((c) =>
        (c.presences || []).map((pr) => ({ ...pr, classeId: c.id }))
      ),
      matiereClasseConfigs: [],
    };
  };

  return (
    <PlanningContext.Provider
      value={{
        professeurs,
        salles,
        classes,
        matieres,
        creneaux,
        seances,
        equipements,
        plagesHoraires,
        loading,
        error,
        solvedPlanning,
        isSolving,
        solveError,
        saveProfesseur,
        deleteProfesseur,
        saveSalle,
        deleteSalle,
        saveClasse,
        deleteClasse,
        saveMatiere,
        deleteMatiere,
        saveCreneau,
        deleteCreneau,
        saveSeance,
        deleteSeance,
        saveEquipement,
        deleteEquipement,
        savePlageHoraire,
        deletePlageHoraire,
        solvePlanning,
        resetPlanning,
        importPlanningData,
        exportPlanningData,
        refreshAll,
      }}
    >
      {children}
    </PlanningContext.Provider>
  );
};

export const usePlanning = () => {
  const context = useContext(PlanningContext);
  if (context === undefined) {
    throw new Error('usePlanning doit être utilisé au sein de PlanningProvider');
  }
  return context;
};
