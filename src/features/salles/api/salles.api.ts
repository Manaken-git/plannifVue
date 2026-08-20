import { downloadFile, request, requestJson, uploadCsv } from '../../../shared/api/httpClient';
import type { Salle } from '../types/salle.types';

export const sallesApi = {
  list: () => request<Salle[]>('/salles/list'),
  create: (data: Salle) => requestJson<Salle>('/salles/create', 'POST', data),
  update: (data: Salle) => requestJson<Salle>('/salles/update', 'PUT', data),
  remove: (id: number) => request<void>(`/salles/delete/${id}`, { method: 'DELETE' }),
  importCsv: (file: File) => uploadCsv<unknown>('/salles/import', file),
  exportCsv: () => downloadFile('/salles/export', 'salles.csv'),
};
