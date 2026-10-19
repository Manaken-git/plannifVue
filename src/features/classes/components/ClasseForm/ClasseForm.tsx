import { Plus, Trash2, UserCheck } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '../../../../shared/ui/Button/Button';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import { DatePicker } from '../../../../shared/ui/DatePicker/DatePicker';
import { Badge } from '../../../../shared/ui/Badge/Badge';
import type { Classe, ClasseGroupe, ClassePresence, ClasseReferent, RoleReferent } from '../../types/classe.types';
import type { Professeur } from '../../../professeurs/types/professeur.types';
import './ClasseForm.css';

interface Props {
  open: boolean;
  mode: 'create' | 'edit';
  item: Classe | null;
  loading: boolean;
  professeurs?: Professeur[];
  onClose: () => void;
  onSave: (data: Classe) => Promise<void>;
  onDelete: (id: number) => void;
}

export function ClasseForm({ open, mode, item, loading, professeurs = [], onClose, onSave, onDelete }: Props) {
  const [nom, setNom] = useState('');
  const [effectif, setEffectif] = useState<number | ''>(30);
  const [heureDebutMin, setHeureDebutMin] = useState('08:00');
  const [heureFinMax, setHeureFinMax] = useState('18:00');
  const [maxHeuresParJour, setMaxHeuresParJour] = useState<number | ''>(7);
  const [dureePauseDejeunerMin, setDureePauseDejeunerMin] = useState<number | ''>(90);
  const [groupes, setGroupes] = useState<ClasseGroupe[]>([]);
  const [presences, setPresences] = useState<ClassePresence[]>([]);
  const [referents, setReferents] = useState<ClasseReferent[]>([]);
  const [selectedProfId, setSelectedProfId] = useState<number | ''>('');
  const [selectedRole, setSelectedRole] = useState<RoleReferent>('PRINCIPAL');

  useEffect(() => {
    setNom(item?.nom ?? '');
    setEffectif(item?.effectif ?? 30);
    setHeureDebutMin(item?.heureDebutMin ?? '08:00');
    setHeureFinMax(item?.heureFinMax ?? '18:00');
    setMaxHeuresParJour(item?.maxHeuresParJour ?? 7);
    setDureePauseDejeunerMin(item?.pauseDejeunerDureeMin ?? item?.dureePauseDejeunerMin ?? 90);
    setGroupes(item?.groupes ? [...item.groupes] : []);
    setPresences(item?.presences ? [...item.presences] : []);
    setReferents(item?.referents ? [...item.referents] : []);
    setSelectedProfId('');
    setSelectedRole('PRINCIPAL');
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

  const addReferent = () => {
    if (selectedProfId === '') return;
    const prof = professeurs.find((p) => p.id === Number(selectedProfId));
    if (!prof) return;

    setReferents((current) => [
      ...current,
      {
        professeurId: prof.id!,
        professeurNom: prof.nom,
        professeurPrenom: prof.prenom,
        role: selectedRole,
      },
    ]);
    setSelectedProfId('');
    setSelectedRole('PRINCIPAL');
  };

  const removeReferent = (profId: number) => {
    setReferents((current) => current.filter((r) => r.professeurId !== profId));
  };

  const availableProfesseurs = professeurs.filter(
    (p) => !referents.some((r) => r.professeurId === p.id)
  );

  const roleLabel = (role: RoleReferent) => {
    switch (role) {
      case 'PRINCIPAL':
        return 'Prof Principal';
      case 'CO_REFERENT':
        return 'Co-référent';
      case 'TUTEUR_ENTREPRISE':
        return 'Tuteur Entreprise';
      default:
        return role;
    }
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
      pauseDejeunerDebutMin: '11:30',
      pauseDejeunerFinMax: '14:00',
      pauseDejeunerDureeMin: dureePauseDejeunerMin === '' ? undefined : Number(dureePauseDejeunerMin),
      dureePauseDejeunerMin: dureePauseDejeunerMin === '' ? undefined : Number(dureePauseDejeunerMin),
      groupes,
      presences,
      referents,
    });
  };

  return (
    <Modal
      open={open}
      size="lg"
      title={mode === 'create' ? 'Ajouter une classe' : 'Modifier la classe'}
      description="Définissez les effectifs, règles de journée d'élèves, professeurs référents et demi-groupes."
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

        {/* SECTION PROFESSEURS RÉFÉRENTS (Option B.2) */}
        <section className="form-section form-field--full">
          <div className="classe-form__period-header">
            <div>
              <p className="form-section__title">👥 Professeurs Référents (Vie de classe & Suivi)</p>
              <span className="form-helper">
                Associez les professeurs principaux ou tuteurs qui encadrent cette classe.
              </span>
            </div>
          </div>

          {referents.length === 0 ? (
            <div className="classe-form__empty">Aucun professeur référent assigné.</div>
          ) : (
            <div className="form-subtle-list">
              {referents.map((ref) => (
                <div className="form-subtle-row" key={ref.professeurId}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <UserCheck size={15} style={{ color: '#2563eb' }} />
                    <span style={{ fontWeight: 600 }}>
                      {ref.professeurPrenom ? ref.professeurPrenom + ' ' : ''}
                      {ref.professeurNom || 'Prof #' + ref.professeurId}
                    </span>
                    <Badge tone={ref.role === 'PRINCIPAL' ? 'primary' : ref.role === 'CO_REFERENT' ? 'warning' : 'success'}>
                      {roleLabel(ref.role)}
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant="icon"
                    className="entity-table__action-delete"
                    onClick={() => removeReferent(ref.professeurId)}
                    icon={<Trash2 size={14} />}
                    title="Retirer ce référent"
                  />
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
            <select
              style={{ flex: 1, minWidth: '180px', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}
              value={selectedProfId}
              onChange={(e) => setSelectedProfId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">Sélectionner un enseignant...</option>
              {availableProfesseurs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.prenom ? p.prenom + ' ' : ''}{p.nom}
                </option>
              ))}
            </select>

            <select
              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as RoleReferent)}
            >
              <option value="PRINCIPAL">Professeur Principal</option>
              <option value="CO_REFERENT">Co-référent</option>
              <option value="TUTEUR_ENTREPRISE">Tuteur Entreprise</option>
            </select>

            <Button
              type="button"
              variant="secondary"
              onClick={addReferent}
              disabled={selectedProfId === ''}
              icon={<Plus size={13} />}
            >
              Ajouter
            </Button>
          </div>
        </section>

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
