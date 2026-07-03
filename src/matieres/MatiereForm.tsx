import React, { useState, useEffect } from 'react';
import { Matiere } from '../types/model';
import { FormField, Input } from '../components/common/FormControls';

interface MatiereFormProps {
  initialData?: Matiere;
  onSubmit: (data: Matiere) => void;
}

export function MatiereForm({ initialData, onSubmit }: MatiereFormProps) {
  const [formData, setFormData] = useState<Partial<Matiere>>({
    nom: '',
    volumeHoraireAnnuel: 120,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (field: keyof Matiere, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field as string];
        return copy;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.nom) newErrors.nom = 'Le nom de la matière est obligatoire';
    if (formData.volumeHoraireAnnuel !== undefined && formData.volumeHoraireAnnuel <= 0) {
      newErrors.volumeHoraireAnnuel = 'Le volume horaire doit être supérieur à 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData as Matiere);
    }
  };

  return (
    <form id="matiere-form" onSubmit={handleSubmit} className="form-grid">
      <FormField label="Nom de la matière" error={errors.nom}>
        <Input
          type="text"
          placeholder="Ex: Mathématiques, Histoire-Géo..."
          value={formData.nom || ''}
          onChange={(e) => handleChange('nom', e.target.value)}
        />
      </FormField>

      <FormField label="Volume Horaire Annuel (heures)" error={errors.volumeHoraireAnnuel}>
        <Input
          type="number"
          placeholder="Ex: 120"
          value={formData.volumeHoraireAnnuel !== undefined ? formData.volumeHoraireAnnuel : ''}
          onChange={(e) => handleChange('volumeHoraireAnnuel', e.target.value === '' ? undefined : parseInt(e.target.value))}
        />
      </FormField>

      <div style={{ display: 'none' }}>
        <button type="submit">Submit</button>
      </div>
    </form>
  );
}
