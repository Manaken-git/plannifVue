import type { Classe } from '../features/classes/types/classe.types';
import type { MatiereClasseConfig } from '../features/configs/types/config.types';
import type { Creneau } from '../features/creneaux/types/creneau.types';
import type { Eleve } from '../features/eleves/types/eleve.types';
import type { Matiere } from '../features/matieres/types/matiere.types';
import type { Seance } from '../features/planning/types/planning.types';
import type { PlanningDTO, PlanningSaveDTO } from '../features/plannings/types/planning-saved.types';
import type { Professeur } from '../features/professeurs/types/professeur.types';
import type { Salle } from '../features/salles/types/salle.types';
import type { Vacances } from '../features/vacances/types/vacances.types';

interface MockMeta {
  name: string;
  version: number;
  referenceWeek?: string;
  description?: string;
}

interface MockSeance extends Seance {
  professeurId?: number;
  classeId?: number;
  matiereId?: number;
  salleId?: number;
  creneauId?: number;
  type?: string;
}

interface MockDatabase {
  meta: MockMeta;
  professeurs: Professeur[];
  classes: Classe[];
  eleves: Eleve[];
  matieres: Matiere[];
  salles: Salle[];
  creneaux: Creneau[];
  configs: MatiereClasseConfig[];
  seances: MockSeance[];
  vacances: Vacances[];
  plannings: PlanningDTO[];
}

type CollectionName = Exclude<keyof MockDatabase, 'meta'>;
type JsonRecord = Record<string, unknown>;

const STORAGE_KEY = 'plannif-edu:mock-db:v1';
const MOCK_DATA_URL = '/mock-data.json';
const DEFAULT_DELAY_MS = 110;

let databasePromise: Promise<MockDatabase> | null = null;

const endpointToCollection: Record<string, CollectionName> = {
  profs: 'professeurs',
  classes: 'classes',
  eleves: 'eleves',
  matieres: 'matieres',
  salles: 'salles',
  creneaux: 'creneaux',
  configs: 'configs',
  seances: 'seances',
  vacances: 'vacances',
  plannings: 'plannings',
};

function clone<T>(value: T): T {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
}

function mockDelay() {
  const raw = Number(import.meta.env.VITE_MOCK_DELAY_MS ?? DEFAULT_DELAY_MS);
  const delay = Number.isFinite(raw) ? Math.max(0, raw) : DEFAULT_DELAY_MS;
  return delay ? new Promise((resolve) => window.setTimeout(resolve, delay)) : Promise.resolve();
}

