import { request, requestJson } from '../../../shared/api/httpClient';
import type { ConstraintConfiguration } from '../types/constraint.types';

export const constraintsApi = {
  get: () => request<ConstraintConfiguration>('/constraints/config'),
  save: (config: ConstraintConfiguration) => requestJson<ConstraintConfiguration>('/constraints/config', 'PUT', config),
};
