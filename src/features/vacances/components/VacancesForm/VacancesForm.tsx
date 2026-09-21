import { useEffect, useState, type FormEvent } from 'react';
import { DatePicker } from '../../../../shared/ui/DatePicker/DatePicker';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import type { Vacances } from '../../types/vacances.types';

interface Props { open: boolean; mode: 'create' | 'edit'; item: Vacances | null; loading: boolean; onClose: () => void; onSave: (data: Vacances) => Promise<void>; onDelete: (id: number) => void; }

export function VacancesForm({ open, mode, item, loading, onClose, onSave, onDelete }: Props) {
  const [nom, setNom] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  useEffect(() => { setNom(item?.nom ?? ''); setDateDebut(item?.dateDebut ?? ''); setDateFin(item?.dateFin ?? ''); }, [item, open]);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (nom.trim() && dateDebut && dateFin) void onSave({ id: item?.id, nom: nom.trim(), dateDebut, dateFin }); };
  return <Modal open={open} title={mode === 'create' ? 'Ajouter une période' : 'Modifier la période'} description="Cette période pourra être prise en compte lors de la génération du planning." onClose={onClose} onSubmit={submit} loading={loading} dangerAction={mode === 'edit' && item?.id ? { label: 'Supprimer', onClick: () => onDelete(item.id!) } : undefined}>
    <div className="form-grid"><div className="form-field form-field--full"><label>Nom</label><input value={nom} onChange={(event) => setNom(event.target.value)} placeholder="Ex. Vacances de la Toussaint" required /></div><div className="form-field"><label>Date de début</label><DatePicker value={dateDebut} onChange={setDateDebut} placeholder="Choisir le début" /></div><div className="form-field"><label>Date de fin</label><DatePicker value={dateFin} onChange={setDateFin} placeholder="Choisir la fin" /></div></div>
  </Modal>;
}
