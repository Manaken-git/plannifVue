import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { usePlanning } from '../context/PlanningContext';
import { Professeur } from '../types/model';
import { CrudTable } from '../components/common/CrudTable';
import { Modal } from '../components/common/Modal';
import { ProfForm } from './ProfForm';

const DAYS_NAMES = ['Lu', 'Ma', 'Me', 'Je', 'Ve'];

export function ProfManager() {
  const { professeurs, saveProfesseur, deleteProfesseur } = usePlanning();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProf, setEditingProf] = useState<Professeur | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingProf(undefined);
    setSaveError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (prof: Professeur) => {
    setEditingProf(prof);
    setSaveError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (prof: Professeur) => {
    if (prof.id && window.confirm(`Voulez-vous vraiment supprimer le professeur ${prof.prenom} ${prof.nom} ?`)) {
      try {
        await deleteProfesseur(prof.id);
      } catch (err: any) {
        alert(`Erreur lors de la suppression : ${err.message}`);
      }
    }
  };

  const handleSubmit = async (prof: Professeur) => {
    setSaving(true);
    setSaveError(null);
    try {
      await saveProfesseur(prof);
      setIsModalOpen(false);
    } catch (err: any) {
      setSaveError(err.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: 'nom',
      header: 'Nom Complet',
      render: (prof: Professeur) => (
        <span style={{ fontWeight: 500 }}>
          {prof.nom.toUpperCase()} {prof.prenom}
        </span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (prof: Professeur) => prof.email || <span style={{ color: 'var(--text-muted)' }}>-</span>,
    },
    {
      key: 'nb_heures',
      header: 'Heures / Semaine',
      render: (prof: Professeur) => `${prof.nb_heures || 0} h`,
    },
    {
      key: 'daysOff',
      header: 'Congés',
      sortable: false,
      render: (prof: Professeur) => {
        const days = prof.daysOff || [];
        if (days.length === 0) return <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Aucun</span>;
        return (
          <div className="badge-pill-list">
            {days.map((d, i) => (
              <span key={i} className="badge badge-warning">
                {DAYS_NAMES[d.dayOfWeek] || d.dayOfWeek}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'matieres',
      header: 'Matières',
      sortable: false,
      render: (prof: Professeur) => {
        const mats = prof.matieres || [];
        if (mats.length === 0) return <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Aucune</span>;
        return (
          <div className="badge-pill-list">
            {mats.map((m, i) => (
              <span key={i} className="badge badge-primary">
                {m.nom}
              </span>
            ))}
          </div>
        );
      },
    },
  ];

  return (
    <div className="manager-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Professeurs ({professeurs.length})</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Gérez la liste des enseignants, leurs heures et leurs indisponibilités.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleAdd}>
          <Plus size={16} /> Ajouter un Professeur
        </button>
      </div>

      <CrudTable
        data={professeurs}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Rechercher par nom..."
        searchFields={['nom', 'prenom', 'email']}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProf ? 'Modifier le Professeur' : 'Ajouter un Professeur'}
        footer={
          <>
            {saveError && (
              <span style={{ color: '#f87171', fontSize: '13px', flex: 1 }}>{saveError}</span>
            )}
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} disabled={saving}>
              Annuler
            </button>
            <button type="submit" form="prof-form" className="btn btn-primary" disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </>
        }
      >
        <ProfForm initialData={editingProf} onSubmit={handleSubmit} />
      </Modal>
    </div>
  );
}
