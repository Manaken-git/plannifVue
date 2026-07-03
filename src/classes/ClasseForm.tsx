import React, { useState, useEffect } from 'react';
import { Classe, Eleve } from '../types/model';
import { FormField, Input } from '../components/common/FormControls';
import { Plus, Trash2 } from 'lucide-react';

interface ClasseFormProps {
  initialData?: Classe;
  onSubmit: (data: Classe) => void;
}

export function ClasseForm({ initialData, onSubmit }: ClasseFormProps) {
  const [nom, setNom] = useState('');
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [newNomEleve, setNewNomEleve] = useState('');
  const [newPrenomEleve, setNewPrenomEleve] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setNom(initialData.nom);
      setEleves(initialData.eleves || []);
    } else {
      setNom('');
      setEleves([]);
    }
  }, [initialData]);

  const handleAddEleve = () => {
    if (!newNomEleve.trim() || !newPrenomEleve.trim()) {
      alert("Veuillez saisir le nom et le prénom de l'élève.");
      return;
    }

    const nextId = eleves.reduce((max, e) => Math.max(max, e.id || 0), 0) + 1;
    const student: Eleve = {
      id: nextId,
      nom: newNomEleve.trim(),
      prenom: newPrenomEleve.trim(),
    };

    setEleves([...eleves, student]);
    setNewNomEleve('');
    setNewPrenomEleve('');
  };

  const handleRemoveEleve = (id: number) => {
    setEleves(eleves.filter((e) => e.id !== id));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!nom.trim()) newErrors.nom = 'Le nom de la classe est obligatoire';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        id: initialData?.id,
        nom: nom.trim(),
        eleves,
      });
    }
  };

  return (
    <form id="classe-form" onSubmit={handleSubmit} className="form-grid">
      <FormField label="Nom de la classe" error={errors.nom}>
        <Input
          type="text"
          placeholder="Ex: 6ème A, 5ème B..."
          value={nom}
          onChange={(e) => setNom(e.target.value)}
        />
      </FormField>

      <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: 'var(--primary)' }}>
          Gestion des Élèves ({eleves.length})
        </h3>

        {/* Form to add a student */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Nom</span>
            <Input
              type="text"
              placeholder="Ex: Dupont"
              value={newNomEleve}
              onChange={(e) => setNewNomEleve(e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Prénom</span>
            <Input
              type="text"
              placeholder="Ex: Lucas"
              value={newPrenomEleve}
              onChange={(e) => setNewPrenomEleve(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ height: '42px', display: 'flex', alignItems: 'center' }}
            onClick={handleAddEleve}
          >
            <Plus size={16} /> Ajouter
          </button>
        </div>

        {/* Student list */}
        <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '8px' }}>
          {eleves.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>
              Aucun élève dans cette classe
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '6px', textAlign: 'left' }}>Nom</th>
                  <th style={{ padding: '6px', textAlign: 'left' }}>Prénom</th>
                  <th style={{ padding: '6px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {eleves.map((el) => (
                  <tr key={el.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '6px', fontWeight: 500 }}>{el.nom.toUpperCase()}</td>
                    <td style={{ padding: '6px' }}>{el.prenom}</td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-danger btn-icon-only"
                        style={{ width: '28px', height: '28px' }}
                        onClick={() => el.id && handleRemoveEleve(el.id)}
                        title="Retirer l'élève"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div style={{ display: 'none' }}>
        <button type="submit">Submit</button>
      </div>
    </form>
  );
}
