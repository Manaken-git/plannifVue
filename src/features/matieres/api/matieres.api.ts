import { downloadFile, request, requestJson, uploadCsv } from '../../../shared/api/httpClient';
import type { Matiere } from '../types/matiere.types';

export const matieresApi = {
  list: () => request<Matiere[]>('/matieres/list'),
  create: (data: Matiere) => requestJson<Matiere>('/matieres/create', 'POST', data),
  update: (data: Matiere) => requestJson<Matiere>('/matieres/update', 'PUT', data),
  remove: (id: number) => request<void>(`/matieres/delete/${id}`, { method: 'DELETE' }),
  importCsv: (file: File) => uploadCsv<unknown>('/matieres/import', file),
  exportCsv: () => downloadFile('/matieres/export', 'matieres.csv'),
};
