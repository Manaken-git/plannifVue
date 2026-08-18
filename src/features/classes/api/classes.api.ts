import { downloadFile, request, requestJson, uploadCsv } from '../../../shared/api/httpClient';
import type { Classe } from '../types/classe.types';

export const classesApi = {
  list: () => request<Classe[]>('/classes/list'),
  create: (data: Classe) => requestJson<Classe>('/classes/create', 'POST', data),
  update: (data: Classe) => requestJson<Classe>('/classes/update', 'PUT', data),
  remove: (id: number) => request<void>(`/classes/delete/${id}`, { method: 'DELETE' }),
  importCsv: (file: File) => uploadCsv<unknown>('/classes/import', file),
  exportCsv: () => downloadFile('/classes/export', 'classes.csv'),
};