async function loadSeed(): Promise<MockDatabase> {
  const response = await fetch(MOCK_DATA_URL, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Impossible de charger ${MOCK_DATA_URL} (${response.status}).`);
  }
  return response.json() as Promise<MockDatabase>;
}

async function getDatabase(): Promise<MockDatabase> {
  if (!databasePromise) {
    databasePromise = (async () => {
      const seed = await loadSeed();
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        try {
          const parsed = JSON.parse(stored) as MockDatabase;
          if (parsed?.meta?.version === seed.meta.version) return parsed;
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }

      const initial = clone(seed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    })();
  }

  return databasePromise;
}

function persist(database: MockDatabase) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
}

function nextId(items: Array<{ id?: number }>) {
  return items.reduce((max, item) => Math.max(max, item.id ?? 0), 0) + 1;
}

function toNumber(value: string | null | undefined) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function relationId(params: URLSearchParams, key: string, fallback?: unknown) {
  return toNumber(params.get(key)) ?? (typeof fallback === 'number' ? fallback : undefined);
}

function enrichConfig(database: MockDatabase, item: MatiereClasseConfig): MatiereClasseConfig {
  const classe = database.classes.find((value) => value.id === item.classeId);
  const matiere = database.matieres.find((value) => value.id === item.matiereId);
  return {
    ...item,
    classeNom: classe?.nom ?? item.classeNom,
    matiereNom: matiere?.nom ?? item.matiereNom,
  };
}

function enrichSession(database: MockDatabase, item: MockSeance): MockSeance {
  const professeur = database.professeurs.find((value) => value.id === item.professeurId);
  const classe = database.classes.find((value) => value.id === item.classeId);
  const matiere = database.matieres.find((value) => value.id === item.matiereId);
  const salle = database.salles.find((value) => value.id === item.salleId);

  return {
    ...item,
    professeurNomComplet: professeur ? `${professeur.prenom} ${professeur.nom}` : item.professeurNomComplet,
    classeNom: classe?.nom ?? item.classeNom,
    matiereNom: matiere?.nom ?? item.matiereNom,
    salleCode: salle?.code ?? item.salleCode,
  };
}

function enrichPlanning(database: MockDatabase, planning: PlanningDTO): PlanningDTO {
  return {
    ...planning,
    seances: (planning.seances ?? []).map((item) => enrichSession(database, item as MockSeance)),
  };
}

function listCollection(database: MockDatabase, collection: CollectionName) {
  if (collection === 'configs') return database.configs.map((item) => enrichConfig(database, item));
  if (collection === 'seances') return database.seances.map((item) => enrichSession(database, item));
  if (collection === 'plannings') return database.plannings.map((item) => enrichPlanning(database, item));
  return clone(database[collection]);
}

function assignNestedIds(collection: CollectionName, value: JsonRecord) {
  if (collection === 'classes' && Array.isArray(value.presences)) {
    value.presences = value.presences.map((presence, index) => ({
      ...(presence as JsonRecord),
      id: (presence as JsonRecord).id ?? Date.now() + index,
    }));
  }

  if (collection === 'professeurs' && Array.isArray(value.daysOff)) {
    value.daysOff = value.daysOff.map((day, index) => ({
      ...(day as JsonRecord),
      id: (day as JsonRecord).id ?? Date.now() + index,
    }));
  }
}

function createItem(database: MockDatabase, collection: CollectionName, payload: JsonRecord, params: URLSearchParams) {
  const items = database[collection] as Array<JsonRecord & { id?: number }>;
  const value: JsonRecord & { id?: number } = { ...payload, id: nextId(items) };

  if (collection === 'eleves') value.classeId = relationId(params, 'classeId', value.classeId);
  if (collection === 'seances') {
    value.professeurId = relationId(params, 'professeurId', value.professeurId);
    value.classeId = relationId(params, 'classeId', value.classeId);
    value.matiereId = relationId(params, 'matiereId', value.matiereId);
    value.salleId = relationId(params, 'salleId', value.salleId);
  }

  assignNestedIds(collection, value);
  items.push(value);
  persist(database);

  if (collection === 'configs') return enrichConfig(database, value as MatiereClasseConfig);
  if (collection === 'seances') return enrichSession(database, value as unknown as MockSeance);
  return clone(value);
}

function updateItem(database: MockDatabase, collection: CollectionName, payload: JsonRecord, params: URLSearchParams) {
  const id = typeof payload.id === 'number' ? payload.id : undefined;
  if (!id) throw new Error('Un identifiant est requis pour modifier cet élément.');

  const items = database[collection] as Array<JsonRecord & { id?: number }>;
  const index = items.findIndex((item) => item.id === id);
  if (index < 0) throw new Error(`Élément #${id} introuvable dans les données mock.`);

  const value: JsonRecord & { id?: number } = { ...items[index], ...payload, id };
  if (collection === 'eleves') value.classeId = relationId(params, 'classeId', value.classeId);
  if (collection === 'seances') {
    value.professeurId = relationId(params, 'professeurId', value.professeurId);
    value.classeId = relationId(params, 'classeId', value.classeId);
    value.matiereId = relationId(params, 'matiereId', value.matiereId);
    value.salleId = relationId(params, 'salleId', value.salleId);
  }

  assignNestedIds(collection, value);
  items[index] = value;
  persist(database);

  if (collection === 'configs') return enrichConfig(database, value as MatiereClasseConfig);
  if (collection === 'seances') return enrichSession(database, value as unknown as MockSeance);
  return clone(value);
}

function deleteItem(database: MockDatabase, collection: CollectionName, id: number) {
  const items = database[collection] as Array<{ id?: number }>;
  const index = items.findIndex((item) => item.id === id);
  if (index >= 0) items.splice(index, 1);
  persist(database);
}

function parseBody(init?: RequestInit): JsonRecord {
  if (!init?.body || typeof init.body !== 'string') return {};
  try {
    return JSON.parse(init.body) as JsonRecord;
  } catch {
    return {};
  }
}

function getRoute(path: string) {
  const url = new URL(path, window.location.origin);
  const segments = url.pathname.split('/').filter(Boolean);
  return { url, segments };
}

async function savePlanning(database: MockDatabase, payload: PlanningSaveDTO) {
  const sourceSessions = payload.seances
    .map((session) => database.seances.find((item) => item.id === session.id))
    .filter((item): item is MockSeance => Boolean(item))
    .map((item) => enrichSession(database, item));

  const id = payload.id ?? nextId(database.plannings);
  const planning: PlanningDTO = {
    id,
    nom: payload.nom,
    dateCreation: payload.dateCreation ?? new Date().toISOString(),
    seances: sourceSessions,
  };

  const existing = database.plannings.findIndex((item) => item.id === id);
  if (existing >= 0) database.plannings[existing] = planning;
  else database.plannings.push(planning);

  persist(database);
  return clone(planning);
}

export async function mockRequest<T>(path: string, init?: RequestInit): Promise<T> {
  await mockDelay();
  const database = await getDatabase();
  const { url, segments } = getRoute(path);
  const method = (init?.method ?? 'GET').toUpperCase();
  const [endpoint, action, idSegment] = segments;
  const collection = endpointToCollection[endpoint];

  if (!collection) throw new Error(`Route mock non gérée : ${method} ${url.pathname}`);

  if (endpoint === 'eleves' && action === 'list' && idSegment && method === 'GET') {
    const classeId = Number(idSegment);
    return clone(database.eleves.filter((item) => item.classeId === classeId)) as T;
  }

  if (endpoint === 'plannings') {
    if (action === 'list' && method === 'GET') return listCollection(database, 'plannings') as T;
    if (action === 'save' && method === 'POST') return savePlanning(database, parseBody(init) as unknown as PlanningSaveDTO) as Promise<T>;
    if (action === 'delete' && idSegment && method === 'DELETE') {
      deleteItem(database, 'plannings', Number(idSegment));
      return undefined as T;
    }
    if (action && /^\d+$/.test(action) && method === 'GET') {
      const planning = database.plannings.find((item) => item.id === Number(action));
      if (!planning) throw new Error(`Planning #${action} introuvable.`);
      return enrichPlanning(database, planning) as T;
    }
  }

  if (action === 'list' && method === 'GET') return listCollection(database, collection) as T;
  if (action === 'create' && method === 'POST') return createItem(database, collection, parseBody(init), url.searchParams) as T;
  if (action === 'update' && method === 'PUT') return updateItem(database, collection, parseBody(init), url.searchParams) as T;
  if (action === 'delete' && idSegment && method === 'DELETE') {
    deleteItem(database, collection, Number(idSegment));
    return undefined as T;
  }

  throw new Error(`Route mock non gérée : ${method} ${url.pathname}`);
}

function normalizeHeader(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
}

function parseCsvLine(line: string, delimiter: string) {
  const values: string[] = [];
  let current = '';
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === delimiter && !quoted) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

function parseCsv(text: string) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];
  const delimiter = (lines[0].match(/;/g)?.length ?? 0) >= (lines[0].match(/,/g)?.length ?? 0) ? ';' : ',';
  const headers = parseCsvLine(lines[0], delimiter).map(normalizeHeader);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line, delimiter);
    return headers.reduce<JsonRecord>((record, header, index) => {
      record[header] = values[index] ?? '';
      return record;
    }, {});
  });
}

