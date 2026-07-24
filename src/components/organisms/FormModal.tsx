import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Button } from '../atoms/Button';
import type { Tab } from './Sidebar';
import type { Professeur, Eleve, Classe, Matiere, Salle, Seance, ProfesseurDayOff, Creneau, MatiereClasseConfig } from '../../services/api';

interface FormModalProps {
  modalType: 'create' | 'edit';
  modalEntity: Tab;
  selectedItem: any;
  loading: boolean;
  classes: Classe[];
  professeurs: Professeur[];
  matieres: Matiere[];
  salles: Salle[];
  onClose: () => void;
  onDelete: (entity: Tab, id: number) => void;
  onSave: (
    payload: any, 
    associationIds?: {
      professeurId?: number;
      classeId?: number;
      matiereId?: number;
      salleId?: number;
    }
  ) => Promise<void>;
}

export const FormModal: React.FC<FormModalProps> = ({
  modalType,
  modalEntity,
  selectedItem,
  loading,
  classes,
  professeurs,
  matieres,
  salles,
  onClose,
  onDelete,
  onSave
}) => {
  // Professeur Form States
  const [profNom, setProfNom] = useState('');
  const [profPrenom, setProfPrenom] = useState('');
  const [profEmail, setProfEmail] = useState('');
  const [profHeures, setProfHeures] = useState(0);
  const [profMaxJour, setProfMaxJour] = useState<number | ''>('');
  const [profMaxSemaine, setProfMaxSemaine] = useState<number | ''>('');
  const [profMaxSeance, setProfMaxSeance] = useState<number | ''>('');
  const [profPlage, setProfPlage] = useState('');
  const [profMatiereIds, setProfMatiereIds] = useState<number[]>([]);
  const [profDaysOff, setProfDaysOff] = useState<ProfesseurDayOff[]>([]);

  // Eleve Form States
  const [eleveNom, setEleveNom] = useState('');
  const [elevePrenom, setElevePrenom] = useState('');
  const [eleveClasseId, setEleveClasseId] = useState<number | ''>('');

  // Classe Form States
  const [classeNom, setClasseNom] = useState('');

  // Matiere Form States
  const [matiereNom, setMatiereNom] = useState('');
  const [matiereVolume, setMatiereVolume] = useState(0);

  // Salle Form States
  const [salleCode, setSalleCode] = useState('');
  const [salleCapacite, setSalleCapacite] = useState(0);
  const [salleType, setSalleType] = useState('Cours');

  // Seance Form States
  const [seanceDebut, setSeanceDebut] = useState('');
  const [seanceFin, setSeanceFin] = useState('');
  const [seanceProfId, setSeanceProfId] = useState<number | ''>('');
  const [seanceClasseId, setSeanceClasseId] = useState<number | ''>('');
  const [seanceMatiereId, setSeanceMatiereId] = useState<number | ''>('');
  const [seanceSalleId, setSeanceSalleId] = useState<number | ''>('');

  // Creneau Form States
  const [creneauDebut, setCreneauDebut] = useState('08:00');
  const [creneauFin, setCreneauFin] = useState('10:00');

  // MatiereClasseConfig Form States
  const [configClasseId, setConfigClasseId] = useState<number | ''>('');
  const [configMatiereId, setConfigMatiereId] = useState<number | ''>('');
  const [configDateDebut, setConfigDateDebut] = useState('');
  const [configDateFin, setConfigDateFin] = useState('');

  // Initialize or Reset Fields
  useEffect(() => {
    if (modalType === 'edit' && selectedItem) {
      if (modalEntity === 'professeurs') {
        setProfNom(selectedItem.nom || '');
        setProfPrenom(selectedItem.prenom || '');
        setProfEmail(selectedItem.email || '');
        setProfHeures(selectedItem.nb_heures || 0);
        setProfMaxJour(selectedItem.maxHeuresParJour ?? '');
        setProfMaxSemaine(selectedItem.maxHeuresParSemaine ?? '');
        setProfMaxSeance(selectedItem.maxHeuresParSeance ?? '');
        setProfPlage(selectedItem.plageHorairePreferee?.libelle || '');
        setProfMatiereIds(selectedItem.matieres ? selectedItem.matieres.map((m: Matiere) => m.id!).filter(Boolean) : []);
        setProfDaysOff(selectedItem.daysOff || []);
      } else if (modalEntity === 'eleves') {
        setEleveNom(selectedItem.nom || '');
        setElevePrenom(selectedItem.prenom || '');
        setEleveClasseId(selectedItem.classeId || '');
      } else if (modalEntity === 'classes') {
        setClasseNom(selectedItem.nom || '');
      } else if (modalEntity === 'matieres') {
        setMatiereNom(selectedItem.nom || '');
        setMatiereVolume(selectedItem.volumeHoraireAnnuel || 0);
      } else if (modalEntity === 'salles') {
        setSalleCode(selectedItem.code || '');
        setSalleCapacite(selectedItem.capacite || 0);
        setSalleType(selectedItem.type || 'Cours');
      } else if (modalEntity === 'dashboard') {
        setSeanceDebut(selectedItem.debut ? selectedItem.debut.slice(0, 16) : '');
        setSeanceFin(selectedItem.fin ? selectedItem.fin.slice(0, 16) : '');
        
        const matchedProf = professeurs.find(p => `${p.prenom} ${p.nom}` === selectedItem.professeurNomComplet);
        setSeanceProfId(matchedProf?.id || '');

        const matchedClasse = classes.find(c => c.nom === selectedItem.classeNom);
        setSeanceClasseId(matchedClasse?.id || '');

        const matchedMatiere = matieres.find(m => m.nom === selectedItem.matiereNom);
        setSeanceMatiereId(matchedMatiere?.id || '');

        const matchedSalle = salles.find(s => s.code === selectedItem.salleCode);
        setSeanceSalleId(matchedSalle?.id || '');
      } else if (modalEntity === 'creneaux') {
        setCreneauDebut(selectedItem.debut || '08:00');
        setCreneauFin(selectedItem.fin || '10:00');
      } else if (modalEntity === 'configs') {
        setConfigClasseId(selectedItem.classeId || '');
        setConfigMatiereId(selectedItem.matiereId || '');
        setConfigDateDebut(selectedItem.dateDebut || '');
        setConfigDateFin(selectedItem.dateFin || '');
      }
    } else {
      // Create / reset
      setProfNom('');
      setProfPrenom('');
      setProfEmail('');
      setProfHeures(0);
      setProfMaxJour('');
      setProfMaxSemaine('');
      setProfMaxSeance('');
      setProfPlage('');
      setProfMatiereIds([]);
      setProfDaysOff([]);

      setEleveNom('');
      setElevePrenom('');
      setEleveClasseId('');

      setClasseNom('');

      setMatiereNom('');
      setMatiereVolume(0);

      setSalleCode('');
      setSalleCapacite(0);
      setSalleType('Cours');

      setCreneauDebut('08:00');
      setCreneauFin('10:00');

      // Default current time formatted to ISO minus seconds/ms
      const now = new Date();
      now.setMinutes(0, 0, 0);
      const offset = now.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(now.getTime() - offset)).toISOString().slice(0, 16);
      
      const finishTime = new Date(now.getTime() - offset + 2 * 3600000); // +2 hours
      const localISOFinishTime = finishTime.toISOString().slice(0, 16);

      setSeanceDebut(localISOTime);
      setSeanceFin(localISOFinishTime);
      setSeanceProfId('');
      setSeanceClasseId('');
      setSeanceMatiereId('');
      setSeanceSalleId('');

      setConfigClasseId('');
      setConfigMatiereId('');
      setConfigDateDebut('');
      setConfigDateFin('');
    }
  }, [modalType, modalEntity, selectedItem, professeurs, classes, matieres, salles]);

  const DAYS_OF_WEEK = [
    { num: 1, label: 'Lundi' },
    { num: 2, label: 'Mardi' },
    { num: 3, label: 'Mercredi' },
    { num: 4, label: 'Jeudi' },
    { num: 5, label: 'Vendredi' }
  ];

  const handleToggleDayOff = (jourSemaine: number) => {
    setProfDaysOff(prev => {
      const exists = prev.some(d => d.jourSemaine === jourSemaine);
      if (exists) {
        return prev.filter(d => d.jourSemaine !== jourSemaine);
      } else {
        return [...prev, { jourSemaine }];
      }
    });
  };

  const handleToggleMatiere = (matiereId: number) => {
    setProfMatiereIds(prev => 
      prev.includes(matiereId) 
        ? prev.filter(id => id !== matiereId)
        : [...prev, matiereId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalEntity === 'professeurs') {
      const selectedMatieresObjects = matieres.filter(m => m.id && profMatiereIds.includes(m.id));
      const payload: Professeur = {
        id: selectedItem?.id,
        nom: profNom,
        prenom: profPrenom,
        email: profEmail,
        nb_heures: Number(profHeures),
        maxHeuresParJour: profMaxJour !== '' ? Number(profMaxJour) : undefined,
        maxHeuresParSemaine: profMaxSemaine !== '' ? Number(profMaxSemaine) : undefined,
        maxHeuresParSeance: profMaxSeance !== '' ? Number(profMaxSeance) : undefined,
        plageHorairePreferee: profPlage ? { libelle: profPlage } : null,
        matieres: selectedMatieresObjects,
        daysOff: profDaysOff,
        seances: selectedItem?.seances || []
      };
      onSave(payload);
    } else if (modalEntity === 'eleves') {
      const payload: Eleve = {
        id: selectedItem?.id,
        nom: eleveNom,
        prenom: elevePrenom
      };
      onSave(payload, { classeId: eleveClasseId ? Number(eleveClasseId) : undefined });
    } else if (modalEntity === 'classes') {
      const payload: Classe = {
        id: selectedItem?.id,
        nom: classeNom
      };
      onSave(payload);
    } else if (modalEntity === 'matieres') {
      const payload: Matiere = {
        id: selectedItem?.id,
        nom: matiereNom,
        volumeHoraireAnnuel: matiereVolume
      };
      onSave(payload);
    } else if (modalEntity === 'salles') {
      const payload: Salle = {
        id: selectedItem?.id,
        code: salleCode,
        capacite: salleCapacite,
        type: salleType
      };
      onSave(payload);
    } else if (modalEntity === 'dashboard') {
      const payload: Seance = {
        id: selectedItem?.id,
        debut: seanceDebut,
        fin: seanceFin
      };
      onSave(payload, {
        professeurId: seanceProfId ? Number(seanceProfId) : undefined,
        classeId: seanceClasseId ? Number(seanceClasseId) : undefined,
        matiereId: seanceMatiereId ? Number(seanceMatiereId) : undefined,
        salleId: seanceSalleId ? Number(seanceSalleId) : undefined
      });
    } else if (modalEntity === 'creneaux') {
      const payload: Creneau = {
        id: selectedItem?.id,
        debut: creneauDebut.length === 5 ? `${creneauDebut}:00` : creneauDebut,
        fin: creneauFin.length === 5 ? `${creneauFin}:00` : creneauFin,
      };
      onSave(payload);
    } else if (modalEntity === 'configs') {
      const payload: MatiereClasseConfig = {
        id: selectedItem?.id,
        classeId: configClasseId ? Number(configClasseId) : undefined,
        matiereId: configMatiereId ? Number(configMatiereId) : undefined,
        dateDebut: configDateDebut || null,
        dateFin: configDateFin || null,
      };
      onSave(payload);
    }
  };

  const getModalTitle = () => {
    const action = modalType === 'create' ? 'Ajouter' : 'Modifier';
    switch (modalEntity) {
      case 'dashboard': return `${action} : Séance de cours`;
      case 'professeurs': return `${action} : Professeur`;
      case 'classes': return `${action} : Classe`;
      case 'eleves': return `${action} : Élève`;
      case 'matieres': return `${action} : Matière`;
      case 'salles': return `${action} : Salle`;
      case 'creneaux': return `${action} : Créneau Horaire`;
      case 'configs': return `${action} : Config. Matière`;
      default: return '';
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: modalEntity === 'professeurs' ? '650px' : '500px' }}>
        <div className="modal-header">
          <h2>{getModalTitle()}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* PROFESSEUR FORM FIELDS */}
          {modalEntity === 'professeurs' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Nom</label>
                  <input type="text" className="form-control" value={profNom} onChange={e => setProfNom(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Prénom</label>
                  <input type="text" className="form-control" value={profPrenom} onChange={e => setProfPrenom(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input type="email" className="form-control" value={profEmail} onChange={e => setProfEmail(e.target.value)} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Volume d'heures (Total)</label>
                  <input type="number" step="0.5" className="form-control" value={profHeures} onChange={e => setProfHeures(Number(e.target.value))} required />
                </div>
                <div className="form-group">
                  <label>Max heures / jour</label>
                  <input type="number" step="0.5" className="form-control" placeholder="ex: 6" value={profMaxJour} onChange={e => setProfMaxJour(e.target.value ? Number(e.target.value) : '')} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Max heures / semaine</label>
                  <input type="number" step="0.5" className="form-control" placeholder="ex: 35" value={profMaxSemaine} onChange={e => setProfMaxSemaine(e.target.value ? Number(e.target.value) : '')} />
                </div>
                <div className="form-group">
                  <label>Max heures / séance</label>
                  <input type="number" step="0.5" className="form-control" placeholder="ex: 2" value={profMaxSeance} onChange={e => setProfMaxSeance(e.target.value ? Number(e.target.value) : '')} />
                </div>
              </div>

              <div className="form-group">
                <label>Plage Horaire Préférée (libellé)</label>
                <input type="text" className="form-control" placeholder="ex: Lundi Matin, Mardi 8h-10h" value={profPlage} onChange={e => setProfPlage(e.target.value)} />
              </div>

              {/* MATIERES ENSEIGNEES */}
              <div className="form-group">
                <label>Matières Enseignées</label>
                {matieres.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Aucune matière créée pour le moment.</p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                    {matieres.map(m => {
                      const isSelected = m.id ? profMatiereIds.includes(m.id) : false;
                      return (
                        <button
                          type="button"
                          key={m.id}
                          onClick={() => m.id && handleToggleMatiere(m.id)}
                          style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: '20px',
                            border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                            backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-main)',
                            color: isSelected ? 'white' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            transition: 'all 0.2s'
                          }}
                        >
                          {isSelected ? '✓ ' : '+ '}{m.nom}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* DAYS OFF / CONGES (1-5) */}
              <div className="form-group">
                <label>Jours de non-travail (Days Off)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                  {DAYS_OF_WEEK.map(day => {
                    const isOff = profDaysOff.some(d => d.jourSemaine === day.num);
                    return (
                      <button
                        type="button"
                        key={day.num}
                        onClick={() => handleToggleDayOff(day.num)}
                        style={{
                          padding: '0.4rem 0.8rem',
                          borderRadius: '20px',
                          border: `1px solid ${isOff ? 'var(--danger)' : 'var(--border-color)'}`,
                          backgroundColor: isOff ? 'var(--danger-light)' : 'var(--bg-main)',
                          color: isOff ? '#f87171' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: isOff ? 600 : 400,
                          transition: 'all 0.2s'
                        }}
                      >
                        {isOff ? '🚫 ' : '🗓️ '}{day.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ELEVE FORM FIELDS */}
          {modalEntity === 'eleves' && (
            <>
              <div className="form-group">
                <label>Nom</label>
                <input type="text" className="form-control" value={eleveNom} onChange={e => setEleveNom(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Prénom</label>
                <input type="text" className="form-control" value={elevePrenom} onChange={e => setElevePrenom(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Classe (Association)</label>
                <select 
                  className="form-control" 
                  value={eleveClasseId} 
                  onChange={e => setEleveClasseId(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">-- Sans classe --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.nom}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* CLASSE FORM FIELDS */}
          {modalEntity === 'classes' && (
            <div className="form-group">
              <label>Nom de la classe</label>
              <input type="text" className="form-control" placeholder="ex: Terminale S1" value={classeNom} onChange={e => setClasseNom(e.target.value)} required />
            </div>
          )}

          {/* MATIERE FORM FIELDS */}
          {modalEntity === 'matieres' && (
            <>
              <div className="form-group">
                <label>Nom de la matière</label>
                <input type="text" className="form-control" value={matiereNom} onChange={e => setMatiereNom(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Volume Horaire Annuel (heures)</label>
                <input type="number" className="form-control" value={matiereVolume} onChange={e => setMatiereVolume(Number(e.target.value))} required />
              </div>
            </>
          )}

          {/* SALLE FORM FIELDS */}
          {modalEntity === 'salles' && (
            <>
              <div className="form-group">
                <label>Code de la salle</label>
                <input type="text" className="form-control" placeholder="ex: B201" value={salleCode} onChange={e => setSalleCode(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Capacité d'accueil</label>
                <input type="number" className="form-control" value={salleCapacite} onChange={e => setSalleCapacite(Number(e.target.value))} required />
              </div>
              <div className="form-group">
                <label>Type de salle</label>
                <select className="form-control" value={salleType} onChange={e => setSalleType(e.target.value)}>
                  <option value="Cours">Cours standard</option>
                  <option value="TP">Travaux Pratiques (TP)</option>
                  <option value="Amphithéâtre">Amphithéâtre</option>
                  <option value="Informatique">Salle Informatique</option>
                </select>
              </div>
            </>
          )}

          {/* SEANCE FORM FIELDS */}
          {modalEntity === 'dashboard' && (
            <>
              <div className="form-group">
                <label>Début de la séance</label>
                <input type="datetime-local" className="form-control" value={seanceDebut} onChange={e => setSeanceDebut(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Fin de la séance</label>
                <input type="datetime-local" className="form-control" value={seanceFin} onChange={e => setSeanceFin(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Professeur</label>
                <select className="form-control" value={seanceProfId} onChange={e => setSeanceProfId(e.target.value ? Number(e.target.value) : '')} required>
                  <option value="">-- Sélectionner un enseignant --</option>
                  {professeurs.map(p => (
                    <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Classe</label>
                <select className="form-control" value={seanceClasseId} onChange={e => setSeanceClasseId(e.target.value ? Number(e.target.value) : '')} required>
                  <option value="">-- Sélectionner une classe --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.nom}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Matière</label>
                <select className="form-control" value={seanceMatiereId} onChange={e => setSeanceMatiereId(e.target.value ? Number(e.target.value) : '')} required>
                  <option value="">-- Sélectionner la matière --</option>
                  {matieres.map(m => (
                    <option key={m.id} value={m.id}>{m.nom}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Salle de classe</label>
                <select className="form-control" value={seanceSalleId} onChange={e => setSeanceSalleId(e.target.value ? Number(e.target.value) : '')} required>
                  <option value="">-- Sélectionner une salle --</option>
                  {salles.map(s => (
                    <option key={s.id} value={s.id}>{s.code} ({s.type})</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* CRENEAU FORM FIELDS */}
          {modalEntity === 'creneaux' && (
            <>
              <div className="form-group">
                <label>Heure de début (LocalTime)</label>
                <input 
                  type="time" 
                  step="1" 
                  className="form-control" 
                  value={creneauDebut} 
                  onChange={e => setCreneauDebut(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Heure de fin (LocalTime)</label>
                <input 
                  type="time" 
                  step="1" 
                  className="form-control" 
                  value={creneauFin} 
                  onChange={e => setCreneauFin(e.target.value)} 
                  required 
                />
              </div>
            </>
          )}

          {/* CONFIGS FORM FIELDS */}
          {modalEntity === 'configs' && (
            <>
              <div className="form-group">
                <label>Classe</label>
                <select 
                  className="form-control" 
                  value={configClasseId} 
                  onChange={e => setConfigClasseId(e.target.value ? Number(e.target.value) : '')} 
                  required
                >
                  <option value="">-- Sélectionner une classe --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.nom}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Matière</label>
                <select 
                  className="form-control" 
                  value={configMatiereId} 
                  onChange={e => setConfigMatiereId(e.target.value ? Number(e.target.value) : '')} 
                  required
                >
                  <option value="">-- Sélectionner la matière --</option>
                  {matieres.map(m => (
                    <option key={m.id} value={m.id}>{m.nom}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date de Début (Optionnel)</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={configDateDebut} 
                  onChange={e => setConfigDateDebut(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label>Date de Fin (Optionnel)</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={configDateFin} 
                  onChange={e => setConfigDateFin(e.target.value)} 
                />
              </div>
            </>
          )}

          <div className="form-actions">
            {modalType === 'edit' && (
              <button 
                type="button" 
                className="btn-secondary" 
                style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderColor: 'transparent', marginRight: 'auto' }}
                onClick={() => selectedItem?.id && onDelete(modalEntity, selectedItem.id)}
              >
                <Trash2 size={16} /> Supprimer
              </button>
            )}
            <Button type="button" variant="secondary" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              Enregistrer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
