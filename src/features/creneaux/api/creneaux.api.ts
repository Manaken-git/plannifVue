import { downloadFile, request, requestJson, uploadCsv } from '../../../shared/api/httpClient';
import type { Creneau } from '../types/creneau.types';

export const creneauxApi = {
  list: () => request<Creneau[]>('/creneaux/list'),
  create: (data: Creneau) => requestJson<Creneau>('/creneaux/create', 'POST', data),
  update: (data: Creneau) => requestJson<Creneau>('/creneaux/update', 'PUT', data),
  remove: (id: number) => request<void>(`/creneaux/delete/${id}`, { method: 'DELETE' }),
  importCsv: (file: File) => uploadCsv<unknown>('/creneaux/import', file),
  exportCsv: () => downloadFile('/creneaux/export', 'creneaux.csv'),
};
