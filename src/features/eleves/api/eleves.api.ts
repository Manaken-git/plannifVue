import { downloadFile, request, requestJson, uploadCsv } from '../../../shared/api/httpClient';
import type { Eleve } from '../types/eleve.types';

const withClasse = (path: string, classeId?: number) => classeId ? `${path}?classeId=${classeId}` : path;

export const elevesApi = {
  list: () => request<Eleve[]>('/eleves/list'),
  listByClasse: (classeId: number) => request<Eleve[]>(`/eleves/list/${classeId}`),
  create: (data: Eleve, classeId?: number) => requestJson<Eleve>(withClasse('/eleves/create', classeId), 'POST', data),
  update: (data: Eleve, classeId?: number) => requestJson<Eleve>(withClasse('/eleves/update', classeId), 'PUT', data),
  remove: (id: number) => request<void>(`/eleves/delete/${id}`, { method: 'DELETE' }),
  importCsv: (file: File) => uploadCsv<unknown>('/eleves/import', file),
  exportCsv: () => downloadFile('/eleves/export', 'eleves.csv'),
};
