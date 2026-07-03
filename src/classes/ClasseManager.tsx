import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { usePlanning } from '../context/PlanningContext';
import { Classe } from '../types/model';
import { CrudTable } from '../components/common/CrudTable';
import { Modal } from '../components/common/Modal';
import { ClasseForm } from './ClasseForm';

export function ClasseManager() {
  const { classes, saveClasse, deleteClasse } = usePlanning();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClasse, setEditingClasse] = useState<Classe | undefined>(undefined);

  const handleAdd = () => {
    setEditingClasse(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (classe: Classe) => {
    setEditingClasse(classe);
    setIsModalOpen(true);
  };

  const handleDelete = (classe: Classe) => {
    if (classe.id && window.confirm(`Voulez-vous vraiment supprimer la classe ${classe.nom} ?`)) {
      deleteClasse(classe.id);
    }
  };

  const handleSubmit = (classe: Classe) => {
    saveClasse(classe);
    setIsModalOpen(false);
  };

  const columns = [
    {
      key: 'nom',
      header: 'Nom de Classe',
      render: (classe: Classe) => (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          {classe.nom}
        </span>
      ),
    },
    {
      key: 'eleves',
      header: "Nombre d'élèves",
      render: (classe: Classe) => {
        const count = (classe.eleves || []).length;
        return (
          <span className="badge badge-primary">
            {count} {count > 1 ? 'élèves' : 'élève'}
          </span>
        );
      },
    },
  ];

  return (
    <div className="manager-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Classes ({classes.length})</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Gérez les divisions d'élèves (niveaux/classes) et listez les élèves inscrits dans chacune.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleAdd}>
          <Plus size={16} /> Ajouter une Classe
        </button>
      </div>

      <CrudTable
        data={classes}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Rechercher par nom..."
        searchFields={['nom']}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClasse ? 'Modifier la Classe' : 'Ajouter une Classe'}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Annuler
            </button>
            <button type="submit" form="classe-form" className="btn btn-primary">
              Enregistrer
            </button>
          </>
        }
      >
        <ClasseForm initialData={editingClasse} onSubmit={handleSubmit} />
      </Modal>
    </div>
  );
}
