import { useCallback, useEffect, useState } from 'react';
import { useToast } from '../../../../app/providers/useToast';
import { PageHeader } from '../../../../shared/ui/PageHeader/PageHeader';
import { classesApi } from '../../api/classes.api';
import { ClasseForm } from '../../components/ClasseForm/ClasseForm';
import { ClassesTable } from '../../components/ClassesTable/ClassesTable';
import type { Classe } from '../../types/classe.types';
import './ClassesPage.css';

export function ClassesPage() {
  const { notify } = useToast(); const [items, setItems] = useState<Classe[]>([]); const [search, setSearch] = useState(''); const [loading, setLoading] = useState(false); const [open, setOpen] = useState(false); const [mode, setMode] = useState<'create' | 'edit'>('create'); const [editing, setEditing] = useState<Classe | null>(null);
  const load = useCallback(async () => { setLoading(true); try { setItems(await classesApi.list()); } catch { notify('Impossible de charger les classes.', 'error'); } finally { setLoading(false); } }, [notify]);
  useEffect(() => { void load(); }, [load]);
  const save = async (data: Classe) => { setLoading(true); try { if (mode === 'create') await classesApi.create(data); else await classesApi.update(data); notify(mode === 'create' ? 'Classe créée.' : 'Classe mise à jour.'); setOpen(false); await load(); } catch (error) { notify(error instanceof Error ? error.message : "Erreur d'enregistrement.", 'error'); setLoading(false); } };
  const remove = async (id: number) => { if (!window.confirm('Supprimer cette classe ?')) return; try { await classesApi.remove(id); notify('Classe supprimée.'); setOpen(false); await load(); } catch (error) { notify(error instanceof Error ? error.message : 'Suppression impossible.', 'error'); } };
  const importCsv = async (file: File) => { try { await classesApi.importCsv(file); notify('Classes importées.'); await load(); } catch { notify("Échec de l'import CSV.", 'error'); } };
  const exportCsv = async () => { try { await classesApi.exportCsv(); } catch { notify("Échec de l'export CSV.", 'error'); } };
  return <div className="classes-page"><PageHeader title="Gestion des classes" description="Groupes scolaires, promotions et périodes de présence." createLabel="Classe" loading={loading} onCreate={() => { setMode('create'); setEditing(null); setOpen(true); }} onRefresh={load} onImport={importCsv} onExport={exportCsv} /><ClassesTable items={items} searchTerm={search} onSearchChange={setSearch} onEdit={(item) => { setMode('edit'); setEditing(item); setOpen(true); }} onDelete={remove} /><ClasseForm open={open} mode={mode} item={editing} loading={loading} onClose={() => setOpen(false)} onSave={save} onDelete={remove} /></div>;
}
