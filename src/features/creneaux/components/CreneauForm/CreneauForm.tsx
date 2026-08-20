import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import type { Creneau } from '../../types/creneau.types';

interface Props { open: boolean; mode: 'create' | 'edit'; item: Creneau | null; loading: boolean; onClose: () => void; onSave: (data: Creneau) => Promise<void>; onDelete: (id: number) => void; }
export function CreneauForm({ open, mode, item, loading, onClose, onSave, onDelete }: Props) {
  const [debut, setDebut] = useState('08:00'); const [fin, setFin] = useState('10:00');
  useEffect(() => { setDebut(item?.debut?.slice(0, 8) || '08:00'); setFin(item?.fin?.slice(0, 8) || '10:00'); }, [item, open]);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void onSave({ id: item?.id, debut, fin }); };
  return <Modal open={open} size="sm" title={mode === 'create' ? 'Ajouter un créneau' : 'Modifier le créneau'} description="Définissez la plage horaire utilisée pour organiser les séances." onClose={onClose} onSubmit={submit} loading={loading} dangerAction={mode === 'edit' && item?.id ? { label: 'Supprimer', onClick: () => onDelete(item.id!) } : undefined}><div className="form-grid"><div className="form-field"><label>Heure de début</label><input type="time" step="1" value={debut} onChange={(e) => setDebut(e.target.value)} required /></div><div className="form-field"><label>Heure de fin</label><input type="time" step="1" value={fin} onChange={(e) => setFin(e.target.value)} required /></div></div></Modal>;
}
