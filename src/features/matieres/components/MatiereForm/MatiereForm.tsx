import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import type { Matiere } from '../../types/matiere.types';

interface Props {
  open: boolean;
  mode: 'create' | 'edit';
  item: Matiere | null;
  loading: boolean;
  onClose: () => void;
  onSave: (data: Matiere) => Promise<void>;
  onDelete: (id: number) => void;
}

export function MatiereForm({ open, mode, item, loading, onClose, onSave, onDelete }: Props) {
  const [nom, setNom] = useState('');
  useEffect(() => setNom(item?.nom ?? ''), [item, open]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSave({ id: item?.id, nom: nom.trim() });
  };

  return (
    <Modal open={open} title={mode === 'create' ? 'Ajouter une matière' : 'Modifier la matière'} description="Une matière peut ensuite être associée aux classes, professeurs et séances." onClose={onClose} onSubmit={submit} loading={loading} dangerAction={mode === 'edit' && item?.id ? { label: 'Supprimer', onClick: () => onDelete(item.id!) } : undefined}>
      <div className="form-grid"><div className="form-field form-field--full"><label>Nom de la matière</label><input value={nom} onChange={(event) => setNom(event.target.value)} placeholder="Ex. Mathématiques" required autoFocus /></div></div>
    </Modal>
  );
}
