import { useCallback, useEffect, useState } from 'react';
import { useToast } from '../../../../app/providers/useToast';
import { PageHeader } from '../../../../shared/ui/PageHeader/PageHeader';
import { creneauxApi } from '../../api/creneaux.api';
import { CreneauForm } from '../../components/CreneauForm/CreneauForm';
import { CreneauxTable } from '../../components/CreneauxTable/CreneauxTable';
import type { Creneau } from '../../types/creneau.types';
import './CreneauxPage.css';

export function CreneauxPage() {
  const { notify } = useToast(); const [items, setItems] = useState<Creneau[]>([]); const [search, setSearch] = useState(''); const [loading, setLoading] = useState(false); const [open, setOpen] = useState(false); const [mode, setMode] = useState<'create' | 'edit'>('create'); const [editing, setEditing] = useState<Creneau | null>(null);
  const load = useCallback(async () => { setLoading(true); try { setItems(await creneauxApi.list()); } catch { notify('Impossible de charger les créneaux.', 'error'); } finally { setLoading(false); } }, [notify]);
  useEffect(() => { void load(); }, [load]);
  const save = async (data: Creneau) => { setLoading(true); try { if (mode === 'create') await creneauxApi.create(data); else await creneauxApi.update(data); notify(mode === 'create' ? 'Créneau créé.' : 'Créneau mis à jour.'); setOpen(false); await load(); } catch (error) { notify(error instanceof Error ? error.message : "Erreur d'enregistrement.", 'error'); setLoading(false); } };
  const remove = async (id: number) => { if (!window.confirm('Supprimer ce créneau ?')) return; try { await creneauxApi.remove(id); notify('Créneau supprimé.'); setOpen(false); await load(); } catch (error) { notify(error instanceof Error ? error.message : 'Suppression impossible.', 'error'); } };
  const importCsv = async (file: File) => { try { await creneauxApi.importCsv(file); notify('Créneaux importés.'); await load(); } catch { notify("Échec de l'import CSV.", 'error'); } };
  const exportCsv = async () => { try { await creneauxApi.exportCsv(); } catch { notify("Échec de l'export CSV.", 'error'); } };
  return <div className="creneaux-page"><PageHeader title="Gestion des créneaux" description="Plages horaires réutilisables pour construire les séances." createLabel="Créneau" loading={loading} onCreate={() => { setMode('create'); setEditing(null); setOpen(true); }} onRefresh={load} onImport={importCsv} onExport={exportCsv} /><CreneauxTable items={items} searchTerm={search} onSearchChange={setSearch} onEdit={(item) => { setMode('edit'); setEditing(item); setOpen(true); }} onDelete={remove} /><CreneauForm open={open} mode={mode} item={editing} loading={loading} onClose={() => setOpen(false)} onSave={save} onDelete={remove} /></div>;
}
