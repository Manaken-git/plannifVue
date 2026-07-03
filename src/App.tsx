import React, { useState } from 'react';
import { PlanningProvider, usePlanning } from './context/PlanningContext';
import { ProfManager } from './profs/ProfManager';
import { SalleManager } from './salles/SalleManager';
import { ClasseManager } from './classes/ClasseManager';
import { MatiereManager } from './matieres/MatiereManager';
import { CreneauManager } from './creneaux/CreneauManager';
import { SeanceManager } from './seances/SeanceManager';
import './styles/crud.css';
import {
  Users,
  DoorOpen,
  GraduationCap,
  BookOpen,
  Calendar,
  Layers,
  LayoutDashboard,
  Cpu,
  RefreshCw,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

function DashboardView() {
  const {
    professeurs,
    salles,
    classes,
    matieres,
    creneaux,
    seances,
    solvedPlanning,
    isSolving,
    solveError,
    solvePlanning
  } = usePlanning();

  const totalProfs = professeurs.length;
  const totalSalles = salles.length;
  const totalClasses = classes.length;
  const totalMatieres = matieres.length;
  const totalCreneaux = creneaux.length;
  const totalSeances = seances.length;

  const assignedSeances = seances.filter((s) => s.professeur && s.salle && s.creneau).length;

  return (
    <div className="manager-container">
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Vue d'ensemble</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Statistiques de l'établissement et lanceur d'optimisation sous contraintes.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#a5b4fc' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>Enseignants</h3>
            <p>{totalProfs}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(20, 184, 166, 0.1)', color: '#2dd4bf' }}>
            <DoorOpen size={24} />
          </div>
          <div className="stat-info">
            <h3>Salles</h3>
            <p>{totalSalles}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', color: '#d8b4fe' }}>
            <GraduationCap size={24} />
          </div>
          <div className="stat-info">
            <h3>Classes</h3>
            <p>{totalClasses}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(236, 72, 153, 0.1)', color: '#fbcfe8' }}>
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <h3>Créneaux</h3>
            <p>{totalCreneaux}</p>
          </div>
        </div>
      </div>

      {/* Solver section */}
      <div className="solver-section">
        <div className="solver-main-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Cpu size={24} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Solveur d'Emploi du Temps</h3>
          </div>
          
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
            Envoie la configuration actuelle (enseignants, salles, classes, séances) au moteur de contraintes 
            <strong> Timefold Solver</strong> du backend. Le solveur calculera l'affectation optimale des créneaux, 
            des salles et des professeurs en respectant les contraintes strictes (conflits, limites d'heures).
          </p>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '10px' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={solvePlanning}
              disabled={isSolving || totalSeances === 0}
              style={{ padding: '12px 24px', fontSize: '15px' }}
            >
              {isSolving ? (
                <>
                  <RefreshCw className="spinner" size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Résolution en cours...
                </>
              ) : (
                'Lancer le Solveur Timefold'
              )}
            </button>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {assignedSeances} / {totalSeances} séances assignées manuellement
            </span>
          </div>

          {/* Solver feedback */}
          {solveError && (
            <div style={{ backgroundColor: 'var(--danger-bg)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', gap: '12px', color: '#fca5a5', marginTop: '10px' }}>
              <AlertTriangle size={20} style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>Erreur du solveur</strong>
                <span style={{ fontSize: '13px' }}>{solveError}</span>
              </div>
            </div>
          )}

          {solvedPlanning && (
            <div style={{ backgroundColor: 'var(--success-bg)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', gap: '12px', color: '#a7f3d0', marginTop: '10px' }}>
              <CheckCircle size={20} style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>Résolution réussie !</strong>
                <span style={{ fontSize: '13px' }}>
                  L'emploi du temps a été généré et mis à jour. Score final : {solvedPlanning.score ? `${solvedPlanning.score.hardScore} Hard / ${solvedPlanning.score.softScore} Soft` : 'Calculé'}
                </span>
              </div>
            </div>
          )}

          {/* Solved Results Table */}
          {solvedPlanning && solvedPlanning.seances && (
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>Résultat d'affectation</h4>
              <div className="table-wrapper" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <table className="solver-output-table">
                  <thead>
                    <tr>
                      <th>Classe</th>
                      <th>Matière</th>
                      <th>Enseignant</th>
                      <th>Salle</th>
                      <th>Créneau</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solvedPlanning.seances.map((s, idx) => (
                      <tr key={s.id || idx}>
                        <td style={{ fontWeight: 600 }}>{s.classe?.nom}</td>
                        <td>{s.matiere?.nom}</td>
                        <td>{s.professeur ? `${s.professeur.nom} ${s.professeur.prenom}` : 'Non assigné'}</td>
                        <td>{s.salle ? <span className="badge badge-primary">{s.salle.code}</span> : 'Non assigné'}</td>
                        <td>
                          {s.creneau ? (
                            <span style={{ fontSize: '12px' }}>
                              {new Date(s.creneau.debut).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })} à{' '}
                              {new Date(s.creneau.debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          ) : (
                            'Non assigné'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Constraints Card */}
        <div className="solver-side-card">
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Règles & Contraintes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px', marginTop: '10px' }}>
            <div>
              <strong style={{ color: '#f87171', display: 'block', marginBottom: '2px' }}>[Hard] Conflits d'affectation</strong>
              <span style={{ color: 'var(--text-secondary)' }}>Une salle, un prof ou une classe ne peut pas être à deux endroits en même temps.</span>
            </div>
            
            <div>
              <strong style={{ color: '#f87171', display: 'block', marginBottom: '2px' }}>[Hard] Max Heures Professeur</strong>
              <span style={{ color: 'var(--text-secondary)' }}>Respecte les maximums d'heures par jour, semaine et par séance de chaque enseignant.</span>
            </div>

            <div>
              <strong style={{ color: '#f87171', display: 'block', marginBottom: '2px' }}>[Hard] Consécutifs Enseignant-Classe</strong>
              <span style={{ color: 'var(--text-secondary)' }}>Maximum 5 heures de cours sur 2 jours consécutifs pour le même prof avec la même classe.</span>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
              <strong style={{ color: '#60a5fa', display: 'block', marginBottom: '2px' }}>[Soft] Jour de Congé Préféré</strong>
              <span style={{ color: 'var(--text-secondary)' }}>Évite d'affecter des séances aux professeurs pendant leur jour de congé souhaité.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MainApp() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profs' | 'salles' | 'classes' | 'matieres' | 'creneaux' | 'seances'>('dashboard');
  const { exportPlanningData, importPlanningData, resetPlanning } = usePlanning();

  const handleExport = () => {
    const data = exportPlanningData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'scenario_planning.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        importPlanningData(json);
        alert('Données du planning importées avec succès !');
      } catch (err) {
        alert("Erreur lors de l'analyse du fichier JSON.");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
  };

  const handleReset = () => {
    if (window.confirm("Voulez-vous vraiment réinitialiser toutes les données ? (Vos modifications locales seront perdues)")) {
      resetPlanning();
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'profs':
        return <ProfManager />;
      case 'salles':
        return <SalleManager />;
      case 'classes':
        return <ClasseManager />;
      case 'matieres':
        return <MatiereManager />;
      case 'creneaux':
        return <CreneauManager />;
      case 'seances':
        return <SeanceManager />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">P</div>
          <span className="brand-name">Plannif</span>
        </div>

        <nav className="nav-list">
          <li>
            <button
              type="button"
              className={`nav-item-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={18} /> Tableau de bord
            </button>
          </li>
          
          <li style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '16px 0 8px 16px', fontWeight: 600 }}>
            Données de base
          </li>

          <li>
            <button
              type="button"
              className={`nav-item-btn ${activeTab === 'profs' ? 'active' : ''}`}
              onClick={() => setActiveTab('profs')}
            >
              <Users size={18} /> Enseignants
            </button>
          </li>

          <li>
            <button
              type="button"
              className={`nav-item-btn ${activeTab === 'salles' ? 'active' : ''}`}
              onClick={() => setActiveTab('salles')}
            >
              <DoorOpen size={18} /> Salles de classe
            </button>
          </li>

          <li>
            <button
              type="button"
              className={`nav-item-btn ${activeTab === 'classes' ? 'active' : ''}`}
              onClick={() => setActiveTab('classes')}
            >
              <GraduationCap size={18} /> Classes & Élèves
            </button>
          </li>

          <li>
            <button
              type="button"
              className={`nav-item-btn ${activeTab === 'matieres' ? 'active' : ''}`}
              onClick={() => setActiveTab('matieres')}
            >
              <BookOpen size={18} /> Matières
            </button>
          </li>

          <li>
            <button
              type="button"
              className={`nav-item-btn ${activeTab === 'creneaux' ? 'active' : ''}`}
              onClick={() => setActiveTab('creneaux')}
            >
              <Calendar size={18} /> Créneaux Horaires
            </button>
          </li>

          <li style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '16px 0 8px 16px', fontWeight: 600 }}>
            Planification
          </li>

          <li>
            <button
              type="button"
              className={`nav-item-btn ${activeTab === 'seances' ? 'active' : ''}`}
              onClick={() => setActiveTab('seances')}
            >
              <Layers size={18} /> Séances à placer
            </button>
          </li>
        </nav>

        {/* Sidebar Footer Actions */}
        <div className="sidebar-footer">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'flex-start' }}
              onClick={handleExport}
            >
              <Download size={16} /> Exporter JSON
            </button>

            <label className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', cursor: 'pointer' }}>
              <Upload size={16} /> Importer JSON
              <input
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleImport}
              />
            </label>

            <button
              type="button"
              className="btn btn-danger"
              style={{ width: '100%', justifyContent: 'flex-start', marginTop: '8px' }}
              onClick={handleReset}
            >
              <RefreshCw size={16} /> Réinitialiser
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel Viewport */}
      <main className="main-content">
        {renderActiveView()}
      </main>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spinner {
          display: inline-block;
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <PlanningProvider>
      <MainApp />
    </PlanningProvider>
  );
}
