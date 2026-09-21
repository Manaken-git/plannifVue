const configuredBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
const API_BASE_URL = configuredBaseUrl ? configuredBaseUrl.replace(/\/$/, '') : '';
const USE_MOCK_DATA = String(import.meta.env.VITE_USE_MOCK_DATA ?? 'false').toLowerCase() === 'true';

export class ApiError extends Error {
  readonly status: number;
  readonly body?: string;

  constructor(message: string, status: number, body?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

function resolveUrl(path: string) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}

async function fetchApi(path: string, init?: RequestInit) {
  try {
    return await fetch(resolveUrl(path), init);
  } catch (error) {
    throw new ApiError(
      `API injoignable pour ${path}. Vérifiez que le backend Spring est démarré et que le proxy Vite pointe vers le bon port.`,
      0,
      error instanceof Error ? error.message : undefined,
    );
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new ApiError(body || `La requête a échoué (${response.status})`, response.status, body || undefined);
  }

  if (response.status === 204 || response.status === 244) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function requestMock<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const { mockRequest } = await import('../../mocks/mockServer');
    return await mockRequest<T>(path, init);
  } catch (error) {
    throw new ApiError(
      error instanceof Error ? error.message : `Erreur mock pour ${path}.`,
      0,
      error instanceof Error ? error.stack : undefined,
    );
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (USE_MOCK_DATA) return requestMock<T>(path, init);
  const response = await fetchApi(path, init);
  return parseResponse<T>(response);
}

export function requestJson<T>(path: string, method: 'POST' | 'PUT', data: unknown): Promise<T> {
  return request<T>(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function uploadCsv<T>(path: string, file: File): Promise<T> {
  if (USE_MOCK_DATA) {
    try {
      const { mockUploadCsv } = await import('../../mocks/mockServer');
      return await mockUploadCsv(path, file) as T;
    } catch (error) {
      throw new ApiError(error instanceof Error ? error.message : "Échec de l'import CSV mock.", 0);
    }
  }

  const body = new FormData();
  body.append('file', file);
  return request<T>(path, { method: 'POST', body });
}

function triggerDownload(content: BlobPart, type: string, filename: string) {
  const blob = new Blob([content], { type });
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
}

export async function downloadFile(path: string, filename: string): Promise<void> {
  if (USE_MOCK_DATA) {
    try {
      const { mockExportCsv } = await import('../../mocks/mockServer');
      const csv = await mockExportCsv(path);
      triggerDownload(csv, 'text/csv;charset=utf-8', filename);
      return;
    } catch (error) {
      throw new ApiError(error instanceof Error ? error.message : "Échec de l'export CSV mock.", 0);
    }
  }

  const response = await fetchApi(path);
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new ApiError(body || "Erreur lors de l'exportation", response.status, body || undefined);
  }

  const blob = await response.blob();
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
}
