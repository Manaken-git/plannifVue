import { request, requestJson } from '../../../shared/api/httpClient';
import type { PlanningDTO, PlanningSaveDTO } from '../types/planning-saved.types';

export const planningsApi = {
  list: () => request<PlanningDTO[]>('/plannings/list'),
  get: (id: number) => request<PlanningDTO>(`/plannings/${id}`),
  save: (data: PlanningSaveDTO) => requestJson<PlanningDTO>('/plannings/save', 'POST', data),
  remove: (id: number) => request<void>(`/plannings/delete/${id}`, { method: 'DELETE' }),
};
