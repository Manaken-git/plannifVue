import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import { DatePicker } from '../../../../shared/ui/DatePicker/DatePicker';
import type { Classe } from '../../../classes/types/classe.types';
import type { Matiere } from '../../../matieres/types/matiere.types';
import type { MatiereClasseConfig } from '../../types/config.types';

interface Props { open: boolean; mode: 'create' | 'edit'; item: MatiereClasseConfig | null; classes: Classe[]; matieres: Matiere[]; loading: boolean; onClose: () => void; onSave: (data: MatiereClasseConfig) => Promise<void>; onDelete: (id: number) => void; }
export function ConfigForm({ open, mode, item, classes, matieres, loading, onClose, onSave, onDelete }: Props) {
  const [classeId, setClasseId] = useState<number | ''>('');
  const [matiereId, setMatiereId] = useState<number | ''>('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [volume, setVolume] = useState<number | ''>('');
  const [prioriteMatin, setPrioriteMatin] = useState(false);
  const [autoriserBlocDouble, setAutoriserBlocDouble] = useState(false);
  const [dureeParDefautMinutes, setDureeParDefautMinutes] = useState<number | ''>(60);
  const [typeSalleRequis, setTypeSalleRequis] = useState('Cours');
  const [equipementsRequis, setEquipementsRequis] = useState<string[]>([]);

  const defaultEquipments = ['Vidéoprojecteur', 'Informatique', 'Labo SVT/Physique', 'Tableau blanc', 'Sono', 'Matériel Sport'];

  useEffect(() => {
    setClasseId(item?.classeId ?? '');
    setMatiereId(item?.matiereId ?? '');
    setDateDebut(item?.dateDebut ?? '');
    setDateFin(item?.dateFin ?? '');
    setVolume(item?.volumeHorairePeriode ?? '');
    setPrioriteMatin(item?.prioriteMatin ?? item?.chargeCognitiveElevee ?? false);
    setAutoriserBlocDouble(item?.autoriserBlocDouble ?? false);
    setDureeParDefautMinutes(item?.dureeParDefautMinutes ?? 60);
    setTypeSalleRequis(item?.typeSalleRequis ?? 'Cours');
    setEquipementsRequis(item?.equipementsRequis ?? []);
  }, [item, open]);

  const toggleEquipment = (eq: string) => {
    setEquipementsRequis((prev) => (prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq]));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSave({
      id: item?.id,
      classeId: classeId === '' ? undefined : classeId,
      matiereId: matiereId === '' ? undefined : matiereId,
      dateDebut: dateDebut || null,
      dateFin: dateFin || null,
      volumeHorairePeriode: volume === '' ? null : volume,
      prioriteMatin,
      chargeCognitiveElevee: prioriteMatin,
      autoriserBlocDouble,
      dureeParDefautMinutes: dureeParDefautMinutes === '' ? null : Number(dureeParDefautMinutes),
      typeSalleRequis,
      equipementsRequis,
    });
  };

  return (
    <Modal
      open={open}
      size="lg"
      title={mode === 'create' ? 'Ajouter une configuration' : 'Modifier la configuration'}
      description="Définissez le volume horaire, la durée par séance, les équipements requis et les règles pédagogiques."
      onClose={onClose}
      onSubmit={submit}
      loading={loading}
      dangerAction={mode === 'edit' && item?.id ? { label: 'Supprimer', onClick: () => onDelete(item.id!) } : undefined}
    >
      <div className="form-grid">
        <div className="form-field">
          <label>Classe</label>
          <select
            value={classeId}
            onChange={(e) => setClasseId(e.target.value ? Number(e.target.value) : '')}
            required
          >
            <option value="">Sélectionner…</option>
            {classes.map((classe) => (
              <option key={classe.id} value={classe.id}>
                {classe.nom}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label>Matière</label>
          <select
            value={matiereId}
            onChange={(e) => setMatiereId(e.target.value ? Number(e.target.value) : '')}
            required
          >
            <option value="">Sélectionner…</option>
            {matieres.map((matiere) => (
              <option key={matiere.id} value={matiere.id}>
                {matiere.nom}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label>Date de début</label>
          <DatePicker value={dateDebut} onChange={setDateDebut} placeholder="Date de début" />
        </div>
        <div className="form-field">
          <label>Date de fin</label>
          <DatePicker value={dateFin} onChange={setDateFin} placeholder="Date de fin" />
        </div>
        <div className="form-field">
          <label>Volume total de la période (h)</label>
          <input
            type="number"
            min="0"
            value={volume}
            onChange={(e) => setVolume(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Ex. 120"
          />
        </div>
        <div className="form-field">
          <label>Durée attendue par séance (min)</label>
          <input
            type="number"
            min="15"
            step="15"
            value={dureeParDefautMinutes}
            onChange={(e) => setDureeParDefautMinutes(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Ex. 60, 90, 120"
          />
        </div>

        <section className="form-section form-field--full">
          <p className="form-section__title">Règles pédagogiques Lycée</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={prioriteMatin}
                onChange={(e) => setPrioriteMatin(e.target.checked)}
                style={{ width: 'auto' }}
              />
              <span>Priorité le matin (charge cognitive élevée)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={autoriserBlocDouble}
                onChange={(e) => setAutoriserBlocDouble(e.target.checked)}
                style={{ width: 'auto' }}
              />
              <span>Favoriser les blocs consécutifs de 2h d'affilée</span>
            </label>
          </div>
        </section>

        <div className="form-field form-field--full">
          <label>Type de salle requis</label>
          <select value={typeSalleRequis} onChange={(e) => setTypeSalleRequis(e.target.value)}>
            <option value="Cours">Cours standard</option>
            <option value="TP">Travaux pratiques (Laboratoire)</option>
            <option value="Informatique">Salle informatique</option>
            <option value="Amphithéâtre">Amphithéâtre</option>
            <option value="EPS">Installations sportives</option>
          </select>
        </div>

        <section className="form-section form-field--full">
          <p className="form-section__title">Équipements obligatoires requis</p>
          <div className="form-chip-grid">
            {defaultEquipments.map((eq) => (
              <button
                key={eq}
                type="button"
                className={`form-chip${equipementsRequis.includes(eq) ? ' is-selected' : ''}`}
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
