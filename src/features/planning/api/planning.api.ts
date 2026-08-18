import { downloadFile, request, requestJson, uploadCsv } from '../../../shared/api/httpClient';
import type { Seance, SessionAssociations } from '../types/planning.types';

function sessionUrl(path: string, associations: SessionAssociations = {}) {
  const params = new URLSearchParams();
  if (associations.professeurId) params.set('professeurId', String(associations.professeurId));
  if (associations.classeId) params.set('classeId', String(associations.classeId));
  if (associations.matiereId) params.set('matiereId', String(associations.matiereId));
  if (associations.salleId) params.set('salleId', String(associations.salleId));
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export const planningApi = {
  list: () => request<Seance[]>('/seances/list'),
  create: (data: Seance, associations?: SessionAssociations) => requestJson<Seance>(sessionUrl('/seances/create', associations), 'POST', data),
  update: (data: Seance, associations?: SessionAssociations) => requestJson<Seance>(sessionUrl('/seances/update', associations), 'PUT', data),
  remove: (id: number) => request<void>(`/seances/delete/${id}`, { method: 'DELETE' }),
  importCsv: (file: File) => uploadCsv<unknown>('/seances/import', file),
  exportCsv: () => downloadFile('/seances/export', 'seances.csv'),
};
