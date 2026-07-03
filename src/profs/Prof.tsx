import React from 'react';
import { Professeur } from '../types/model';
import { Input, FormField } from '../components/common/FormControls';

interface ProfProps {
  data: Partial<Professeur>;
  onChange: (field: keyof Professeur, value: any) => void;
  errors?: Record<string, string>;
}

export function Prof({ data, onChange, errors = {} }: ProfProps) {
  return (
    <>
      <FormField label="Nom" error={errors.nom}>
        <Input
          type="text"
          name="nom"
          placeholder="Ex: Martin"
          value={data.nom || ''}
          onChange={(e) => onChange('nom', e.target.value)}
        />
      </FormField>

      <FormField label="Prénom" error={errors.prenom}>
        <Input
          type="text"
          name="prenom"
          placeholder="Ex: Jean"
          value={data.prenom || ''}
          onChange={(e) => onChange('prenom', e.target.value)}
        />
      </FormField>

      <FormField label="Email" error={errors.email}>
        <Input
          type="email"
          name="email"
          placeholder="Ex: jean.martin@ecole.fr"
          value={data.email || ''}
          onChange={(e) => onChange('email', e.target.value)}
        />
      </FormField>

      <FormField label="Nombre d'heures contractuelles" error={errors.nb_heures}>
        <Input
          type="number"
          name="nb_heures"
          placeholder="Ex: 18"
          value={data.nb_heures !== undefined ? data.nb_heures : ''}
          onChange={(e) => onChange('nb_heures', e.target.value === '' ? undefined : parseFloat(e.target.value))}
        />
      </FormField>
    </>
  );
}

export default Prof;