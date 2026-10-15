import { useCallback, useEffect, useState } from 'react';
import { useToast } from '../../../../app/providers/useToast';
import { PageHeader } from '../../../../shared/ui/PageHeader/PageHeader';
import { planningsApi } from '../../api/plannings.api';
import { PlanningsTable } from '../../components/PlanningsTable/PlanningsTable';
import { SeancesNonPlanifieesModal } from '../../components/SeancesNonPlanifieesModal/SeancesNonPlanifieesModal';
import type { PlanningDTO, SeanceNonPlanifieeDTO } from '../../types/planning-saved.types';
import './PlanningsPage.css';

interface Props {
  onVisualize: (planning: PlanningDTO) => void;
}

export function PlanningsPage({ onVisualize }: Props) {
  const { notify } = useToast();
  const [items, setItems] = useState<PlanningDTO[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedForUnplanned, setSelectedForUnplanned] = useState<{
    nom: string;
    seances: SeanceNonPlanifieeDTO[];
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await planningsApi.list());
    } catch {
      notify('Impossible de charger les plannings enregistrés.', 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    void load();
  }, [load]);

  const viewUnplanned = async (item: PlanningDTO) => {
    if (item.seancesNonPlanifiees && item.seancesNonPlanifiees.length > 0) {
      setSelectedForUnplanned({ nom: item.nom, seances: item.seancesNonPlanifiees });
      return;
    }
    if (item.id) {
      try {
        const fetched = await planningsApi.getSeancesNonPlanifiees(item.id);
        setSelectedForUnplanned({ nom: item.nom, seances: fetched });
        return;
      } catch {
        notify('Impossible de récupérer le détail des séances non planifiées.', 'error');
      }
    }
    setSelectedForUnplanned({ nom: item.nom, seances: [] });
  };

  const remove = async (id: number) => {
    if (!window.confirm('Supprimer ce planning enregistré ?')) return;
    try {
      await planningsApi.remove(id);
      notify('Planning supprimé.');
      await load();
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Suppression impossible.', 'error');
    }
  };

  return (
    <div className="plannings-page">
      <PageHeader
        title="Plannings enregistrés"
        description="Versions sauvegardées et résultats générés par le moteur de planning."
        loading={loading}
        onRefresh={load}
      />
      <PlanningsTable
        items={items}
        searchTerm={search}
        onSearchChange={setSearch}
        onVisualize={onVisualize}
        onViewUnplanned={viewUnplanned}
        onDelete={remove}
      />
      <SeancesNonPlanifieesModal
        open={Boolean(selectedForUnplanned)}
        onClose={() => setSelectedForUnplanned(null)}
        planningName={selectedForUnplanned?.nom}
        items={selectedForUnplanned?.seances ?? []}
      />
    </div>
  );
}
