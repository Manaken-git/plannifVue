import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import type { Creneau } from '../../types/creneau.types';

interface Props { open: boolean; mode: 'create' | 'edit'; item: Creneau | null; loading: boolean; onClose: () => void; onSave: (data: Creneau) => Promise<void>; onDelete: (id: number) => void; }
export function CreneauForm({ open, mode, item, loading, onClose, onSave, onDelete }: Props) {
  const [debut, setDebut] = useState('08:00'); const [fin, setFin] = useState('10:00');
  const [typeClasse, setTypeClasse] = useState('Cours');
  useEffect(() => {
    const parseTime = (val?: string) => {
      if (!val) return '';
      return val.includes('T') ? val.split('T')[1].slice(0, 8) : val.slice(0, 8);
    };
    setDebut(parseTime(item?.debut) || '08:00:00');
    setFin(parseTime(item?.fin) || '10:00:00');
    setTypeClasse(item?.typeClasse || 'Cours');
  }, [item, open]);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formatDate = (time: string, original?: string) => {
      const datePart = original?.includes('T') ? original.split('T')[0] : new Date().toISOString().split('T')[0];
      const fullTime = time.split(':').length === 2 ? `${time}:00` : time;
      return `${datePart}T${fullTime}`;
    };
    void onSave({
      id: item?.id,
      debut: formatDate(debut, item?.debut),
      fin: formatDate(fin, item?.fin),
      typeClasse,
    });
  };
  return <Modal open={open} size="sm" title={mode === 'create' ? 'Ajouter un créneau' : 'Modifier le créneau'} description="Définissez la plage horaire utilisée pour organiser les séances." onClose={onClose} onSubmit={submit} loading={loading} dangerAction={mode === 'edit' && item?.id ? { label: 'Supprimer', onClick: () => onDelete(item.id!) } : undefined}><div className="form-grid"><div className="form-field"><label>Heure de début</label><input type="time" step="1" value={debut} onChange={(e) => setDebut(e.target.value)} required /></div><div className="form-field"><label>Heure de fin</label><input type="time" step="1" value={fin} onChange={(e) => setFin(e.target.value)} required /></div><div className="form-field form-field--full"><label>Type de créneau</label><select value={typeClasse} onChange={(e) => setTypeClasse(e.target.value)}><option value="Cours">Cours</option><option value="TP">TP</option><option value="Examen">Examen</option><option value="Autre">Autre</option></select></div></div></Modal>;
}
