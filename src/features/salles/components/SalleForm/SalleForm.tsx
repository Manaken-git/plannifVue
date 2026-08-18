import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import type { Salle } from '../../types/salle.types';

interface Props { open: boolean; mode: 'create' | 'edit'; item: Salle | null; loading: boolean; onClose: () => void; onSave: (data: Salle) => Promise<void>; onDelete: (id: number) => void; }
export function SalleForm({ open, mode, item, loading, onClose, onSave, onDelete }: Props) {
  const [code, setCode] = useState(''); const [capacite, setCapacite] = useState(0); const [type, setType] = useState('Cours');
  useEffect(() => { setCode(item?.code ?? ''); setCapacite(item?.capacite ?? 0); setType(item?.type ?? 'Cours'); }, [item, open]);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void onSave({ id: item?.id, code: code.trim(), capacite, type }); };
  return <Modal open={open} title={mode === 'create' ? 'Ajouter une salle' : 'Modifier la salle'} description="Renseignez le local utilisé pour accueillir les séances." onClose={onClose} onSubmit={submit} loading={loading} dangerAction={mode === 'edit' && item?.id ? { label: 'Supprimer', onClick: () => onDelete(item.id!) } : undefined}><div className="form-grid"><div className="form-field"><label>Code de la salle</label><input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Ex. B201" required /></div><div className="form-field"><label>Capacité</label><input type="number" min="0" value={capacite} onChange={(e) => setCapacite(Number(e.target.value))} required /></div><div className="form-field form-field--full"><label>Type de salle</label><select value={type} onChange={(e) => setType(e.target.value)}><option value="Cours">Cours standard</option><option value="TP">Travaux pratiques</option><option value="Amphithéâtre">Amphithéâtre</option><option value="Informatique">Salle informatique</option></select></div></div></Modal>;
}
