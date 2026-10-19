import { Calendar, Clock, Edit2, ExternalLink, Trash2, Users } from 'lucide-react';
import { Badge } from '../../../../shared/ui/Badge/Badge';
import { Button } from '../../../../shared/ui/Button/Button';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import type { FlattenedPresence } from './classesPresence.types';
import { getDurationLabel, getPresenceStatus } from './classesPresence.utils';

interface Props {
  open: boolean;
  item: FlattenedPresence | null;
  onClose: () => void;
  onEdit: (item: FlattenedPresence) => void;
  onDelete: (item: FlattenedPresence) => void;
  onViewSchedule: (item: FlattenedPresence) => void;
}

export function PresenceDetailModal({
  open,
  item,
  onClose,
  onEdit,
  onDelete,
  onViewSchedule,
}: Props) {
  if (!item) return null;

  const status = getPresenceStatus(item.startDate, item.endDate);
  const durationLabel = getDurationLabel(item.startDate, item.endDate);

  const formatLongDate = (d: Date) =>
    d.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  return (
    <Modal
      open={open}
      title=""
      onClose={onClose}
      size="md"
    >
      <div className="google-event-detail">
        {/* Color stripe & title */}
        <div
          className="google-event-detail__header"
          style={{
            borderLeft: `5px solid ${item.color.primary}`,
            background: item.color.bg,
          }}
        >
          <div className="google-event-detail__badge-row">
            <span
              className="google-event-detail__dot"
              style={{ backgroundColor: item.color.primary }}
            />
            <span className="google-event-detail__type">Présence Classe</span>
            {status === 'current' && <Badge tone="success">En cours</Badge>}
            {status === 'upcoming' && <Badge tone="info">À venir</Badge>}
            {status === 'past' && <Badge tone="neutral">Terminée</Badge>}
          </div>
          <h2 className="google-event-detail__title">{item.classeNom}</h2>
        </div>

        {/* Info list */}
        <div className="google-event-detail__body">
          <div className="google-event-detail__row">
            <Calendar size={18} className="google-event-detail__icon" />
            <div>
              <div className="google-event-detail__label">Période de présence</div>
              <div className="google-event-detail__value">
                Du <strong>{formatLongDate(item.startDate)}</strong> au{' '}
                <strong>{formatLongDate(item.endDate)}</strong>
              </div>
              <div className="google-event-detail__subvalue">
                Durée : {durationLabel}
              </div>
            </div>
          </div>

          <div className="google-event-detail__row">
            <Users size={18} className="google-event-detail__icon" />
            <div>
              <div className="google-event-detail__label">Effectif & Structure</div>
              <div className="google-event-detail__value">
                {item.effectif ? `${item.effectif} élèves` : 'Effectif non renseigné'}
                {item.classe.groupes && item.classe.groupes.length > 0 && (
                  <span className="google-event-detail__subvalue">
                    {' '}({item.classe.groupes.length} groupe{item.classe.groupes.length > 1 ? 's' : ''}:{' '}
                    {item.classe.groupes.map((g) => g.nom).join(', ')})
                  </span>
                )}
              </div>
            </div>
          </div>

          {(item.classe.heureDebutMin || item.classe.heureFinMax) && (
            <div className="google-event-detail__row">
              <Clock size={18} className="google-event-detail__icon" />
              <div>
                <div className="google-event-detail__label">Horaires types</div>
                <div className="google-event-detail__value">
                  {item.classe.heureDebutMin ?? '08:00'} - {item.classe.heureFinMax ?? '18:00'}
                  {item.classe.maxHeuresParJour ? ` (max ${item.classe.maxHeuresParJour}h/jour)` : ''}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions bar */}
        <div className="google-event-detail__footer">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onViewSchedule(item)}
            icon={<ExternalLink size={14} />}
          >
            Voir l'emploi du temps
          </Button>

          <div className="google-event-detail__footer-right">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onEdit(item)}
              icon={<Edit2 size={14} />}
            >
              Modifier
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => onDelete(item)}
              icon={<Trash2 size={14} />}
            >
              Supprimer
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
