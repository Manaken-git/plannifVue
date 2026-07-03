import React, { useState, useEffect } from 'react';
import { Creneau } from '../types/model';
import { FormField, Input } from '../components/common/FormControls';

interface CreneauFormProps {
  initialData?: Creneau;
  onSubmit: (data: Creneau) => void;
}

// Formats a date string to HTML datetime-local format (yyyy-MM-ddThh:mm)
const formatToInput = (dateStr?: string): string => {
  if (!dateStr) return '';
  return dateStr.substring(0, 16); // Extract only up to minutes
};

// Formats an HTML datetime-local output to Java LocalDateTime format (adds seconds)
const formatFromInput = (dateStr: string): string => {
  if (!dateStr) return '';
  return `${dateStr}:00`;
};

export function CreneauForm({ initialData, onSubmit }: CreneauFormProps) {
  const [debut, setDebut] = useState('');
  const [fin, setFin] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setDebut(formatToInput(initialData.debut));
      setFin(formatToInput(initialData.fin));
    } else {
      // Default to today at 8:00 and 9:00
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      setDebut(`${dateStr}T08:00`);
      setFin(`${dateStr}T09:00`);
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!debut) newErrors.debut = 'La date de début est obligatoire';
    if (!fin) newErrors.fin = 'La date de fin est obligatoire';
    
    if (debut && fin) {
      const dStart = new Date(debut);
      const dEnd = new Date(fin);
      if (dEnd <= dStart) {
        newErrors.fin = 'La date de fin doit être strictement après la date de début';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        id: initialData?.id,
        debut: formatFromInput(debut),
        fin: formatFromInput(fin),
      });
    }
  };

  return (
    <form id="creneau-form" onSubmit={handleSubmit} className="form-grid">
      <FormField label="Début du créneau" error={errors.debut}>
        <Input
          type="datetime-local"
          value={debut}
          onChange={(e) => {
            setDebut(e.target.value);
            if (errors.debut) setErrors((prev) => ({ ...prev, debut: '' }));
          }}
        />
      </FormField>

      <FormField label="Fin du créneau" error={errors.fin}>
        <Input
          type="datetime-local"
          value={fin}
          onChange={(e) => {
            setFin(e.target.value);
            if (errors.fin) setErrors((prev) => ({ ...prev, fin: '' }));
          }}
        />
      </FormField>

      <div style={{ display: 'none' }}>
        <button type="submit">Submit</button>
      </div>
    </form>
  );
}