function text(row: JsonRecord, ...keys: string[]) {
  for (const key of keys) {
    const value = row[normalizeHeader(key)];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function number(row: JsonRecord, ...keys: string[]) {
  const value = text(row, ...keys).replace(',', '.');
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function resolveByName<T extends { id?: number }>(items: T[], getLabel: (item: T) => string, value: string) {
  const normalized = value.trim().toLowerCase();
  return items.find((item) => getLabel(item).toLowerCase() === normalized)?.id;
}

function csvRowToItem(database: MockDatabase, collection: CollectionName, row: JsonRecord): JsonRecord | null {
  if (collection === 'professeurs') {
    return {
      nom: text(row, 'nom'),
      prenom: text(row, 'prenom'),
      email: text(row, 'email'),
      nb_heures: number(row, 'nb_heures', 'nbheures', 'heures') ?? 0,
      maxHeuresParJour: number(row, 'maxHeuresParJour', 'maxjour'),
      maxHeuresParSemaine: number(row, 'maxHeuresParSemaine', 'maxsemaine'),
      maxHeuresParSeance: number(row, 'maxHeuresParSeance', 'maxseance'),
      plageHorairePreferee: text(row, 'plageHorairePreferee', 'plage') ? { libelle: text(row, 'plageHorairePreferee', 'plage') } : null,
      matieres: [],
      daysOff: [],
      seances: [],
    };
  }
  if (collection === 'classes') return { nom: text(row, 'nom'), presences: [] };
  if (collection === 'matieres') return { nom: text(row, 'nom') };
  if (collection === 'salles') return { code: text(row, 'code'), capacite: number(row, 'capacite') ?? 0, type: text(row, 'type') || 'Cours' };
  if (collection === 'creneaux') return { debut: text(row, 'debut'), fin: text(row, 'fin') };
  if (collection === 'vacances') return { nom: text(row, 'nom'), dateDebut: text(row, 'dateDebut', 'debut'), dateFin: text(row, 'dateFin', 'fin') };

  if (collection === 'eleves') {
    const classeValue = text(row, 'classeNom', 'classe');
    return {
      nom: text(row, 'nom'),
      prenom: text(row, 'prenom'),
      classeId: number(row, 'classeId') ?? resolveByName(database.classes, (item) => item.nom, classeValue),
    };
  }

  if (collection === 'configs') {
    const classeValue = text(row, 'classeNom', 'classe');
    const matiereValue = text(row, 'matiereNom', 'matiere');
    return {
      classeId: number(row, 'classeId') ?? resolveByName(database.classes, (item) => item.nom, classeValue),
      matiereId: number(row, 'matiereId') ?? resolveByName(database.matieres, (item) => item.nom, matiereValue),
      dateDebut: text(row, 'dateDebut', 'debut') || null,
      dateFin: text(row, 'dateFin', 'fin') || null,
      volumeHorairePeriode: number(row, 'volumeHorairePeriode', 'volume'),
    };
  }

  if (collection === 'seances') {
    const professeurValue = text(row, 'professeurNomComplet', 'professeur');
    const classeValue = text(row, 'classeNom', 'classe');
    const matiereValue = text(row, 'matiereNom', 'matiere');
    const salleValue = text(row, 'salleCode', 'salle');
    return {
      debut: text(row, 'debut'),
      fin: text(row, 'fin'),
      professeurId: number(row, 'professeurId') ?? resolveByName(database.professeurs, (item) => `${item.prenom} ${item.nom}`, professeurValue),
      classeId: number(row, 'classeId') ?? resolveByName(database.classes, (item) => item.nom, classeValue),
      matiereId: number(row, 'matiereId') ?? resolveByName(database.matieres, (item) => item.nom, matiereValue),
      salleId: number(row, 'salleId') ?? resolveByName(database.salles, (item) => item.code, salleValue),
    };
  }

  return null;
}

export async function mockUploadCsv(path: string, file: File) {
  await mockDelay();
  const database = await getDatabase();
  const { segments } = getRoute(path);
  const collection = endpointToCollection[segments[0]];
  if (!collection || collection === 'plannings') throw new Error(`Import CSV mock non géré pour ${path}.`);

  const rows = parseCsv(await file.text());
  let imported = 0;
  for (const row of rows) {
    const payload = csvRowToItem(database, collection, row);
    if (!payload) continue;
    createItem(database, collection, payload, new URLSearchParams());
    imported += 1;
  }
  return { imported };
}

function csvEscape(value: unknown) {
  if (value == null) return '';
  const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
  return `"${stringValue.replace(/"/g, '""')}"`;
}

function exportRows(database: MockDatabase, collection: CollectionName): JsonRecord[] {
  const rows = listCollection(database, collection) as unknown[];
  return rows.map((item) => {
    const row = { ...(item as JsonRecord) };
    delete row.seances;
    return row;
  });
}

export async function mockExportCsv(path: string): Promise<string> {
  await mockDelay();
  const database = await getDatabase();
  const { segments } = getRoute(path);
  const collection = endpointToCollection[segments[0]];
  if (!collection) throw new Error(`Export CSV mock non géré pour ${path}.`);

  const rows = exportRows(database, collection);
  if (!rows.length) return '';
  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  const body = rows.map((row) => headers.map((header) => csvEscape(row[header])).join(';'));
  return [`\uFEFF${headers.join(';')}`, ...body].join('\n');
}

export function resetMockDatabase() {
  localStorage.removeItem(STORAGE_KEY);
  databasePromise = null;
}
