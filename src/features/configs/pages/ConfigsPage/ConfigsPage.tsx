import { useCallback, useEffect, useState } from 'react';
import { useToast } from '../../../../app/providers/useToast';
import { PageHeader } from '../../../../shared/ui/PageHeader/PageHeader';
import { classesApi } from '../../../classes/api/classes.api';
import type { Classe } from '../../../classes/types/classe.types';
import { matieresApi } from '../../../matieres/api/matieres.api';
import type { Matiere } from '../../../matieres/types/matiere.types';
import { configsApi } from '../../api/configs.api';
import { ConfigForm } from '../../components/ConfigForm/ConfigForm';
import { ConfigsTable } from '../../components/ConfigsTable/ConfigsTable';
import type { MatiereClasseConfig } from '../../types/config.types';
import './ConfigsPage.css';

export function ConfigsPage() {
  const { notify } = useToast(); const [items, setItems] = useState<MatiereClasseConfig[]>([]); const [classes, setClasses] = useState<Classe[]>([]); const [matieres, setMatieres] = useState<Matiere[]>([]); const [search, setSearch] = useState(''); const [loading, setLoading] = useState(false); const [open, setOpen] = useState(false); const [mode, setMode] = useState<'create' | 'edit'>('create'); const [editing, setEditing] = useState<MatiereClasseConfig | null>(null);
  const load = useCallback(async () => { setLoading(true); try { const [configs, classList, subjects] = await Promise.all([configsApi.list(), classesApi.list().catch(() => []), matieresApi.list().catch(() => [])]); setItems(configs); setClasses(classList); setMatieres(subjects); } catch { notify('Impossible de charger les configurations.', 'error'); } finally { setLoading(false); } }, [notify]);
  useEffect(() => { void load(); }, [load]);
  const save = async (data: MatiereClasseConfig) => { setLoading(true); try { if (mode === 'create') await configsApi.create(data); else await configsApi.update(data); notify(mode === 'create' ? 'Configuration créée.' : 'Configuration mise à jour.'); setOpen(false); await load(); } catch (error) { notify(error instanceof Error ? error.message : "Erreur d'enregistrement.", 'error'); setLoading(false); } };
  const remove = async (id: number) => { if (!window.confirm('Supprimer cette configuration ?')) return; try { await configsApi.remove(id); notify('Configuration supprimée.'); setOpen(false); await load(); } catch (error) { notify(error instanceof Error ? error.message : 'Suppression impossible.', 'error'); } };
  const importCsv = async (file: File) => { try { await configsApi.importCsv(file); notify('Configurations importées.'); await load(); } catch { notify("Échec de l'import CSV.", 'error'); } };
  const exportCsv = async () => { try { await configsApi.exportCsv(); } catch { notify("Échec de l'export CSV.", 'error'); } };
  return <div className="configs-page"><PageHeader title="Configuration des matières" description="Volumes horaires par classe, matière et période." createLabel="Configuration" loading={loading} onCreate={() => { setMode('create'); setEditing(null); setOpen(true); }} onRefresh={load} onImport={importCsv} onExport={exportCsv} /><ConfigsTable items={items} searchTerm={search} onSearchChange={setSearch} onEdit={(item) => { setMode('edit'); setEditing(item); setOpen(true); }} onDelete={remove} /><ConfigForm open={open} mode={mode} item={editing} classes={classes} matieres={matieres} loading={loading} onClose={() => setOpen(false)} onSave={save} onDelete={remove} /></div>;
}
