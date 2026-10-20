import { useCallback, useEffect, useRef, useState } from 'react';
import { solverApi } from '../api/solver.api';
import type {
  JobCompletedEvent,
  JobProgressEvent,
  JobStatus,
  JobSubmissionRequest,
} from '../types/solver.types';

export interface UseSolverJobOptions {
  onSuccess?: (savedPlanningId?: number, finalScore?: string) => void;
  onError?: (errorMessage: string) => void;
}

export function useSolverJob(options?: UseSolverJobOptions) {
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<JobStatus | 'IDLE'>('IDLE');
  const [progress, setProgress] = useState<JobProgressEvent | null>(null);
  const [result, setResult] = useState<JobCompletedEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cleanupRef = useRef<(() => void) | null>(null);
  const pollIntervalRef = useRef<number | null>(null);
  const isSolvingRef = useRef<boolean>(false);

  const isSolving = status === 'SUBMITTED' || status === 'SOLVING';
  isSolvingRef.current = isSolving;

  const clearSubscriptions = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    if (pollIntervalRef.current != null) {
      window.clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const handleFinish = useCallback(
    (event: JobCompletedEvent) => {
      clearSubscriptions();
      setStatus(event.status);
      setResult(event);
      options?.onSuccess?.(event.savedPlanningId, event.finalScore);
    },
    [clearSubscriptions, options]
  );

  const startFallbackPolling = useCallback(
    (targetJobId: string) => {
      if (pollIntervalRef.current != null) return;
      pollIntervalRef.current = window.setInterval(async () => {
        try {
          const detail = await solverApi.getJobStatus(targetJobId);
          if (detail.status === 'SOLVING') {
            setStatus('SOLVING');
            setProgress({
              status: 'SOLVING',
              elapsedSeconds: detail.elapsedSeconds ?? 0,
              score: detail.score ?? '',
              hardScore: detail.hardScore,
              softScore: detail.softScore,
            });
          } else if (detail.status === 'COMPLETED' || detail.status === 'TERMINATED_EARLY') {
            handleFinish({
              status: detail.status,
              finalScore: detail.score ?? '',
              savedPlanningId: detail.savedPlanningId,
              durationSeconds: detail.elapsedSeconds,
            });
          } else if (detail.status === 'FAILED') {
            clearSubscriptions();
            setStatus('FAILED');
            const msg = detail.errorMessage ?? 'Erreur lors de la résolution du planning.';
            setError(msg);
            options?.onError?.(msg);
          }
        } catch {
          // Silent polling retry
        }
      }, 2500);
    },
    [clearSubscriptions, handleFinish, options]
  );

  const startSolving = useCallback(
    async (request?: JobSubmissionRequest) => {
      clearSubscriptions();
      setError(null);
      setProgress(null);
      setResult(null);
      setStatus('SUBMITTED');

      try {
        const response = await solverApi.submitJob(request);
        const newJobId = response.jobId;
        setJobId(newJobId);
        setStatus('SOLVING');

        cleanupRef.current = solverApi.subscribeProgress(newJobId, {
          onScoreUpdate: (event) => {
            setStatus('SOLVING');
            setProgress(event);
          },
          onCompleted: (event) => {
            handleFinish(event);
          },
          onTerminated: (event) => {
            handleFinish(event);
          },
          onError: () => {
            // If SSE disconnects or fails, start fallback polling
            if (isSolvingRef.current) {
              startFallbackPolling(newJobId);
            }
          },
        });
      } catch (err) {
        clearSubscriptions();
        setStatus('FAILED');
        const msg = err instanceof Error ? err.message : 'Impossible de démarrer la résolution du planning.';
        setError(msg);
        options?.onError?.(msg);
      }
    },
    [clearSubscriptions, handleFinish, options, startFallbackPolling]
  );

  const stopSolving = useCallback(async () => {
    if (!jobId || !isSolvingRef.current) return;
    try {
      const response = await solverApi.stopJob(jobId);
      clearSubscriptions();
      setStatus(response.status);
      setResult({
        status: response.status,
        finalScore: response.score ?? progress?.score ?? '',
        savedPlanningId: response.savedPlanningId,
      });
      options?.onSuccess?.(response.savedPlanningId, response.score);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'arrêt du solveur.";
      setError(msg);
      options?.onError?.(msg);
    }
  }, [clearSubscriptions, jobId, options, progress]);

  const reset = useCallback(() => {
    clearSubscriptions();
    setJobId(null);
    setStatus('IDLE');
    setProgress(null);
    setResult(null);
    setError(null);
  }, [clearSubscriptions]);

  useEffect(() => {
    return () => {
      clearSubscriptions();
    };
  }, [clearSubscriptions]);

  return {
    jobId,
    status,
    progress,
    result,
    error,
    isSolving,
    startSolving,
    stopSolving,
    reset,
  };
}
