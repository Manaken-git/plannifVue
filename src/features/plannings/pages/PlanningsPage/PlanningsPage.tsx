import { useCallback, useEffect, useState } from 'react';
import { useToast } from '../../../../app/providers/useToast';
import { PageHeader } from '../../../../shared/ui/PageHeader/PageHeader';
import { planningsApi } from '../../api/plannings.api';
import { PlanningsTable } from '../../components/PlanningsTable/PlanningsTable';
import type { PlanningDTO } from '../../types/planning-saved.types';
import './PlanningsPage.css';

interface Props { onVisualize: (planning: PlanningDTO) => void; }
export function PlanningsPage({ onVisualize }: Props) {
  const { notify } = useToast(); const [items, setItems] = useState<PlanningDTO[]>([]); const [search, setSearch] = useState(''); const [loading, setLoading] = useState(false);
  const load = useCallback(async () => { setLoading(true); try { setItems(await planningsApi.list()); } catch { notify('Impossible de charger les plannings enregistrés.', 'error'); } finally { setLoading(false); } }, [notify]);
  useEffect(() => { void load(); }, [load]);
  const remove = async (id: number) => { if (!window.confirm('Supprimer ce planning enregistré ?')) return; try { await planningsApi.remove(id); notify('Planning supprimé.'); await load(); } catch (error) { notify(error instanceof Error ? error.message : 'Suppression impossible.', 'error'); } };
  return <div className="plannings-page"><PageHeader title="Plannings enregistrés" description="Versions sauvegardées et résultats générés par le moteur de planning." loading={loading} onRefresh={load} /><PlanningsTable items={items} searchTerm={search} onSearchChange={setSearch} onVisualize={onVisualize} onDelete={remove} /></div>;
}
