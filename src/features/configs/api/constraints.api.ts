import { request, requestJson } from '../../../shared/api/httpClient';
import type { ConstraintConfiguration } from '../types/constraint.types';

export const constraintsApi = {
  get: () => request<ConstraintConfiguration>('/constraint-configs/default').catch(() => request<ConstraintConfiguration>('/constraints/config')),
  list: () => request<unknown[]>('/constraint-configs/list').catch(() => []),
  save: (config: ConstraintConfiguration) =>
    requestJson<ConstraintConfiguration>('/constraint-configs/save', 'POST', config).catch(() =>
      requestJson<ConstraintConfiguration>('/constraints/config', 'PUT', config),
    ),
};
