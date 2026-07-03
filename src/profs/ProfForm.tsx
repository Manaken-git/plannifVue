import React, { useState, useEffect } from 'react';
import { Professeur, Matiere } from '../types/model';
import { Prof } from './Prof';
import { FormField, Input, MultiSelectPill } from '../components/common/FormControls';
import { usePlanning } from '../context/PlanningContext';

interface ProfFormProps {
  initialData?: Professeur;
  onSubmit: (data: Professeur) => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Lundi' },
  { value: 1, label: 'Mardi' },
  { value: 2, label: 'Mercredi' },
  { value: 3, label: 'Jeudi' },
  { value: 4, label: 'Vendredi' },
];

export function ProfForm({ initialData, onSubmit }: ProfFormProps) {
  const { matieres } = usePlanning();
  const [formData, setFormData] = useState<Partial<Professeur>>({
    nom: '',
    prenom: '',
    email: '',
    nb_heures: 18,
    maxHeuresParJour: 8,
    maxHeuresParSemaine: 24,
    maxHeuresParSeance: 2,
    daysOff: [],
    matieres: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (field: keyof Professeur, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field as string];
        return copy;
      });
    }
  };

  const handleDaysOffChange = (values: (string | number)[]) => {
    const newDaysOff = values.map((val) => ({ dayOfWeek: Number(val) }));
    handleChange('daysOff', newDaysOff);
  };

  const handleMatieresChange = (values: (string | number)[]) => {
    const selectedMatieres = matieres.filter((m) => m.id !== undefined && values.includes(m.id));
    handleChange('matieres', selectedMatieres);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.nom) newErrors.nom = 'Le nom est obligatoire';
    if (!formData.prenom) newErrors.prenom = 'Le prénom est obligatoire';
    if (formData.nb_heures !== undefined && formData.nb_heures < 0) {
      newErrors.nb_heures = "Le nombre d'heures doit être positif";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData as Professeur);
    }
  };

  const selectedDaysOffKeys = (formData.daysOff || []).map((d) => d.dayOfWeek);
  const selectedMatieresKeys = (formData.matieres || []).map((m) => m.id as number);

  const matieresOptions = matieres.map((m) => ({
    value: m.id as number,
    label: m.nom,
  }));

  return (
    <form id="prof-form" onSubmit={handleSubmit} className="form-grid">
      <Prof data={formData} onChange={handleChange} errors={errors} />

      <h3 style={{ fontSize: '15px', fontWeight: 600, marginTop: '10px', color: 'var(--primary)' }}>
        Contraintes et Horaires Max
      </h3>
      
      <div className="form-grid-2col">
        <FormField label="Max heures / jour" error={errors.maxHeuresParJour}>
          <Input
            type="number"
            value={formData.maxHeuresParJour !== undefined ? formData.maxHeuresParJour : ''}
            onChange={(e) => handleChange('maxHeuresParJour', e.target.value === '' ? undefined : parseFloat(e.target.value))}
          />
        </FormField>

        <FormField label="Max heures / semaine" error={errors.maxHeuresParSemaine}>
          <Input
            type="number"
            value={formData.maxHeuresParSemaine !== undefined ? formData.maxHeuresParSemaine : ''}
            onChange={(e) => handleChange('maxHeuresParSemaine', e.target.value === '' ? undefined : parseFloat(e.target.value))}
          />
        </FormField>
      </div>

      <FormField label="Max heures / séance" error={errors.maxHeuresParSeance}>
        <Input
          type="number"
          value={formData.maxHeuresParSeance !== undefined ? formData.maxHeuresParSeance : ''}
          onChange={(e) => handleChange('maxHeuresParSeance', e.target.value === '' ? undefined : parseFloat(e.target.value))}
        />
      </FormField>

      <FormField label="Jours de congé préférés">
        <MultiSelectPill
          options={DAYS_OF_WEEK}
          selectedValues={selectedDaysOffKeys}
          onChange={handleDaysOffChange}
        />
      </FormField>

      <FormField label="Matières enseignées">
        {matieresOptions.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Aucune matière configurée. Veuillez d'abord créer des matières.
          </p>
        ) : (
          <MultiSelectPill
            options={matieresOptions}
            selectedValues={selectedMatieresKeys}
            onChange={handleMatieresChange}
          />
        )}
      </FormField>

      <div style={{ display: 'none' }}>
        {/* Hidden submit trigger to bind form submit to modal buttons */}
        <button type="submit">Submit</button>
      </div>
    </form>
  );
}
