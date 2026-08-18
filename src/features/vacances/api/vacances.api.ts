import { request, requestJson } from '../../../shared/api/httpClient';
import type { Vacances } from '../types/vacances.types';

export const vacancesApi = {
  list: () => request<Vacances[]>('/vacances/list'),
  create: (data: Vacances) => requestJson<Vacances>('/vacances/create', 'POST', data),
  update: (data: Vacances) => requestJson<Vacances>('/vacances/update', 'PUT', data),
  remove: (id: number) => request<void>(`/vacances/delete/${id}`, { method: 'DELETE' }),
};
