export type JobStatus = 'SUBMITTED' | 'SOLVING' | 'COMPLETED' | 'TERMINATED_EARLY' | 'FAILED';

export interface JobSubmissionRequest {
  constraintWeightOverrides?: Record<string, string>;
}

export interface JobSubmissionResponse {
  jobId: string;
  status: JobStatus;
  submittedAt: string;
  solverSpentLimitSeconds: number;
}

export interface JobProgressEvent {
  status: JobStatus;
  elapsedSeconds: number;
  score: string;
  hardScore?: number;
  softScore?: number;
}

export interface JobCompletedEvent {
  status: JobStatus;
  finalScore: string;
  savedPlanningId?: number;
  durationSeconds?: number;
}

export interface JobStopResponse {
  jobId: string;
  status: JobStatus;
  message: string;
  savedPlanningId?: number;
  score?: string;
}

export interface ConstraintMatchInfo {
  constraintName: string;
  score: string;
  count: number;
}

export interface ScoreExplanationDetail {
  hardScore: number;
  softScore: number;
  summary?: string;
  matches?: ConstraintMatchInfo[];
}

export interface JobStatusResponse {
  jobId: string;
  status: JobStatus;
  submittedAt: string;
  completedAt?: string;
  savedPlanningId?: number;
  score?: string;
  hardScore?: number;
  softScore?: number;
  errorMessage?: string;
  explanation?: ScoreExplanationDetail | string;
  elapsedSeconds?: number;
}
