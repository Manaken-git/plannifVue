import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Users, 
  Home, 
  GraduationCap
} from 'lucide-react';
import { api } from './services/api';
import type { 
  Professeur, 
  Eleve, 
  Classe, 
  Matiere, 
  Salle, 
  Seance,
  Creneau
} from './services/api';

// Components
import { Sidebar, type Tab } from './components/organisms/Sidebar';
import { Header } from './components/organisms/Header';
import { StatCard } from './components/molecules/StatCard';
import { ToastNotification } from './components/molecules/ToastNotification';
import { CalendarGrid } from './components/organisms/CalendarGrid';
import { FormModal } from './components/organisms/FormModal';
import { 
  ProfesseursTable, 
  ClassesTable, 
  ElevesTable, 
  MatieresTable, 
  SallesTable,
  CreneauxTable
} from './components/organisms/EntityTables';

import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data States
  const [professeurs, setProfesseurs] = useState<Professeur[]>([]);
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [seances, setSeances] = useState<Seance[]>([]);
  const [creneaux, setCreneaux] = useState<Creneau[]>([]);
  
  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Active Filter for Calendar
  const [calendarFilter, setCalendarFilter] = useState<{
    type: 'all' | 'professeur' | 'classe' | 'matiere' | 'salle';
    value: string;
  }>({ type: 'all', value: '' });

  // Modal States
  const [modalType, setModalType] = useState<'create' | 'edit' | null>(null);
  const [modalEntity, setModalEntity] = useState<Tab | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Show Toast
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load All Data
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [profsData, elevesData, classesData, matieresData, sallesData, seancesData, creneauxData] = await Promise.all([
        api.professeurs.list().catch(() => []),
        api.eleves.listAll().catch(() => []),
        api.classes.list().catch(() => []),
        api.matieres.list().catch(() => []),
        api.salles.list().catch(() => []),
        api.seances.list().catch(() => []),
        api.creneaux.list().catch(() => [])
      ]);

      setProfesseurs(profsData);
      setEleves(elevesData);
      setClasses(classesData);
      setMatieres(matieresData);
      setSalles(sallesData);
      setSeances(seancesData);
      setCreneaux(creneauxData);
    } catch (err: any) {
      showToast("Erreur lors de la récupération des données", 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Open modals helper
  const openCreateModal = (entity: Tab) => {
    setModalType('create');
    setModalEntity(entity);
    setSelectedItem(null);
  };

  const openEditModal = (entity: Tab, item: any) => {
    setModalType('edit');
    setModalEntity(entity);
    setSelectedItem(item);
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSearchTerm('');
  };

  // CRUD Actions
  const handleSave = async (
    payload: any, 
    associationIds?: {
      professeurId?: number;
      classeId?: number;
      matiereId?: number;
      salleId?: number;
    }
  ) => {
    setLoading(true);
    try {
      if (modalEntity === 'professeurs') {
        if (modalType === 'create') {
          await api.professeurs.create(payload);
          showToast("Professeur créé avec succès !");
        } else {
          await api.professeurs.update(payload);
          showToast("Professeur mis à jour !");
        }
      } else if (modalEntity === 'eleves') {
        const cId = associationIds?.classeId;
        if (modalType === 'create') {
          await api.eleves.create(payload, cId);
          showToast("Élève inscrit avec succès !");
        } else {
          await api.eleves.update(payload, cId);
          showToast("Élève mis à jour !");
        }
      } else if (modalEntity === 'classes') {
        if (modalType === 'create') {
          await api.classes.create(payload);
          showToast("Classe créée !");
        } else {
          await api.classes.update(payload);
          showToast("Classe mise à jour !");
        }
      } else if (modalEntity === 'matieres') {
        if (modalType === 'create') {
          await api.matieres.create(payload);
          showToast("Matière créée !");
        } else {
          await api.matieres.update(payload);
          showToast("Matière mise à jour !");
        }
      } else if (modalEntity === 'salles') {
        if (modalType === 'create') {
          await api.salles.create(payload);
          showToast("Salle créée !");
        } else {
          await api.salles.update(payload);
          showToast("Salle mise à jour !");
        }
      } else if (modalEntity === 'creneaux') {
        if (modalType === 'create') {
          await api.creneaux.create(payload);
          showToast("Créneau horaire créé !");
        } else {
          await api.creneaux.update(payload);
          showToast("Créneau horaire mis à jour !");
        }
      } else if (modalEntity === 'dashboard') {
        const pId = associationIds?.professeurId;
        const cId = associationIds?.classeId;
        const mId = associationIds?.matiereId;
        const sId = associationIds?.salleId;

        if (modalType === 'create') {
          await api.seances.create(payload, pId, cId, mId, sId);
          showToast("Séance planifiée !");
        } else {
          await api.seances.update(payload, pId, cId, mId, sId);
          showToast("Séance mise à jour !");
        }
      }

      setModalType(null);
      setModalEntity(null);
      loadAllData();
    } catch (err: any) {
      showToast(err.message || "Une erreur est survenue lors de l'enregistrement", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (entity: Tab, id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) return;
    setLoading(true);
    try {
      if (entity === 'professeurs') await api.professeurs.delete(id);
      else if (entity === 'eleves') await api.eleves.delete(id);
      else if (entity === 'classes') await api.classes.delete(id);
      else if (entity === 'matieres') await api.matieres.delete(id);
      else if (entity === 'salles') await api.salles.delete(id);
      else if (entity === 'creneaux') await api.creneaux.delete(id);
      else if (entity === 'dashboard') await api.seances.delete(id);

      showToast("Élément supprimé avec succès !");
      setModalType(null);
      setModalEntity(null);
      loadAllData();
    } catch (err: any) {
      showToast(err.message || "Impossible de supprimer cet élément", 'error');
    } finally {
      setLoading(false);
    }
  };

  // Calendar Sessions filter calculation
  const filteredSeances = useMemo(() => {
    return seances.filter(s => {
      if (calendarFilter.type === 'all') return true;
      if (calendarFilter.type === 'professeur') return s.professeurNomComplet === calendarFilter.value;
      if (calendarFilter.type === 'classe') return s.classeNom === calendarFilter.value;
      if (calendarFilter.type === 'matiere') return s.matiereNom === calendarFilter.value;
      if (calendarFilter.type === 'salle') return s.salleCode === calendarFilter.value;
      return true;
    });
  }, [seances, calendarFilter]);

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Main Content Area */}
      <main className="main-content">
        {/* Header */}
        <Header 
          activeTab={activeTab} 
          loading={loading} 
          onRefresh={loadAllData} 
          onCreateClick={() => openCreateModal(activeTab)} 
        />

        {/* Dashboard Stats */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-grid">
            <StatCard icon={<CalendarIcon size={24} />} iconColor="primary" value={seances.length} label="Séances planifiées" />
            <StatCard icon={<GraduationCap size={24} />} iconColor="success" value={professeurs.length} label="Enseignants" />
            <StatCard icon={<Users size={24} />} iconColor="info" value={eleves.length} label="Élèves inscrits" />
            <StatCard icon={<Home size={24} />} iconColor="warning" value={salles.length} label="Salles configurées" />
          </div>
        )}

        {/* Dynamic Content Views */}
        {activeTab === 'dashboard' && (
          <CalendarGrid 
            seances={filteredSeances}
            professeurs={professeurs}
            classes={classes}
            matieres={matieres}
            salles={salles}
            calendarFilter={calendarFilter}
            onFilterChange={setCalendarFilter}
            onEditSession={(seance) => openEditModal('dashboard', seance)}
          />
        )}

        {activeTab === 'professeurs' && (
          <ProfesseursTable 
            professeurs={professeurs} 
            searchTerm={searchTerm} 
            onSearchChange={setSearchTerm} 
            onEdit={(p) => openEditModal('professeurs', p)} 
            onDelete={(id) => handleDelete('professeurs', id)} 
          />
        )}

        {activeTab === 'classes' && (
          <ClassesTable 
            classes={classes} 
            searchTerm={searchTerm} 
            onSearchChange={setSearchTerm} 
            onEdit={(c) => openEditModal('classes', c)} 
            onDelete={(id) => handleDelete('classes', id)} 
          />
        )}

        {activeTab === 'eleves' && (
          <ElevesTable 
            eleves={eleves} 
            searchTerm={searchTerm} 
            onSearchChange={setSearchTerm} 
            onEdit={(e) => openEditModal('eleves', e)} 
            onDelete={(id) => handleDelete('eleves', id)} 
          />
        )}

        {activeTab === 'matieres' && (
          <MatieresTable 
            matieres={matieres} 
            searchTerm={searchTerm} 
            onSearchChange={setSearchTerm} 
            onEdit={(m) => openEditModal('matieres', m)} 
            onDelete={(id) => handleDelete('matieres', id)} 
          />
        )}

        {activeTab === 'salles' && (
          <SallesTable 
            salles={salles} 
            searchTerm={searchTerm} 
            onSearchChange={setSearchTerm} 
            onEdit={(s) => openEditModal('salles', s)} 
            onDelete={(id) => handleDelete('salles', id)} 
          />
        )}

        {activeTab === 'creneaux' && (
          <CreneauxTable 
            creneaux={creneaux} 
            searchTerm={searchTerm} 
            onSearchChange={setSearchTerm} 
            onEdit={(c) => openEditModal('creneaux', c)} 
            onDelete={(id) => handleDelete('creneaux', id)} 
          />
        )}
      </main>

      {/* Global Form Modal */}
      {modalType && modalEntity && (
        <FormModal 
          modalType={modalType}
          modalEntity={modalEntity}
          selectedItem={selectedItem}
          loading={loading}
          classes={classes}
          professeurs={professeurs}
          matieres={matieres}
          salles={salles}
          creneaux={creneaux}
          onClose={() => { setModalType(null); setModalEntity(null); }}
          onDelete={handleDelete}
          onSave={handleSave}
        />
      )}

      {/* Global Toast */}
      {toast && (
        <ToastNotification message={toast.message} type={toast.type} />
      )}
    </div>
  );
}
