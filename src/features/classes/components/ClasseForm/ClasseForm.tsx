import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '../../../../shared/ui/Button/Button';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import { DatePicker } from '../../../../shared/ui/DatePicker/DatePicker';
import type { Classe, ClasseGroupe, ClassePresence } from '../../types/classe.types';
import './ClasseForm.css';

interface Props { open: boolean; mode: 'create' | 'edit'; item: Classe | null; loading: boolean; onClose: () => void; onSave: (data: Classe) => Promise<void>; onDelete: (id: number) => void; }

export function ClasseForm({ open, mode, item, loading, onClose, onSave, onDelete }: Props) {
  const [nom, setNom] = useState('');
  const [effectif, setEffectif] = useState<number | ''>(30);
  const [heureDebutMin, setHeureDebutMin] = useState('08:00');
  const [heureFinMax, setHeureFinMax] = useState('18:00');
  const [maxHeuresParJour, setMaxHeuresParJour] = useState<number | ''>(7);
  const [dureePauseDejeunerMin, setDureePauseDejeunerMin] = useState<number | ''>(90);
  const [groupes, setGroupes] = useState<ClasseGroupe[]>([]);
  const [presences, setPresences] = useState<ClassePresence[]>([]);

  useEffect(() => {
    setNom(item?.nom ?? '');
    setEffectif(item?.effectif ?? 30);
    setHeureDebutMin(item?.heureDebutMin ?? '08:00');
    setHeureFinMax(item?.heureFinMax ?? '18:00');
    setMaxHeuresParJour(item?.maxHeuresParJour ?? 7);
    setDureePauseDejeunerMin(item?.dureePauseDejeunerMin ?? 90);
    setGroupes(item?.groupes ? [...item.groupes] : []);
    setPresences(item?.presences ? [...item.presences] : []);
  }, [item, open]);

  const updatePeriod = (index: number, key: 'dateDebut' | 'dateFin', value: string) => {
    setPresences((current) => current.map((period, i) => (i === index ? { ...period, [key]: value } : period)));
  };

  const generateHalfGroups = () => {
    const total = typeof effectif === 'number' && effectif > 0 ? effectif : 30;
    const g1 = Math.ceil(total / 2);
    const g2 = total - g1;
    setGroupes([
      { id: 1, nom: 'Groupe A', effectif: g1 },
      { id: 2, nom: 'Groupe B', effectif: g2 },
    ]);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSave({
      id: item?.id,
      nom: nom.trim(),
      effectif: effectif === '' ? undefined : effectif,
      heureDebutMin: heureDebutMin || '08:00',
      heureFinMax: heureFinMax || '18:00',
      maxHeuresParJour: maxHeuresParJour === '' ? undefined : maxHeuresParJour,
      dureePauseDejeunerMin: dureePauseDejeunerMin === '' ? undefined : dureePauseDejeunerMin,
      groupes,
      presences,
    });
  };

  return (
    <Modal
      open={open}
      size="lg"
      title={mode === 'create' ? 'Ajouter une classe' : 'Modifier la classe'}
      description="Définissez les effectifs, règles de journée d'élèves (amplitude, pause repas) et demi-groupes."
      onClose={onClose}
      onSubmit={submit}
      loading={loading}
      dangerAction={mode === 'edit' && item?.id ? { label: 'Supprimer', onClick: () => onDelete(item.id!) } : undefined}
    >
      <div className="form-grid">
        <div className="form-field">
          <label>Nom de la classe</label>
          <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex. 1ère Générale 1, BTS SIO" required />
        </div>
        <div className="form-field">
          <label>Effectif total (élèves)</label>
          <input
            type="number"
            min="1"
            value={effectif}
            onChange={(e) => setEffectif(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Ex. 32"
          />
        </div>

        <section className="form-section form-field--full">
          <p className="form-section__title">Contraintes de journée lycée & Pause méridienne</p>
          <div className="professeur-form__constraint-grid">
            <div className="form-field">
              <label>Début au plus tôt</label>
              <input type="time" value={heureDebutMin} onChange={(e) => setHeureDebutMin(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Fin au plus tard</label>
              <input type="time" value={heureFinMax} onChange={(e) => setHeureFinMax(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Max heures / jour</label>
              <input
                type="number"
                min="1"
                max="10"
                value={maxHeuresParJour}
                onChange={(e) => setMaxHeuresParJour(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
            <div className="form-field">
              <label>Pause repas min (min)</label>
              <input
                type="number"
                min="30"
                step="15"
                value={dureePauseDejeunerMin}
                onChange={(e) => setDureePauseDejeunerMin(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Ex. 90"
              />
            </div>
          </div>
        </section>

        <section className="form-section form-field--full">
          <div className="classe-form__period-header">
            <div>
              <p className="form-section__title">Demi-groupes (TP / Alignements)</p>
              <span className="form-helper">Permet la planification simultanée en demi-groupes (ex. SVT / Physique).</span>
            </div>
            <Button type="button" variant="secondary" onClick={generateHalfGroups} icon={<Plus size={13} />}>
              Générer 2 demi-groupes (A / B)
            </Button>
          </div>
          {groupes.length === 0 ? (
            <div className="classe-form__empty">Aucun demi-groupe configuré (classe entière).</div>
          ) : (
            <div className="form-subtle-list">
              {groupes.map((grp, index) => (
                <div className="form-subtle-row" key={grp.id ?? index}>
                  <input
                    value={grp.nom}
                    onChange={(e) =>
                      setGroupes((current) =>
                        current.map((g, i) => (i === index ? { ...g, nom: e.target.value } : g))
                      )
                    }
                    placeholder="Nom du groupe"
                  />
                  <input
                    type="number"
                    min="1"
                    value={grp.effectif}
                    onChange={(e) =>
                      setGroupes((current) =>
                        current.map((g, i) => (i === index ? { ...g, effectif: Number(e.target.value) } : g))
                      )
                    }
                    placeholder="Effectif"
                    style={{ width: '120px' }}
                  />
                  <Button
                    type="button"
                    variant="icon"
                    className="entity-table__action-delete"
                    onClick={() => setGroupes((current) => current.filter((_, i) => i !== index))}
                    icon={<Trash2 size={14} />}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="form-section form-field--full classe-form__periods">
          <div className="classe-form__period-header">
            <div>
              <p className="form-section__title">Périodes de présence</p>
              <span className="form-helper">Optionnel — utile pour les classes en alternance ou périodes bloquées.</span>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setPresences((current) => [...current, { dateDebut: '', dateFin: '' }])}
              icon={<Plus size={13} />}
            >
              Période
            </Button>
          </div>
          {presences.length === 0 ? (
            <div className="classe-form__empty">Aucune période définie.</div>
          ) : (
            <div className="form-subtle-list">
              {presences.map((period, index) => (
                <div className="form-subtle-row" key={period.id ?? index}>
                  <DatePicker
                    value={period.dateDebut}
                    onChange={(value) => updatePeriod(index, 'dateDebut', value)}
                    placeholder="Date de début"
                  />
                  <DatePicker
                    value={period.dateFin}
                    onChange={(value) => updatePeriod(index, 'dateFin', value)}
                    placeholder="Date de fin"
                  />
                  <Button
                    type="button"
                    variant="icon"
                    className="entity-table__action-delete"
                    onClick={() => setPresences((current) => current.filter((_, i) => i !== index))}
                    icon={<Trash2 size={14} />}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
}
