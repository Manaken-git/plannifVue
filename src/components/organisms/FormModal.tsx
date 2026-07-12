import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Button } from '../atoms/Button';
import type { Tab } from './Sidebar';
import type { Professeur, Eleve, Classe, Matiere, Salle, Seance } from '../../services/api';

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
  const [profPlage, setProfPlage] = useState('');

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

  // Initialize or Reset Fields
  useEffect(() => {
    if (modalType === 'edit' && selectedItem) {
      if (modalEntity === 'professeurs') {
        setProfNom(selectedItem.nom || '');
        setProfPrenom(selectedItem.prenom || '');
        setProfEmail(selectedItem.email || '');
        setProfHeures(selectedItem.nb_heures || 0);
        setProfPlage(selectedItem.plageHorairePreferee?.libelle || '');
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
      }
    } else {
      // Create / reset
      setProfNom('');
      setProfPrenom('');
      setProfEmail('');
      setProfHeures(0);
      setProfPlage('');

      setEleveNom('');
      setElevePrenom('');
      setEleveClasseId('');

      setClasseNom('');

      setMatiereNom('');
      setMatiereVolume(0);

      setSalleCode('');
      setSalleCapacite(0);
      setSalleType('Cours');

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
    }
  }, [modalType, modalEntity, selectedItem, professeurs, classes, matieres, salles]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalEntity === 'professeurs') {
      const payload: Professeur = {
        id: selectedItem?.id,
        nom: profNom,
        prenom: profPrenom,
        email: profEmail,
        nb_heures: profHeures,
        plageHorairePreferee: profPlage ? { libelle: profPlage } : null
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
      default: return '';
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
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
              <div className="form-group">
                <label>Nom</label>
                <input type="text" className="form-control" value={profNom} onChange={e => setProfNom(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Prénom</label>
                <input type="text" className="form-control" value={profPrenom} onChange={e => setProfPrenom(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" className="form-control" value={profEmail} onChange={e => setProfEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Volume d'heures</label>
                <input type="number" className="form-control" value={profHeures} onChange={e => setProfHeures(Number(e.target.value))} required />
              </div>
              <div className="form-group">
                <label>Plage Horaire Préférée (libellé)</label>
                <input type="text" className="form-control" placeholder="ex: Lundi Matin, Mardi 8h-10h" value={profPlage} onChange={e => setProfPlage(e.target.value)} />
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
