import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import type { Classe } from '../../../classes/types/classe.types';
import type { Eleve } from '../../types/eleve.types';

interface Props { open: boolean; mode: 'create' | 'edit'; item: Eleve | null; classes: Classe[]; loading: boolean; onClose: () => void; onSave: (data: Eleve, classeId?: number) => Promise<void>; onDelete: (id: number) => void; }
export function EleveForm({ open, mode, item, classes, loading, onClose, onSave, onDelete }: Props) {
  const [nom, setNom] = useState(''); const [prenom, setPrenom] = useState(''); const [classeId, setClasseId] = useState<number | ''>('');
  useEffect(() => { setNom(item?.nom ?? ''); setPrenom(item?.prenom ?? ''); setClasseId(item?.classeId ?? ''); }, [item, open]);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void onSave({ id: item?.id, nom: nom.trim(), prenom: prenom.trim() }, classeId === '' ? undefined : classeId); };
  return <Modal open={open} title={mode === 'create' ? 'Ajouter un élève' : "Modifier l'élève"} description="Renseignez l'identité et la classe de rattachement." onClose={onClose} onSubmit={submit} loading={loading} dangerAction={mode === 'edit' && item?.id ? { label: 'Supprimer', onClick: () => onDelete(item.id!) } : undefined}><div className="form-grid"><div className="form-field"><label>Nom</label><input value={nom} onChange={(e) => setNom(e.target.value)} required /></div><div className="form-field"><label>Prénom</label><input value={prenom} onChange={(e) => setPrenom(e.target.value)} required /></div><div className="form-field form-field--full"><label>Classe</label><select value={classeId} onChange={(e) => setClasseId(e.target.value ? Number(e.target.value) : '')}><option value="">Aucune classe</option>{classes.map((classe) => <option key={classe.id} value={classe.id}>{classe.nom}</option>)}</select></div></div></Modal>;
}
