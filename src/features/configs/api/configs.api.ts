import { downloadFile, request, requestJson, uploadCsv } from '../../../shared/api/httpClient';
import type { MatiereClasseConfig } from '../types/config.types';

export const configsApi = {
  list: () => request<MatiereClasseConfig[]>('/configs/list'),
  create: (data: MatiereClasseConfig) => requestJson<MatiereClasseConfig>('/configs/create', 'POST', data),
  update: (data: MatiereClasseConfig) => requestJson<MatiereClasseConfig>('/configs/update', 'PUT', data),
  remove: (id: number) => request<void>(`/configs/delete/${id}`, { method: 'DELETE' }),
  importCsv: (file: File) => uploadCsv<unknown>('/configs/import', file),
  exportCsv: () => downloadFile('/configs/export', 'configurations.csv'),
};
