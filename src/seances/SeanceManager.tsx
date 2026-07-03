import React, { useState } from 'react';
import { Plus, HelpCircle } from 'lucide-react';
import { usePlanning } from '../context/PlanningContext';
import { Seance } from '../types/model';
import { CrudTable } from '../components/common/CrudTable';
import { Modal } from '../components/common/Modal';
import { SeanceForm } from './SeanceForm';

const formatDisplayTimeShort = (dateStr?: string): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
    const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return `${day}. à ${time}`;
  } catch {
    return dateStr;
  }
};

export function SeanceManager() {
  const { seances, saveSeance, deleteSeance } = usePlanning();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSeance, setEditingSeance] = useState<Seance | undefined>(undefined);

  const handleAdd = () => {
    setEditingSeance(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (seance: Seance) => {
    setEditingSeance(seance);
    setIsModalOpen(true);
  };

  const handleDelete = (seance: Seance) => {
    if (seance.id && window.confirm(`Voulez-vous vraiment supprimer cette séance ?`)) {
      deleteSeance(seance.id);
    }
  };

  const handleSubmit = (seance: Seance) => {
    saveSeance(seance);
    setIsModalOpen(false);
  };

  const columns = [
    {
      key: 'classe',
      header: 'Classe',
      render: (seance: Seance) => (
        <span style={{ fontWeight: 600 }}>{seance.classe?.nom || 'Inconnue'}</span>
      ),
    },
    {
      key: 'matiere',
      header: 'Matière',
      render: (seance: Seance) => seance.matiere?.nom || 'Inconnue',
    },
    {
      key: 'type',
      header: 'Type',
      render: (seance: Seance) => {
        let badgeClass = 'badge-primary';
        if (seance.type === 'TP') badgeClass = 'badge-success';
        if (seance.type === 'EXAMEN') badgeClass = 'badge-danger';
        return <span className={`badge ${badgeClass}`}>{seance.type}</span>;
      },
    },
    {
      key: 'professeur',
      header: 'Enseignant',
      render: (seance: Seance) => {
        if (!seance.professeur) {
          return (
            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <HelpCircle size={14} /> À assigner
            </span>
          );
        }
        return `${seance.professeur.nom.toUpperCase()} ${seance.professeur.prenom}`;
      },
    },
    {
      key: 'salle',
      header: 'Salle',
      render: (seance: Seance) => {
        if (!seance.salle) {
          return (
            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <HelpCircle size={14} /> À assigner
            </span>
          );
        }
        return <span className="badge badge-primary">{seance.salle.code}</span>;
      },
    },
    {
      key: 'creneau',
      header: 'Créneau',
      render: (seance: Seance) => {
        if (!seance.creneau) {
          return (
            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <HelpCircle size={14} /> À assigner
            </span>
          );
        }
        return formatDisplayTimeShort(seance.creneau.debut);
      },
    },
  ];

  return (
    <div className="manager-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Séances de Cours ({seances.length})</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Définissez les cours à planifier. Vous pouvez assigner manuellement des ressources ou laisser le solveur les optimiser.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleAdd}>
          <Plus size={16} /> Créer une Séance
        </button>
      </div>

      <CrudTable
        data={seances}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Rechercher par classe ou matière..."
        searchFields={[]} // Handled manually or let table filter by item keys
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSeance ? 'Modifier la Séance' : 'Créer une Séance'}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Annuler
            </button>
            <button type="submit" form="seance-form" className="btn btn-primary">
              Enregistrer
            </button>
          </>
        }
      >
        <SeanceForm initialData={editingSeance} onSubmit={handleSubmit} />
      </Modal>
    </div>
  );
}
