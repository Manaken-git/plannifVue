import { downloadFile, request, requestJson, uploadCsv } from '../../../shared/api/httpClient';
import type { Professeur } from '../types/professeur.types';

export const professeursApi = {
  list: () => request<Professeur[]>('/profs/list'),
  create: (data: Professeur) => requestJson<Professeur>('/profs/create', 'POST', data),
  update: (data: Professeur) => requestJson<Professeur>('/profs/update', 'PUT', data),
  remove: (id: number) => request<void>(`/profs/delete/${id}`, { method: 'DELETE' }),
  importCsv: (file: File) => uploadCsv<unknown>('/profs/import', file),
  exportCsv: () => downloadFile('/profs/export', 'professeurs.csv'),
};
