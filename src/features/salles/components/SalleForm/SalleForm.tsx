import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import type { Salle } from '../../types/salle.types';

interface Props { open: boolean; mode: 'create' | 'edit'; item: Salle | null; loading: boolean; onClose: () => void; onSave: (data: Salle) => Promise<void>; onDelete: (id: number) => void; }
export function SalleForm({ open, mode, item, loading, onClose, onSave, onDelete }: Props) {
  const [code, setCode] = useState('');
  const [capacite, setCapacite] = useState(0);
  const [type, setType] = useState('Cours');
  const [batiment, setBatiment] = useState('Bâtiment A');
  const [equipements, setEquipements] = useState<string[]>([]);

  const defaultEquipments = ['Vidéoprojecteur', 'Informatique', 'Labo SVT/Physique', 'Tableau blanc', 'Sono', 'Matériel Sport'];

  useEffect(() => {
    setCode(item?.code ?? '');
    setCapacite(item?.capacite ?? 0);
    setType(item?.type ?? 'Cours');
    setBatiment(item?.batiment ?? 'Bâtiment A');
    setEquipements(item?.equipements ?? ['Vidéoprojecteur']);
  }, [item, open]);

  const toggleEquipment = (eq: string) => {
    setEquipements((prev) => (prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq]));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSave({
      id: item?.id,
      code: code.trim(),
      capacite,
      type,
      batiment: batiment.trim() || undefined,
      equipements,
    });
  };

  return (
    <Modal
      open={open}
      size="lg"
      title={mode === 'create' ? 'Ajouter une salle' : 'Modifier la salle'}
      description="Renseignez le local, sa localisation (bâtiment) et ses équipements pédagogiques pour vérifier l'adéquation aux cours."
      onClose={onClose}
      onSubmit={submit}
      loading={loading}
      dangerAction={mode === 'edit' && item?.id ? { label: 'Supprimer', onClick: () => onDelete(item.id!) } : undefined}
    >
      <div className="form-grid">
        <div className="form-field">
          <label>Code de la salle</label>
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Ex. B201" required />
        </div>
        <div className="form-field">
          <label>Capacité (élèves)</label>
          <input type="number" min="0" value={capacite} onChange={(e) => setCapacite(Number(e.target.value))} required />
        </div>
        <div className="form-field">
          <label>Bâtiment</label>
          <input
            value={batiment}
            onChange={(e) => setBatiment(e.target.value)}
            placeholder="Ex. Bâtiment A, Sciences, Gymnase"
            list="batiments-list"
          />
          <datalist id="batiments-list">
            <option value="Bâtiment A" />
            <option value="Bâtiment B" />
            <option value="Bâtiment Sciences" />
            <option value="Bâtiment Principal" />
            <option value="Gymnase" />
          </datalist>
        </div>
        <div className="form-field">
          <label>Type de salle</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="Cours">Cours standard</option>
            <option value="TP">Travaux pratiques (Labo)</option>
            <option value="Amphithéâtre">Amphithéâtre</option>
            <option value="Informatique">Salle informatique</option>
            <option value="EPS">Installations sportives</option>
          </select>
        </div>
        <section className="form-section form-field--full">
          <p className="form-section__title">Équipements disponibles</p>
          <div className="form-chip-grid">
            {defaultEquipments.map((eq) => (
              <button
                key={eq}
                type="button"
                className={`form-chip${equipements.includes(eq) ? ' is-selected' : ''}`}
                onClick={() => toggleEquipment(eq)}
              >
                {eq}
              </button>
            ))}
          </div>
        </section>
      </div>
    </Modal>
  );
}
