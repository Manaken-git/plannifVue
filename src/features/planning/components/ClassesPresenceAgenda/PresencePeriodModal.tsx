import { useEffect, useMemo, useState } from 'react';
import type { Classe } from '../../../classes/types/classe.types';
import { DatePicker } from '../../../../shared/ui/DatePicker/DatePicker';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import type { FlattenedPresence } from './classesPresence.types';
import { formatDateIso, getDurationLabel, parseDateOnly } from './classesPresence.utils';

interface Props {
  open: boolean;
  item: FlattenedPresence | null; // null => new period
  classes: Classe[];
  defaultDate?: string;
  onClose: () => void;
  onSave: (classeId: number, dateDebut: string, dateFin: string, periodIndex?: number) => Promise<void>;
  loading?: boolean;
}

export function PresencePeriodModal({
  open,
  item,
  classes,
  defaultDate,
  onClose,
  onSave,
  loading = false,
}: Props) {
  const [selectedClasseId, setSelectedClasseId] = useState<number>(0);
  const [dateDebut, setDateDebut] = useState<string>('');
  const [dateFin, setDateFin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setSelectedClasseId(item.classeId);
      setDateDebut(item.dateDebut);
      setDateFin(item.dateFin);
      setError(null);
    } else {
      const fallbackId = classes[0]?.id ?? 0;
      setSelectedClasseId(fallbackId);
      const base = defaultDate || formatDateIso(new Date());
      setDateDebut(base);
      // Default to 4 weeks later
      const end = parseDateOnly(base);
      end.setDate(end.getDate() + 27);
      setDateFin(formatDateIso(end));
      setError(null);
    }
  }, [item, open, classes, defaultDate]);

  const durationPreview = useMemo(() => {
    if (!dateDebut || !dateFin) return null;
    const start = parseDateOnly(dateDebut);
    const end = parseDateOnly(dateFin);
    if (end < start) return null;
    return getDurationLabel(start, end);
  }, [dateDebut, dateFin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedClasseId) {
      setError('Veuillez sélectionner une classe.');
      return;
    }
    if (!dateDebut || !dateFin) {
      setError('Veuillez renseigner la date de début et de fin.');
      return;
    }

    const start = parseDateOnly(dateDebut);
    const end = parseDateOnly(dateFin);
    if (end < start) {
      setError('La date de fin ne peut pas être antérieure à la date de début.');
      return;
    }

    try {
      await onSave(selectedClasseId, dateDebut, dateFin, item ? item.periodIndex : undefined);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde.');
    }
  };

  return (
    <Modal
      open={open}
      title={item ? 'Modifier la période de présence' : 'Nouvelle période de présence'}
      description="Définissez les dates de présence de la promotion à l'établissement (alternance, sessions bloquées)."
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={item ? 'Mettre à jour' : 'Ajouter la période'}
      loading={loading}
      size="md"
    >
      <div className="form-grid">
        {error && (
          <div
            className="form-field--full"
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'var(--danger-soft)',
              border: '1px solid rgba(251, 127, 148, 0.35)',
              color: 'var(--danger)',
              fontSize: '12.5px',
            }}
          >
            {error}
          </div>
        )}

        <div className="form-field form-field--full">
          <label htmlFor="presence-classe-select">Classe concernée</label>
          <select
            id="presence-classe-select"
            value={selectedClasseId}
            onChange={(e) => setSelectedClasseId(Number(e.target.value))}
            disabled={Boolean(item)}
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom} {c.effectif ? `(${c.effectif} élèves)` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>Date de début</label>
          <DatePicker
            value={dateDebut}
            onChange={setDateDebut}
            placeholder="Début de la période"
          />
        </div>

        <div className="form-field">
          <label>Date de fin</label>
          <DatePicker
            value={dateFin}
            onChange={setDateFin}
            placeholder="Fin de la période"
          />
        </div>

        {durationPreview && (
          <div
            className="form-field--full"
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'var(--primary-soft)',
              border: '1px solid rgba(116, 119, 245, 0.22)',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>Durée calculée :</span>
            <strong style={{ color: 'var(--primary)' }}>{durationPreview}</strong>
          </div>
        )}
      </div>
    </Modal>
  );
}
