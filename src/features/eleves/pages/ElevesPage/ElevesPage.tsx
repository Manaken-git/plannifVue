import { useCallback, useEffect, useState } from 'react';
import { useToast } from '../../../../app/providers/ToastProvider';
import { PageHeader } from '../../../../shared/ui/PageHeader/PageHeader';
import { classesApi } from '../../../classes/api/classes.api';
import type { Classe } from '../../../classes/types/classe.types';
import { elevesApi } from '../../api/eleves.api';
import { EleveForm } from '../../components/EleveForm/EleveForm';
import { ElevesTable } from '../../components/ElevesTable/ElevesTable';
import type { Eleve } from '../../types/eleve.types';
import './ElevesPage.css';

export function ElevesPage() {
  const { notify } = useToast(); const [items, setItems] = useState<Eleve[]>([]); const [classes, setClasses] = useState<Classe[]>([]); const [search, setSearch] = useState(''); const [loading, setLoading] = useState(false); const [open, setOpen] = useState(false); const [mode, setMode] = useState<'create' | 'edit'>('create'); const [editing, setEditing] = useState<Eleve | null>(null);
  const load = useCallback(async () => { setLoading(true); try { const [students, classList] = await Promise.all([elevesApi.list(), classesApi.list().catch(() => [])]); setItems(students); setClasses(classList); } catch { notify('Impossible de charger les élèves.', 'error'); } finally { setLoading(false); } }, [notify]);
  useEffect(() => { void load(); }, [load]);
  const save = async (data: Eleve, classeId?: number) => { setLoading(true); try { if (mode === 'create') await elevesApi.create(data, classeId); else await elevesApi.update(data, classeId); notify(mode === 'create' ? 'Élève ajouté.' : 'Élève mis à jour.'); setOpen(false); await load(); } catch (error) { notify(error instanceof Error ? error.message : "Erreur d'enregistrement.", 'error'); setLoading(false); } };
  const remove = async (id: number) => { if (!window.confirm('Supprimer cet élève ?')) return; try { await elevesApi.remove(id); notify('Élève supprimé.'); setOpen(false); await load(); } catch (error) { notify(error instanceof Error ? error.message : 'Suppression impossible.', 'error'); } };
  const importCsv = async (file: File) => { try { await elevesApi.importCsv(file); notify('Élèves importés.'); await load(); } catch { notify("Échec de l'import CSV.", 'error'); } };
  const exportCsv = async () => { try { await elevesApi.exportCsv(); } catch { notify("Échec de l'export CSV.", 'error'); } };
  return <div className="eleves-page"><PageHeader title="Gestion des élèves" description="Inscriptions individuelles et rattachement aux classes." createLabel="Élève" loading={loading} onCreate={() => { setMode('create'); setEditing(null); setOpen(true); }} onRefresh={load} onImport={importCsv} onExport={exportCsv} /><ElevesTable items={items} classes={classes} searchTerm={search} onSearchChange={setSearch} onEdit={(item) => { setMode('edit'); setEditing(item); setOpen(true); }} onDelete={remove} /><EleveForm open={open} mode={mode} item={editing} classes={classes} loading={loading} onClose={() => setOpen(false)} onSave={save} onDelete={remove} /></div>;
}
