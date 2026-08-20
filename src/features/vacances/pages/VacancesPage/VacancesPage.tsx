import { useCallback, useEffect, useState } from 'react';
import { useToast } from '../../../../app/providers/ToastProvider';
import { PageHeader } from '../../../../shared/ui/PageHeader/PageHeader';
import { vacancesApi } from '../../api/vacances.api';
import { VacancesForm } from '../../components/VacancesForm/VacancesForm';
import { VacancesTable } from '../../components/VacancesTable/VacancesTable';
import type { Vacances } from '../../types/vacances.types';
import './VacancesPage.css';

export function VacancesPage() {
  const { notify } = useToast(); const [items, setItems] = useState<Vacances[]>([]); const [search, setSearch] = useState(''); const [loading, setLoading] = useState(false); const [open, setOpen] = useState(false); const [mode, setMode] = useState<'create' | 'edit'>('create'); const [editing, setEditing] = useState<Vacances | null>(null);
  const load = useCallback(async () => { setLoading(true); try { setItems(await vacancesApi.list()); } catch { notify('Impossible de charger les vacances.', 'error'); } finally { setLoading(false); } }, [notify]);
  useEffect(() => { void load(); }, [load]);
  const save = async (data: Vacances) => { setLoading(true); try { if (mode === 'create') await vacancesApi.create(data); else await vacancesApi.update(data); notify(mode === 'create' ? 'Période ajoutée.' : 'Période mise à jour.'); setOpen(false); await load(); } catch (error) { notify(error instanceof Error ? error.message : "Erreur d'enregistrement.", 'error'); setLoading(false); } };
  const remove = async (id: number) => { if (!window.confirm('Supprimer cette période ?')) return; try { await vacancesApi.remove(id); notify('Période supprimée.'); setOpen(false); await load(); } catch (error) { notify(error instanceof Error ? error.message : 'Suppression impossible.', 'error'); } };
  return <div className="vacances-page"><PageHeader title="Vacances scolaires" description="Périodes d'indisponibilité globales et jours fériés." createLabel="Période" loading={loading} onCreate={() => { setMode('create'); setEditing(null); setOpen(true); }} onRefresh={load} /><VacancesTable items={items} searchTerm={search} onSearchChange={setSearch} onEdit={(item) => { setMode('edit'); setEditing(item); setOpen(true); }} onDelete={remove} /><VacancesForm open={open} mode={mode} item={editing} loading={loading} onClose={() => setOpen(false)} onSave={save} onDelete={remove} /></div>;
}
