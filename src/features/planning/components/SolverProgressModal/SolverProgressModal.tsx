import { AlertTriangle, CheckCircle2, Clock, Cpu, Loader2, Square, XCircle } from 'lucide-react';
import { Button } from '../../../../shared/ui/Button/Button';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import type { JobCompletedEvent, JobProgressEvent, JobStatus } from '../../types/solver.types';
import './SolverProgressModal.css';

interface Props {
  open: boolean;
  onClose: () => void;
  status: JobStatus | 'IDLE';
  progress: JobProgressEvent | null;
  result: JobCompletedEvent | null;
  error: string | null;
  isSolving: boolean;
  onStop: () => void;
  onViewResult?: (savedPlanningId: number) => void;
}

export function SolverProgressModal({
  open,
  onClose,
  status,
  progress,
  result,
  error,
  isSolving,
  onStop,
  onViewResult,
}: Props) {
  if (!open) return null;

  const hardScore = progress?.hardScore ?? 0;
  const softScore = progress?.softScore ?? 0;
  const isHardFeasible = hardScore === 0;
  const elapsed = progress?.elapsedSeconds ?? result?.durationSeconds ?? 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Résolution automatique de l'emploi du temps"
      description="Optimisation des cours, salles et contraintes enseignants par Timefold Solver."
      size="md"
      customFooter={
        <div className="modal__footer-actions" style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          {isSolving && (
            <>
              <Button
                type="button"
                variant="danger"
                icon={<Square size={16} />}
                onClick={onStop}
              >
                Arrêter et valider cette solution
              </Button>
              <Button type="button" variant="secondary" onClick={onClose}>
                Laisser tourner en arrière-plan
              </Button>
            </>
          )}

          {!isSolving && (
            <>
              {result?.savedPlanningId && onViewResult && (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => onViewResult(result.savedPlanningId!)}
                >
                  Afficher le planning résolu #{result.savedPlanningId}
                </Button>
              )}
              <Button type="button" variant="secondary" onClick={onClose}>
                Fermer
              </Button>
            </>
          )}
        </div>
      }
    >
      <div className="solver-modal">
        {/* Banner state */}
        {isSolving && (
          <div className="solver-modal__status-box solver-modal__status-box--solving">
            <Loader2 className="solver-modal__icon-spinner" size={24} />
            <div>
              <strong>Calcul d'optimisation en cours...</strong>
              <p className="text-sm text-muted">
                Timefold explore les combinaisons pour satisfaire l'ensemble des contraintes.
              </p>
            </div>
          </div>
        )}

        {status === 'COMPLETED' && (
          <div className="solver-modal__status-box solver-modal__status-box--completed">
            <CheckCircle2 color="var(--success, #45d5a3)" size={26} />
            <div>
              <strong>Résolution terminée avec succès !</strong>
              <p className="text-sm text-muted">
                La solution a été enregistrée automatiquement dans vos plannings.
              </p>
            </div>
          </div>
        )}

        {status === 'TERMINATED_EARLY' && (
          <div className="solver-modal__status-box solver-modal__status-box--stopped">
            <CheckCircle2 color="var(--warning, #f6c760)" size={26} />
            <div>
              <strong>Calcul interrompu manuellement</strong>
              <p className="text-sm text-muted">
                La meilleure solution intermédiaire trouvée a été enregistrée avec succès.
              </p>
            </div>
          </div>
        )}

        {status === 'FAILED' && (
          <div className="solver-modal__status-box solver-modal__status-box--failed">
            <XCircle color="var(--danger, #fb7f94)" size={26} />
            <div>
              <strong>Échec de la résolution</strong>
              <p className="text-sm text-muted">{error || 'Une erreur est survenue pendant le calcul.'}</p>
            </div>
          </div>
        )}

        {/* Progress bar during solving */}
        {isSolving && <div className="solver-modal__pulse-bar" />}

        {/* Scores & Metrics */}
        {(progress || result) && (
          <>
            <div className="solver-modal__scores-grid">
              <div
                className={`solver-modal__score-card ${
                  isHardFeasible ? 'solver-modal__score-card--hard-success' : 'solver-modal__score-card--hard-danger'
                }`}
              >
                <span className="solver-modal__score-label">Contraintes Dures (Faisabilité)</span>
                <span className="solver-modal__score-value">
                  {isHardFeasible ? (
                    '0 conflit (Valide)'
                  ) : (
                    <>
                      <AlertTriangle size={18} /> {hardScore} conflit{Math.abs(hardScore) > 1 ? 's' : ''}
                    </>
                  )}
                </span>
              </div>

              <div className="solver-modal__score-card solver-modal__score-card--soft">
                <span className="solver-modal__score-label">Contraintes Souples (Qualité)</span>
                <span className="solver-modal__score-value">{softScore} pts</span>
              </div>
            </div>

            <div className="solver-modal__meta">
              <span>
                <Clock size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Temps écoulé : <strong>{elapsed}s</strong>
              </span>
              <span>
                <Cpu size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Score brut : <code>{progress?.score || result?.finalScore || '—'}</code>
              </span>
            </div>
          </>
        )}

        {/* Explanatory notice */}
        {isSolving && (
          <p className="solver-modal__notice">
            Astuce : Si le score dur atteint <strong>0 conflit</strong>, l'emploi du temps est 100% faisable.
            Vous pouvez arrêter le calcul à tout moment pour adopter immédiatement ce planning.
          </p>
        )}
      </div>
    </Modal>
  );
}
