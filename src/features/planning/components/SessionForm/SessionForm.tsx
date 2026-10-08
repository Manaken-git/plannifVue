import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import type { Classe } from '../../../classes/types/classe.types';
import type { Matiere } from '../../../matieres/types/matiere.types';
import type { Professeur } from '../../../professeurs/types/professeur.types';
import type { Salle } from '../../../salles/types/salle.types';
import type { Seance, SessionAssociations } from '../../types/planning.types';

interface Props {
  open: boolean;
  mode: 'create' | 'edit';
  item: Seance | null;
  professeurs: Professeur[];
  classes: Classe[];
  matieres: Matiere[];
  salles: Salle[];
  loading: boolean;
  onClose: () => void;
  onSave: (data: Seance, associations: SessionAssociations) => Promise<void>;
  onDelete: (id: number) => void;
}

function localInputValue(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function SessionForm({ open, mode, item, professeurs, classes, matieres, salles, loading, onClose, onSave, onDelete }: Props) {
  const [debut, setDebut] = useState('');
  const [fin, setFin] = useState('');
  const [professeurId, setProfesseurId] = useState<number | ''>('');
  const [classeId, setClasseId] = useState<number | ''>('');
  const [matiereId, setMatiereId] = useState<number | ''>('');
  const [salleId, setSalleId] = useState<number | ''>('');
  const [groupeNom, setGroupeNom] = useState('Classe entière');
  const [typeSeance, setTypeSeance] = useState('Cours');
  const [alignementId, setAlignementId] = useState('');

  const selectedClass = classes.find((c) => c.id === classeId);

  useEffect(() => {
    if (item) {
      setDebut(item.debut?.slice(0, 16) ?? '');
      setFin(item.fin?.slice(0, 16) ?? '');
      setProfesseurId(professeurs.find((p) => `${p.prenom} ${p.nom}` === item.professeurNomComplet)?.id ?? '');
      setClasseId(classes.find((c) => c.nom === item.classeNom)?.id ?? '');
      setMatiereId(matieres.find((m) => m.nom === item.matiereNom)?.id ?? '');
      setSalleId(salles.find((s) => s.code === item.salleCode)?.id ?? '');
      setGroupeNom(item.groupeNom ?? 'Classe entière');
      setTypeSeance(item.typeSeance ?? 'Cours');
      setAlignementId(item.alignementId ?? '');
      return;
    }

    const start = new Date();
    start.setMinutes(0, 0, 0);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    setDebut(localInputValue(start));
    setFin(localInputValue(end));
    setProfesseurId('');
    setClasseId('');
    setMatiereId('');
    setSalleId('');
    setGroupeNom('Classe entière');
    setTypeSeance('Cours');
    setAlignementId('');
  }, [item, open, professeurs, classes, matieres, salles]);

  const setDurationMinutes = (minutes: number) => {
    if (!debut) return;
    const start = new Date(debut);
    const end = new Date(start.getTime() + minutes * 60 * 1000);
    setFin(localInputValue(end));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSave(
      {
        id: item?.id,
        debut,
        fin,
        groupeNom: groupeNom === 'Classe entière' ? undefined : groupeNom,
        typeSeance,
        alignementId: alignementId.trim() || undefined,
      },
      {
        professeurId: professeurId === '' ? undefined : professeurId,
        classeId: classeId === '' ? undefined : classeId,
        matiereId: matiereId === '' ? undefined : matiereId,
        salleId: salleId === '' ? undefined : salleId,
        groupeNom: groupeNom === 'Classe entière' ? undefined : groupeNom,
        typeSeance,
        alignementId: alignementId.trim() || undefined,
      },
    );
  };

  return (
    <Modal
      open={open}
      title={mode === 'create' ? 'Planifier une séance' : 'Modifier la séance'}
      description="Définissez l'horaire, l'enseignant, la classe, la matière et la salle."
      onClose={onClose}
      onSubmit={submit}
      loading={loading}
      dangerAction={mode === 'edit' && item?.id ? { label: 'Supprimer', onClick: () => onDelete(item.id!) } : undefined}
    >
      <div className="form-grid">
        <div className="form-field">
          <label>Début</label>
          <input type="datetime-local" value={debut} onChange={(e) => setDebut(e.target.value)} required />
        </div>
        <div className="form-field">
          <label>Fin</label>
          <input type="datetime-local" value={fin} onChange={(e) => setFin(e.target.value)} required />
        </div>

        <div className="form-field form-field--full" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted, #888)' }}>Durée rapide :</span>
          <button type="button" className="form-chip" onClick={() => setDurationMinutes(60)}>1h00</button>
          <button type="button" className="form-chip" onClick={() => setDurationMinutes(90)}>1h30 (TP standard)</button>
          <button type="button" className="form-chip" onClick={() => setDurationMinutes(120)}>2h00 (Bloc double)</button>
        </div>

        <div className="form-field">
          <label>Professeur</label>
          <select value={professeurId} onChange={(e) => setProfesseurId(e.target.value ? Number(e.target.value) : '')} required>
            <option value="">Sélectionner…</option>
            {professeurs.map((p) => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label>Classe</label>
          <select value={classeId} onChange={(e) => setClasseId(e.target.value ? Number(e.target.value) : '')} required>
            <option value="">Sélectionner…</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
        </div>

        <div className="form-field">
          <label>Public / Demi-groupe</label>
          <select value={groupeNom} onChange={(e) => setGroupeNom(e.target.value)}>
            <option value="Classe entière">Classe entière</option>
            {selectedClass?.groupes?.map((grp) => (
              <option key={grp.id ?? grp.nom} value={grp.nom}>
                {grp.nom} ({grp.effectif} élèves)
              </option>
            )) ?? (
              <>
                <option value="Groupe A">Groupe A</option>
                <option value="Groupe B">Groupe B</option>
              </>
            )}
          </select>
        </div>

        <div className="form-field">
          <label>Type de séance</label>
          <select value={typeSeance} onChange={(e) => setTypeSeance(e.target.value)}>
            <option value="Cours">Cours standard</option>
            <option value="TP">Travaux Pratiques (TP)</option>
            <option value="TD">Travaux Dirigés (TD)</option>
            <option value="Option">Option / Spécialité</option>
          </select>
        </div>

        <div className="form-field">
          <label>Matière</label>
          <select value={matiereId} onChange={(e) => setMatiereId(e.target.value ? Number(e.target.value) : '')} required>
            <option value="">Sélectionner…</option>
            {matieres.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label>Salle</label>
          <select value={salleId} onChange={(e) => setSalleId(e.target.value ? Number(e.target.value) : '')} required>
            <option value="">Sélectionner…</option>
            {salles.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} · {s.type} ({s.capacite} pl. · {s.batiment || 'Bât. A'})
              </option>
            ))}
          </select>
        </div>

        <div className="form-field form-field--full">
          <label>Alignement d'options ou demi-groupes (optionnel)</label>
          <input
            value={alignementId}
            onChange={(e) => setAlignementId(e.target.value)}
            placeholder="Ex. ALIGN-TP-SCIENCES, ALIGN-LV2"
          />
        </div>
      </div>
    </Modal>
  );
}
