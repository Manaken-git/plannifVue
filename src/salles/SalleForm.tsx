import React, { useState, useEffect } from 'react';
import { Salle } from '../types/model';
import { FormField, Input, Select } from '../components/common/FormControls';

interface SalleFormProps {
  initialData?: Salle;
  onSubmit: (data: Salle) => void;
}

const TYPE_OPTIONS = [
  { value: 'COURS', label: 'Cours classique' },
  { value: 'TP', label: 'Informatique / Travaux Pratiques (TP)' },
];

export function SalleForm({ initialData, onSubmit }: SalleFormProps) {
  const [formData, setFormData] = useState<Partial<Salle>>({
    code: '',
    capacite: 30,
    type: 'COURS',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (field: keyof Salle, value: any) => {
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
    if (!formData.code) newErrors.code = 'Le code de la salle est obligatoire';
    if (formData.capacite !== undefined && formData.capacite <= 0) {
      newErrors.capacite = 'La capacité doit être supérieure à 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData as Salle);
    }
  };

  return (
    <form id="salle-form" onSubmit={handleSubmit} className="form-grid">
      <FormField label="Code de la salle" error={errors.code}>
        <Input
          type="text"
          placeholder="Ex: A101, B203..."
          value={formData.code || ''}
          onChange={(e) => handleChange('code', e.target.value)}
        />
      </FormField>

      <FormField label="Capacité d'accueil (élèves)" error={errors.capacite}>
        <Input
          type="number"
          placeholder="Ex: 30"
          value={formData.capacite !== undefined ? formData.capacite : ''}
          onChange={(e) => handleChange('capacite', e.target.value === '' ? undefined : parseInt(e.target.value))}
        />
      </FormField>

      <FormField label="Type de salle" error={errors.type}>
        <Select
          options={TYPE_OPTIONS}
          value={formData.type || 'COURS'}
          onChange={(e) => handleChange('type', e.target.value)}
        />
      </FormField>

      <div style={{ display: 'none' }}>
        <button type="submit">Submit</button>
      </div>
    </form>
  );
}
