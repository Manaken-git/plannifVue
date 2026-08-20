import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import type { Vacances } from '../../types/vacances.types';

interface Props { open: boolean; mode: 'create' | 'edit'; item: Vacances | null; loading: boolean; onClose: () => void; onSave: (data: Vacances) => Promise<void>; onDelete: (id: number) => void; }
export function VacancesForm({ open, mode, item, loading, onClose, onSave, onDelete }: Props) {
  const [nom, setNom] = useState(''); const [dateDebut, setDateDebut] = useState(''); const [dateFin, setDateFin] = useState('');
  useEffect(() => { setNom(item?.nom ?? ''); setDateDebut(item?.dateDebut ?? ''); setDateFin(item?.dateFin ?? ''); }, [item, open]);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void onSave({ id: item?.id, nom: nom.trim(), dateDebut, dateFin }); };
  return <Modal open={open} title={mode === 'create' ? 'Ajouter une période' : 'Modifier la période'} description="Cette période pourra être prise en compte lors de la génération du planning." onClose={onClose} onSubmit={submit} loading={loading} dangerAction={mode === 'edit' && item?.id ? { label: 'Supprimer', onClick: () => onDelete(item.id!) } : undefined}><div className="form-grid"><div className="form-field form-field--full"><label>Nom</label><input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex. Vacances de la Toussaint" required /></div><div className="form-field"><label>Date de début</label><input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} required /></div><div className="form-field"><label>Date de fin</label><input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} required /></div></div></Modal>;
}
