import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { usePlanning } from '../context/PlanningContext';
import { Matiere } from '../types/model';
import { CrudTable } from '../components/common/CrudTable';
import { Modal } from '../components/common/Modal';
import { MatiereForm } from './MatiereForm';

export function MatiereManager() {
  const { matieres, saveMatiere, deleteMatiere } = usePlanning();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMatiere, setEditingMatiere] = useState<Matiere | undefined>(undefined);

  const handleAdd = () => {
    setEditingMatiere(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (matiere: Matiere) => {
    setEditingMatiere(matiere);
    setIsModalOpen(true);
  };

  const handleDelete = (matiere: Matiere) => {
    if (matiere.id && window.confirm(`Voulez-vous vraiment supprimer la matière ${matiere.nom} ?`)) {
      deleteMatiere(matiere.id);
    }
  };

  const handleSubmit = (matiere: Matiere) => {
    saveMatiere(matiere);
    setIsModalOpen(false);
  };

  const columns = [
    {
      key: 'nom',
      header: 'Matière',
      render: (matiere: Matiere) => (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          {matiere.nom}
        </span>
      ),
    },
    {
      key: 'volumeHoraireAnnuel',
      header: 'Volume Horaire Annuel',
      render: (matiere: Matiere) => `${matiere.volumeHoraireAnnuel || 0} heures`,
    },
  ];

  return (
    <div className="manager-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Matières ({matieres.length})</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Gérez les matières enseignées dans l'établissement scolaire et leur volume horaire annuel.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleAdd}>
          <Plus size={16} /> Ajouter une Matière
        </button>
      </div>

      <CrudTable
        data={matieres}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Rechercher par nom..."
        searchFields={['nom']}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMatiere ? 'Modifier la Matière' : 'Ajouter une Matière'}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Annuler
            </button>
            <button type="submit" form="matiere-form" className="btn btn-primary">
              Enregistrer
            </button>
          </>
        }
      >
        <MatiereForm initialData={editingMatiere} onSubmit={handleSubmit} />
      </Modal>
    </div>
  );
}
