import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { usePlanning } from '../context/PlanningContext';
import { Creneau } from '../types/model';
import { CrudTable } from '../components/common/CrudTable';
import { Modal } from '../components/common/Modal';
import { CreneauForm } from './CreneauForm';

const formatDisplayDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const formatDisplayTime = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

export function CreneauManager() {
  const { creneaux, saveCreneau, deleteCreneau } = usePlanning();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCreneau, setEditingCreneau] = useState<Creneau | undefined>(undefined);

  const handleAdd = () => {
    setEditingCreneau(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (creneau: Creneau) => {
    setEditingCreneau(creneau);
    setIsModalOpen(true);
  };

  const handleDelete = (creneau: Creneau) => {
    if (creneau.id && window.confirm(`Voulez-vous vraiment supprimer ce créneau ?`)) {
      deleteCreneau(creneau.id);
    }
  };

  const handleSubmit = (creneau: Creneau) => {
    saveCreneau(creneau);
    setIsModalOpen(false);
  };

  const columns = [
    {
      key: 'date',
      header: 'Jour',
      render: (creneau: Creneau) => (
        <span style={{ textTransform: 'capitalize' }}>
          {formatDisplayDate(creneau.debut)}
        </span>
      ),
    },
    {
      key: 'heure',
      header: 'Horaire',
      render: (creneau: Creneau) => (
        <span style={{ fontWeight: 600, color: '#a5b4fc' }}>
          {formatDisplayTime(creneau.debut)} — {formatDisplayTime(creneau.fin)}
        </span>
      ),
    },
  ];

  return (
    <div className="manager-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Créneaux Horaires ({creneaux.length})</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Gérez les plages temporelles de cours disponibles dans l'emploi du temps.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleAdd}>
          <Plus size={16} /> Ajouter un Créneau
        </button>
      </div>

      <CrudTable
        data={creneaux}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Rechercher par date..."
        searchFields={['debut', 'fin']}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCreneau ? 'Modifier le Créneau' : 'Ajouter un Créneau'}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Annuler
            </button>
            <button type="submit" form="creneau-form" className="btn btn-primary">
              Enregistrer
            </button>
          </>
        }
      >
        <CreneauForm initialData={editingCreneau} onSubmit={handleSubmit} />
      </Modal>
    </div>
  );
}
