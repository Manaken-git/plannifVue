import { useCallback, useEffect, useState } from 'react';
import { useToast } from '../../../../app/providers/ToastProvider';
import { PageHeader } from '../../../../shared/ui/PageHeader/PageHeader';
import { sallesApi } from '../../api/salles.api';
import { SalleForm } from '../../components/SalleForm/SalleForm';
import { SallesTable } from '../../components/SallesTable/SallesTable';
import type { Salle } from '../../types/salle.types';
import './SallesPage.css';

export function SallesPage() {
  const { notify } = useToast(); const [items, setItems] = useState<Salle[]>([]); const [search, setSearch] = useState(''); const [loading, setLoading] = useState(false); const [open, setOpen] = useState(false); const [mode, setMode] = useState<'create' | 'edit'>('create'); const [editing, setEditing] = useState<Salle | null>(null);
  const load = useCallback(async () => { setLoading(true); try { setItems(await sallesApi.list()); } catch { notify('Impossible de charger les salles.', 'error'); } finally { setLoading(false); } }, [notify]);
  useEffect(() => { void load(); }, [load]);
  const save = async (data: Salle) => { setLoading(true); try { if (mode === 'create') await sallesApi.create(data); else await sallesApi.update(data); notify(mode === 'create' ? 'Salle créée.' : 'Salle mise à jour.'); setOpen(false); await load(); } catch (error) { notify(error instanceof Error ? error.message : "Erreur d'enregistrement.", 'error'); setLoading(false); } };
  const remove = async (id: number) => { if (!window.confirm('Supprimer cette salle ?')) return; try { await sallesApi.remove(id); notify('Salle supprimée.'); setOpen(false); await load(); } catch (error) { notify(error instanceof Error ? error.message : 'Suppression impossible.', 'error'); } };
  const importCsv = async (file: File) => { try { await sallesApi.importCsv(file); notify('Salles importées.'); await load(); } catch { notify("Échec de l'import CSV.", 'error'); } };
  const exportCsv = async () => { try { await sallesApi.exportCsv(); } catch { notify("Échec de l'export CSV.", 'error'); } };
  return <div className="salles-page"><PageHeader title="Gestion des salles" description="Locaux disponibles, types et capacités d'accueil." createLabel="Salle" loading={loading} onCreate={() => { setMode('create'); setEditing(null); setOpen(true); }} onRefresh={load} onImport={importCsv} onExport={exportCsv} /><SallesTable items={items} searchTerm={search} onSearchChange={setSearch} onEdit={(item) => { setMode('edit'); setEditing(item); setOpen(true); }} onDelete={remove} /><SalleForm open={open} mode={mode} item={editing} loading={loading} onClose={() => setOpen(false)} onSave={save} onDelete={remove} /></div>;
}
