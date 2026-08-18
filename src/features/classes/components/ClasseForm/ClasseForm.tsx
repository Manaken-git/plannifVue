import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '../../../../shared/ui/Button/Button';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import type { Classe, ClassePresence } from '../../types/classe.types';
import './ClasseForm.css';

interface Props { open: boolean; mode: 'create' | 'edit'; item: Classe | null; loading: boolean; onClose: () => void; onSave: (data: Classe) => Promise<void>; onDelete: (id: number) => void; }
export function ClasseForm({ open, mode, item, loading, onClose, onSave, onDelete }: Props) {
  const [nom, setNom] = useState(''); const [presences, setPresences] = useState<ClassePresence[]>([]);
  useEffect(() => { setNom(item?.nom ?? ''); setPresences(item?.presences ? [...item.presences] : []); }, [item, open]);
  const updatePeriod = (index: number, key: 'dateDebut' | 'dateFin', value: string) => setPresences((current) => current.map((period, i) => i === index ? { ...period, [key]: value } : period));
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void onSave({ id: item?.id, nom: nom.trim(), presences }); };
  return <Modal open={open} size="lg" title={mode === 'create' ? 'Ajouter une classe' : 'Modifier la classe'} description="Définissez la classe et, si besoin, ses périodes de présence dans l'établissement." onClose={onClose} onSubmit={submit} loading={loading} dangerAction={mode === 'edit' && item?.id ? { label: 'Supprimer', onClick: () => onDelete(item.id!) } : undefined}><div className="form-grid"><div className="form-field form-field--full"><label>Nom de la classe</label><input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex. BTS SIO 1" required /></div><section className="form-section classe-form__periods"><div className="classe-form__period-header"><div><p className="form-section__title">Périodes de présence</p><span className="form-helper">Optionnel — utile pour les classes en alternance.</span></div><Button type="button" variant="secondary" onClick={() => setPresences((current) => [...current, { dateDebut: '', dateFin: '' }])} icon={<Plus size={13} />}>Période</Button></div>{presences.length === 0 ? <div className="classe-form__empty">Aucune période définie.</div> : <div className="form-subtle-list">{presences.map((period, index) => <div className="form-subtle-row" key={period.id ?? index}><input className="form-control" type="date" value={period.dateDebut} onChange={(e) => updatePeriod(index, 'dateDebut', e.target.value)} required /><input className="form-control" type="date" value={period.dateFin} onChange={(e) => updatePeriod(index, 'dateFin', e.target.value)} required /><Button type="button" variant="icon" className="entity-table__action-delete" onClick={() => setPresences((current) => current.filter((_, i) => i !== index))} icon={<Trash2 size={14} />} /></div>)}</div>}</section></div></Modal>;
}
