import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '../../../../app/providers/ToastProvider';
import { PageHeader } from '../../../../shared/ui/PageHeader/PageHeader';
import { classesApi } from '../../../classes/api/classes.api';
import type { Classe } from '../../../classes/types/classe.types';
import { elevesApi } from '../../../eleves/api/eleves.api';
import { matieresApi } from '../../../matieres/api/matieres.api';
import type { Matiere } from '../../../matieres/types/matiere.types';
import { planningsApi } from '../../../plannings/api/plannings.api';
import type { PlanningDTO } from '../../../plannings/types/planning-saved.types';
import { professeursApi } from '../../../professeurs/api/professeurs.api';
import type { Professeur } from '../../../professeurs/types/professeur.types';
import { sallesApi } from '../../../salles/api/salles.api';
import type { Salle } from '../../../salles/types/salle.types';
import { planningApi } from '../../api/planning.api';
import { CalendarGrid } from '../../components/CalendarGrid/CalendarGrid';
import { PlanningStats } from '../../components/PlanningStats/PlanningStats';
import { SessionForm } from '../../components/SessionForm/SessionForm';
import type { CalendarFilter, Seance, SessionAssociations } from '../../types/planning.types';
import './PlanningPage.css';

interface Props {
  selectedPlanningId: number | null;
  onSelectedPlanningChange: (id: number | null) => void;
}

export function PlanningPage({ selectedPlanningId, onSelectedPlanningChange }: Props) {
  const { notify } = useToast();
  const [seances, setSeances] = useState<Seance[]>([]);
  const [professeurs, setProfesseurs] = useState<Professeur[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [plannings, setPlannings] = useState<PlanningDTO[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [filter, setFilter] = useState<CalendarFilter>({ type: 'all', value: '' });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [editing, setEditing] = useState<Seance | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sessions, professors, classList, subjects, rooms, savedPlannings, students] = await Promise.all([
        planningApi.list(),
        professeursApi.list().catch(() => []),
        classesApi.list().catch(() => []),
        matieresApi.list().catch(() => []),
        sallesApi.list().catch(() => []),
        planningsApi.list().catch(() => []),
        elevesApi.list().catch(() => []),
      ]);
      setSeances(sessions); setProfesseurs(professors); setClasses(classList); setMatieres(subjects); setSalles(rooms); setPlannings(savedPlannings); setStudentCount(students.length);
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Impossible de charger le planning.', 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { void load(); }, [load]);

  const sourceSessions = useMemo(() => plannings.find((planning) => planning.id === selectedPlanningId)?.seances ?? seances, [plannings, seances, selectedPlanningId]);
  const filteredSessions = useMemo(() => sourceSessions.filter((seance) => {
    if (filter.type === 'all' || !filter.value) return true;
    if (filter.type === 'professeur') return seance.professeurNomComplet === filter.value;
    if (filter.type === 'classe') return seance.classeNom === filter.value;
    if (filter.type === 'matiere') return seance.matiereNom === filter.value;
    if (filter.type === 'salle') return seance.salleCode === filter.value;
    return true;
  }), [sourceSessions, filter]);

  const save = async (data: Seance, associations: SessionAssociations) => {
    setLoading(true);
    try {
      if (mode === 'create') await planningApi.create(data, associations); else await planningApi.update(data, associations);
      notify(mode === 'create' ? 'Séance planifiée.' : 'Séance mise à jour.');
      setOpen(false); await load();
    } catch (error) {
      notify(error instanceof Error ? error.message : "Erreur lors de l'enregistrement de la séance.", 'error');
      setLoading(false);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm('Supprimer cette séance ?')) return;
    try { await planningApi.remove(id); notify('Séance supprimée.'); setOpen(false); await load(); }
    catch (error) { notify(error instanceof Error ? error.message : 'Suppression impossible.', 'error'); }
  };

  const importCsv = async (file: File) => { try { await planningApi.importCsv(file); notify('Séances importées.'); await load(); } catch { notify("Échec de l'import CSV.", 'error'); } };
  const exportCsv = async () => { try { await planningApi.exportCsv(); } catch { notify("Échec de l'export CSV.", 'error'); } };
  const create = () => { setMode('create'); setEditing(null); setOpen(true); };
  const edit = (seance: Seance) => { setMode('edit'); setEditing(seance); setOpen(true); };

  return (
    <div className="planning-page">
      <PageHeader title="Planning de la semaine" description="Visualisez, filtrez et organisez les séances de cours." createLabel="Nouvelle séance" loading={loading} onCreate={create} onRefresh={load} onImport={importCsv} onExport={exportCsv} />
      <PlanningStats sessions={sourceSessions.length} professors={professeurs.length} students={studentCount} rooms={salles.length} />
      <CalendarGrid seances={filteredSessions} professeurs={professeurs} classes={classes} matieres={matieres} salles={salles} plannings={plannings} selectedPlanningId={selectedPlanningId} onPlanningChange={onSelectedPlanningChange} filter={filter} onFilterChange={setFilter} onEdit={edit} onCreate={create} />
      <SessionForm open={open} mode={mode} item={editing} professeurs={professeurs} classes={classes} matieres={matieres} salles={salles} loading={loading} onClose={() => setOpen(false)} onSave={save} onDelete={remove} />
    </div>
  );
}
