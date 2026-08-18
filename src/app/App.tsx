import { useState } from 'react';
import { ClassesPage } from '../features/classes/pages/ClassesPage/ClassesPage';
import { ConfigsPage } from '../features/configs/pages/ConfigsPage/ConfigsPage';
import { CreneauxPage } from '../features/creneaux/pages/CreneauxPage/CreneauxPage';
import { ElevesPage } from '../features/eleves/pages/ElevesPage/ElevesPage';
import { MatieresPage } from '../features/matieres/pages/MatieresPage/MatieresPage';
import { PlanningPage } from '../features/planning/pages/PlanningPage/PlanningPage';
import { PlanningsPage } from '../features/plannings/pages/PlanningsPage/PlanningsPage';
import type { PlanningDTO } from '../features/plannings/types/planning-saved.types';
import { ProfesseursPage } from '../features/professeurs/pages/ProfesseursPage/ProfesseursPage';
import { SallesPage } from '../features/salles/pages/SallesPage/SallesPage';
import { VacancesPage } from '../features/vacances/pages/VacancesPage/VacancesPage';
import { AppShell } from './layout/AppShell/AppShell';
import type { AppTab } from './navigation/navigation.types';

export function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('planning');
  const [selectedPlanningId, setSelectedPlanningId] = useState<number | null>(null);

  const openSavedPlanning = (planning: PlanningDTO) => {
    setSelectedPlanningId(planning.id ?? null);
    setActiveTab('planning');
  };

  const content = (() => {
    switch (activeTab) {
      case 'planning':
        return <PlanningPage selectedPlanningId={selectedPlanningId} onSelectedPlanningChange={setSelectedPlanningId} />;
      case 'creneaux':
        return <CreneauxPage />;
      case 'plannings':
        return <PlanningsPage onVisualize={openSavedPlanning} />;
      case 'professeurs':
        return <ProfesseursPage />;
      case 'classes':
        return <ClassesPage />;
      case 'eleves':
        return <ElevesPage />;
      case 'matieres':
        return <MatieresPage />;
      case 'salles':
        return <SallesPage />;
      case 'configs':
        return <ConfigsPage />;
      case 'vacances':
        return <VacancesPage />;
    }
  })();

  return <AppShell activeTab={activeTab} onTabChange={setActiveTab}>{content}</AppShell>;
}
