import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import type { Matiere } from '../../../matieres/types/matiere.types';
import type { PlageIndisponibilite, Professeur, ProfesseurDayOff, ProfesseurIndisponibilite } from '../../types/professeur.types';
import './ProfesseurForm.css';

interface Props { open: boolean; mode: 'create' | 'edit'; item: Professeur | null; matieres: Matiere[]; loading: boolean; onClose: () => void; onSave: (data: Professeur) => Promise<void>; onDelete: (id: number) => void; }

const weekDays = [
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
];

export function ProfesseurForm({ open, mode, item, matieres, loading, onClose, onSave, onDelete }: Props) {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [heures, setHeures] = useState(0);
  const [maxJour, setMaxJour] = useState<number | ''>('');
  const [maxSemaine, setMaxSemaine] = useState<number | ''>('');
  const [maxSeance, setMaxSeance] = useState<number | ''>('');
  const [plage, setPlage] = useState('');
  const [matiereIds, setMatiereIds] = useState<number[]>([]);
  const [batimentPrincipal, setBatimentPrincipal] = useState('Bâtiment A');
  const [pauseDejeunerRequise, setPauseDejeunerRequise] = useState(true);

  // Map of jourSemaine -> 'DISPO' | 'MATIN' | 'APRES_MIDI' | 'JOURNEE'
  const [dayAvailabilities, setDayAvailabilities] = useState<Record<number, 'DISPO' | PlageIndisponibilite>>({
    1: 'DISPO', 2: 'DISPO', 3: 'DISPO', 4: 'DISPO', 5: 'DISPO',
  });

  useEffect(() => {
    setNom(item?.nom ?? '');
    setPrenom(item?.prenom ?? '');
    setEmail(item?.email ?? '');
    setHeures(item?.nb_heures ?? 0);
    setMaxJour(item?.maxHeuresParJour ?? '');
    setMaxSemaine(item?.maxHeuresParSemaine ?? '');
    setMaxSeance(item?.maxHeuresParSeance ?? '');
    setPlage(item?.plageHorairePreferee?.libelle ?? '');
    setMatiereIds(item?.matieres?.flatMap((matiere) => (matiere.id ? [matiere.id] : [])) ?? []);
    setBatimentPrincipal(item?.batimentPrincipal ?? 'Bâtiment A');
    setPauseDejeunerRequise(item?.pauseDejeunerRequise ?? true);

    const initialMap: Record<number, 'DISPO' | PlageIndisponibilite> = {
      1: 'DISPO', 2: 'DISPO', 3: 'DISPO', 4: 'DISPO', 5: 'DISPO',
    };

    if (item?.indisponibilites && item.indisponibilites.length > 0) {
      item.indisponibilites.forEach((indispo) => {
        initialMap[indispo.jourSemaine] = indispo.plage;
      });
    } else if (item?.daysOff && item.daysOff.length > 0) {
      item.daysOff.forEach((day) => {
        initialMap[day.jourSemaine] = 'JOURNEE';
      });
    }
    setDayAvailabilities(initialMap);
  }, [item, open]);

  const toggleMatiere = (id: number) => {
    setMatiereIds((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]));
  };

  const setDayStatus = (jourSemaine: number, status: 'DISPO' | PlageIndisponibilite) => {
    setDayAvailabilities((prev) => ({ ...prev, [jourSemaine]: status }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const indisponibilites: ProfesseurIndisponibilite[] = [];
    const daysOff: ProfesseurDayOff[] = [];

    weekDays.forEach((d) => {
      const status = dayAvailabilities[d.value];
      if (status && status !== 'DISPO') {
        indisponibilites.push({
          jourSemaine: d.value,
          plage: status,
          motif: 'Vœu enseignant',
        });
        if (status === 'JOURNEE') {
          daysOff.push({ jourSemaine: d.value });
        }
      }
    });

    void onSave({
      id: item?.id,
      nom: nom.trim(),
      prenom: prenom.trim(),
      email: email.trim(),
      nb_heures: heures,
      maxHeuresParJour: maxJour === '' ? undefined : maxJour,
      maxHeuresParSemaine: maxSemaine === '' ? undefined : maxSemaine,
      maxHeuresParSeance: maxSeance === '' ? undefined : maxSeance,
      plageHorairePreferee: plage.trim() ? { libelle: plage.trim() } : null,
      batimentPrincipal: batimentPrincipal.trim() || undefined,
      pauseDejeunerRequise,
      indisponibilites,
      daysOff,
      matieres: matieres.filter((matiere) => matiere.id && matiereIds.includes(matiere.id)),
      seances: item?.seances ?? [],
    });
  };

  return (
    <Modal
      open={open}
      size="lg"
      title={mode === 'create' ? 'Ajouter un professeur' : 'Modifier le professeur'}
      description="Charge d'enseignement, localisation (bâtiment), pause repas et indisponibilités fines par demi-journée."
      onClose={onClose}
      onSubmit={submit}
      loading={loading}
      dangerAction={mode === 'edit' && item?.id ? { label: 'Supprimer', onClick: () => onDelete(item.id!) } : undefined}
    >
      <div className="form-grid">
        <div className="form-field">
          <label>Nom</label>
          <input value={nom} onChange={(e) => setNom(e.target.value)} required />
        </div>
        <div className="form-field">
          <label>Prénom</label>
          <input value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
        </div>
        <div className="form-field form-field--full">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-field">
          <label>Volume horaire total</label>
          <input type="number" min="0" value={heures} onChange={(e) => setHeures(Number(e.target.value))} />
        </div>
        <div className="form-field">
          <label>Bâtiment principal</label>
          <input
            value={batimentPrincipal}
            onChange={(e) => setBatimentPrincipal(e.target.value)}
            placeholder="Ex. Bâtiment A, Sciences"
            list="prof-batiments"
          />
          <datalist id="prof-batiments">
            <option value="Bâtiment A" />
            <option value="Bâtiment B" />
            <option value="Bâtiment Sciences" />
            <option value="Gymnase" />
          </datalist>
        </div>

        <div className="form-field form-field--full">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={pauseDejeunerRequise}
              onChange={(e) => setPauseDejeunerRequise(e.target.checked)}
              style={{ width: 'auto' }}
            />
            <span>Garantir une pause repas méridienne (au moins 1h libre entre 11h30 et 14h)</span>
          </label>
        </div>

        <section className="form-section professeur-form__constraints">
          <p className="form-section__title">Contraintes horaires</p>
          <div className="professeur-form__constraint-grid">
            <div className="form-field">
              <label>Max / jour</label>
              <input
                type="number"
                min="0"
                value={maxJour}
                onChange={(e) => setMaxJour(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
            <div className="form-field">
              <label>Max / semaine</label>
              <input
                type="number"
                min="0"
                value={maxSemaine}
                onChange={(e) => setMaxSemaine(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
            <div className="form-field">
              <label>Max / séance</label>
              <input
                type="number"
                min="0"
                value={maxSeance}
                onChange={(e) => setMaxSeance(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
          </div>
        </section>

        <section className="form-section form-field--full">
          <p className="form-section__title">Indisponibilités hebdomadaires (demi-journées & jours)</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
            {weekDays.map((d) => (
              <div key={d.value} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{d.label}</span>
                <select
                  value={dayAvailabilities[d.value] || 'DISPO'}
                  onChange={(e) => setDayStatus(d.value, e.target.value as 'DISPO' | PlageIndisponibilite)}
                  style={{
                    backgroundColor:
                      dayAvailabilities[d.value] === 'JOURNEE'
                        ? 'rgba(239, 68, 68, 0.15)'
                        : dayAvailabilities[d.value] !== 'DISPO'
                        ? 'rgba(245, 158, 11, 0.15)'
                        : undefined,
                  }}
                >
                  <option value="DISPO">Disponible</option>
                  <option value="MATIN">Matin indispo</option>
                  <option value="APRES_MIDI">Après-midi indispo</option>
                  <option value="JOURNEE">Journée indispo</option>
                </select>
              </div>
            ))}
          </div>
        </section>

        <section className="form-section form-field--full">
          <p className="form-section__title">Matières enseignées</p>
          <div className="form-chip-grid">
            {matieres.map((matiere) =>
              matiere.id ? (
                <button
                  key={matiere.id}
                  type="button"
                  className={`form-chip${matiereIds.includes(matiere.id) ? ' is-selected' : ''}`}
                  onClick={() => toggleMatiere(matiere.id!)}
                >
                  {matiere.nom}
                </button>
              ) : null
            )}
          </div>
        </section>
      </div>
    </Modal>
  );
}
