import React, { useState, useEffect } from 'react';
import { Seance, Professeur, Classe, Matiere, Salle, Creneau } from '../types/model';
import { FormField, Select } from '../components/common/FormControls';
import { usePlanning } from '../context/PlanningContext';

interface SeanceFormProps {
  initialData?: Seance;
  onSubmit: (data: Seance) => void;
}

const TYPE_OPTIONS = [
  { value: 'COURS', label: 'Cours Magistral (COURS)' },
  { value: 'TP', label: 'Travaux Pratiques (TP)' },
  { value: 'EXAMEN', label: 'Examen (EXAMEN)' },
];

export function SeanceForm({ initialData, onSubmit }: SeanceFormProps) {
  const { professeurs, classes, matieres, salles, creneaux } = usePlanning();
  
  const [classeId, setClasseId] = useState<string | number>('');
  const [matiereId, setMatiereId] = useState<string | number>('');
  const [type, setType] = useState<'COURS' | 'TP' | 'EXAMEN'>('COURS');
  const [professeurId, setProfesseurId] = useState<string | number>('');
  const [salleId, setSalleId] = useState<string | number>('');
  const [creneauId, setCreneauId] = useState<string | number>('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setClasseId(initialData.classe?.id || '');
      setMatiereId(initialData.matiere?.id || '');
      setType(initialData.type || 'COURS');
      setProfesseurId(initialData.professeur?.id || '');
      setSalleId(initialData.salle?.id || '');
      setCreneauId(initialData.creneau?.id || '');
    } else {
      setClasseId('');
      setMatiereId('');
      setType('COURS');
      setProfesseurId('');
      setSalleId('');
      setCreneauId('');
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!classeId) newErrors.classeId = 'La classe est obligatoire';
    if (!matiereId) newErrors.matiereId = 'La matière est obligatoire';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const selectedClasse = classes.find((c) => c.id === Number(classeId));
      const selectedMatiere = matieres.find((m) => m.id === Number(matiereId));
      const selectedProfesseur = professeurs.find((p) => p.id === Number(professeurId));
      const selectedSalle = salles.find((s) => s.id === Number(salleId));
      const selectedCreneau = creneaux.find((cr) => cr.id === Number(creneauId));

      onSubmit({
        id: initialData?.id,
        classe: selectedClasse,
        matiere: selectedMatiere,
        type,
        professeur: selectedProfesseur,
        salle: selectedSalle,
        creneau: selectedCreneau,
      });
    }
  };

  return (
    <form id="seance-form" onSubmit={handleSubmit} className="form-grid">
      <div className="form-grid-2col">
        <FormField label="Classe *" error={errors.classeId}>
          <Select
            options={classes.map((c) => ({ value: c.id as number, label: c.nom }))}
            value={classeId}
            onChange={(e) => setClasseId(e.target.value)}
            placeholder="Sélectionner la classe"
          />
        </FormField>

        <FormField label="Matière *" error={errors.matiereId}>
          <Select
            options={matieres.map((m) => ({ value: m.id as number, label: m.nom }))}
            value={matiereId}
            onChange={(e) => setMatiereId(e.target.value)}
            placeholder="Sélectionner la matière"
          />
        </FormField>
      </div>

      <FormField label="Type de Séance">
        <Select
          options={TYPE_OPTIONS}
          value={type}
          onChange={(e) => setType(e.target.value as any)}
        />
      </FormField>

      <h3 style={{ fontSize: '15px', fontWeight: 600, marginTop: '10px', color: 'var(--primary)' }}>
        Attributions (Facultatives - Timefold peut les calculer)
      </h3>

      <FormField label="Professeur Enseignant">
        <Select
          options={professeurs.map((p) => ({ value: p.id as number, label: `${p.nom.toUpperCase()} ${p.prenom}` }))}
          value={professeurId}
          onChange={(e) => setProfesseurId(e.target.value)}
          placeholder="Laisser le Solver décider"
        />
      </FormField>

      <div className="form-grid-2col">
        <FormField label="Salle de Classe">
          <Select
            options={salles.map((s) => ({ value: s.id as number, label: `${s.code} (${s.type} - cap:${s.capacite})` }))}
            value={salleId}
            onChange={(e) => setSalleId(e.target.value)}
            placeholder="Laisser le Solver décider"
          />
        </FormField>

        <FormField label="Créneau Horaire">
          <Select
            options={creneaux.map((cr) => {
              const start = new Date(cr.debut);
              const label = `${start.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} à ${start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
              return { value: cr.id as number, label };
            })}
            value={creneauId}
            onChange={(e) => setCreneauId(e.target.value)}
            placeholder="Laisser le Solver décider"
          />
        </FormField>
      </div>

      <div style={{ display: 'none' }}>
        <button type="submit">Submit</button>
      </div>
    </form>
  );
}
