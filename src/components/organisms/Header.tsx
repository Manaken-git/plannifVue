import React from 'react';
import { Plus, Upload, Download } from 'lucide-react';
import { Button } from '../atoms/Button';
import type { Tab } from './Sidebar';

interface HeaderProps {
  activeTab: Tab;
  loading: boolean;
  onRefresh: () => void;
  onCreateClick: () => void;
  onImportSelect?: (file: File) => void;
  onExportClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeTab, 
  loading, 
  onRefresh, 
  onCreateClick,
  onImportSelect,
  onExportClick
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Planning de la Semaine';
      case 'professeurs': return 'Gestion des Professeurs';
      case 'classes': return 'Gestion des Classes';
      case 'eleves': return 'Gestion des Élèves';
      case 'matieres': return 'Gestion des Matières';
      case 'salles': return 'Gestion des Salles';
      case 'creneaux': return 'Gestion des Créneaux Horaires';
      case 'configs': return 'Configurations Matières/Classes';
      case 'vacances': return 'Gestion des Vacances';
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
      case 'creneaux': return 'Plages et créneaux horaires de cours';
      case 'configs': return 'Configurations de volume horaire par classe et matière';
      case 'vacances': return 'Calendrier des vacances scolaires et jours fériés';
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
      case 'creneaux': return 'Créneau';
      case 'configs': return 'Configuration';
      case 'vacances': return 'Période';
      default: return '';
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportSelect) {
      onImportSelect(file);
      e.target.value = '';
    }
  };

  return (
    <header className="header-container">
      <div className="header-title">
        <h1>{getTitle()}</h1>
        <p>{getDescription()}</p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept=".csv" 
          onChange={handleFileChange} 
        />
        {onImportSelect && (
          <Button 
            variant="secondary" 
            onClick={handleImportClick} 
            disabled={loading}
            icon={<Upload size={16} />}
          >
            Importer CSV
          </Button>
        )}
        {onExportClick && (
          <Button 
            variant="secondary" 
            onClick={onExportClick} 
            disabled={loading}
            icon={<Download size={16} />}
          >
            Exporter CSV
          </Button>
        )}
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
