import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { usePlanning } from '../context/PlanningContext';
import { Salle } from '../types/model';
import { CrudTable } from '../components/common/CrudTable';
import { Modal } from '../components/common/Modal';
import { SalleForm } from './SalleForm';

export function SalleManager() {
  const { salles, saveSalle, deleteSalle } = usePlanning();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSalle, setEditingSalle] = useState<Salle | undefined>(undefined);

  const handleAdd = () => {
    setEditingSalle(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (salle: Salle) => {
    setEditingSalle(salle);
    setIsModalOpen(true);
  };

  const handleDelete = (salle: Salle) => {
    if (salle.id && window.confirm(`Voulez-vous vraiment supprimer la salle ${salle.code} ?`)) {
      deleteSalle(salle.id);
    }
  };

  const handleSubmit = (salle: Salle) => {
    saveSalle(salle);
    setIsModalOpen(false);
  };

  const columns = [
    {
      key: 'code',
      header: 'Code de Salle',
      render: (salle: Salle) => (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          {salle.code}
        </span>
      ),
    },
    {
      key: 'capacite',
      header: "Capacité d'accueil",
      render: (salle: Salle) => `${salle.capacite || 0} places`,
    },
    {
      key: 'type',
      header: 'Type de Salle',
      render: (salle: Salle) => {
        const isTp = salle.type === 'TP';
        return (
          <span className={`badge ${isTp ? 'badge-success' : 'badge-primary'}`}>
            {isTp ? 'Informatique / TP' : 'Cours Classique'}
          </span>
        );
      },
    },
  ];

  return (
    <div className="manager-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Salles de Classe ({salles.length})</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Gérez les salles physiques disponibles pour la planification et leurs caractéristiques.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleAdd}>
          <Plus size={16} /> Ajouter une Salle
        </button>
      </div>

      <CrudTable
        data={salles}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Rechercher par code..."
        searchFields={['code', 'type']}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSalle ? 'Modifier la Salle' : 'Ajouter une Salle'}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Annuler
            </button>
            <button type="submit" form="salle-form" className="btn btn-primary">
              Enregistrer
            </button>
          </>
        }
      >
        <SalleForm initialData={editingSalle} onSubmit={handleSubmit} />
      </Modal>
    </div>
  );
}
