import { request, requestJson } from '../../../shared/api/httpClient';
import type {
  JobCompletedEvent,
  JobProgressEvent,
  JobStatusResponse,
  JobStopResponse,
  JobSubmissionRequest,
  JobSubmissionResponse,
} from '../types/solver.types';

export interface ProgressHandlers {
  onScoreUpdate?: (event: JobProgressEvent) => void;
  onCompleted?: (event: JobCompletedEvent) => void;
  onTerminated?: (event: JobCompletedEvent) => void;
  onError?: (error: unknown) => void;
}

export const solverApi = {
  submitJob: (data?: JobSubmissionRequest) =>
    requestJson<JobSubmissionResponse>('/planning/jobs', 'POST', data ?? {}),

  getJobStatus: (jobId: string) =>
    request<JobStatusResponse>(`/planning/jobs/${jobId}`),

  stopJob: (jobId: string) =>
    requestJson<JobStopResponse>(`/planning/jobs/${jobId}/stop`, 'POST', {}),

  subscribeProgress: (jobId: string, handlers: ProgressHandlers): (() => void) => {
    const useMock = String(import.meta.env.VITE_USE_MOCK_DATA ?? 'false').toLowerCase() === 'true';
    if (useMock) {
      let currentHard = -3;
      let currentSoft = -120;
      let elapsed = 0;
      const interval = window.setInterval(() => {
        elapsed += 1;
        currentHard = Math.min(0, currentHard + 1);
        currentSoft += 25;
        handlers.onScoreUpdate?.({
          status: 'SOLVING',
          elapsedSeconds: elapsed,
          score: `${currentHard}hard/${currentSoft}soft`,
          hardScore: currentHard,
          softScore: currentSoft,
        });

        if (elapsed >= 5) {
          window.clearInterval(interval);
          handlers.onCompleted?.({
            status: 'COMPLETED',
            finalScore: '0hard/-20soft',
            savedPlanningId: 1,
            durationSeconds: elapsed,
          });
        }
      }, 1000);

      return () => window.clearInterval(interval);
    }

    const configuredBaseUrl = (import.meta.env.VITE_SOLVER_BASE_URL ?? import.meta.env.VITE_API_BASE_URL ?? '') as string;
    const baseUrl = configuredBaseUrl.trim().replace(/\/$/, '');
    const url = `${baseUrl}/planning/jobs/${jobId}/progress`;

    const eventSource = new EventSource(url);

    eventSource.addEventListener('score-update', (event) => {
      try {
        const data = JSON.parse(event.data) as JobProgressEvent;
        handlers.onScoreUpdate?.(data);
      } catch (err) {
        handlers.onError?.(err);
      }
    });

    eventSource.addEventListener('completed', (event) => {
      try {
        const data = JSON.parse(event.data) as JobCompletedEvent;
        handlers.onCompleted?.(data);
        eventSource.close();
      } catch (err) {
        handlers.onError?.(err);
      }
    });

    eventSource.addEventListener('terminated', (event) => {
      try {
        const data = JSON.parse(event.data) as JobCompletedEvent;
        handlers.onTerminated?.(data);
        eventSource.close();
      } catch (err) {
        handlers.onError?.(err);
      }
    });

    eventSource.addEventListener('error', (event) => {
      handlers.onError?.(event);
    });

    return () => {
      eventSource.close();
    };
  },
};
