import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../atoms/Button';
import type { Tab } from './Sidebar';

interface HeaderProps {
  activeTab: Tab;
  loading: boolean;
  onRefresh: () => void;
  onCreateClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeTab, 
  loading, 
  onRefresh, 
  onCreateClick 
}) => {
  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Planning de la Semaine';
      case 'professeurs': return 'Gestion des Professeurs';
      case 'classes': return 'Gestion des Classes';
      case 'eleves': return 'Gestion des Élèves';
      case 'matieres': return 'Gestion des Matières';
      case 'salles': return 'Gestion des Salles';
      default: return '';
    }
  };

  const getDescription = () => {
    switch (activeTab) {
      case 'dashboard': return 'Visualisez et organisez les séances de cours';
      case 'professeurs': return 'Liste et affectation des enseignants';
      case 'classes': return 'Groupes scolaires et promotions';
      case 'eleves': return 'Gestion individuelle des élèves';
      case 'matieres': return 'Catalogue des cours enseignés';
      case 'salles': return 'Locaux et capacités d\'accueil';
      default: return '';
    }
  };

  const getCreateLabel = () => {
    switch (activeTab) {
      case 'dashboard': return 'Séance';
      case 'professeurs': return 'Professeur';
      case 'classes': return 'Classe';
      case 'eleves': return 'Élève';
      case 'matieres': return 'Matière';
      case 'salles': return 'Salle';
      default: return '';
    }
  };

  return (
    <header className="header-container">
      <div className="header-title">
        <h1>{getTitle()}</h1>
        <p>{getDescription()}</p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Button variant="secondary" onClick={onRefresh} disabled={loading}>
          Actualiser
        </Button>
        <Button 
          variant="primary" 
          onClick={onCreateClick}
          icon={<Plus size={16} />}
        >
          {getCreateLabel()}
        </Button>
      </div>
    </header>
  );
};
