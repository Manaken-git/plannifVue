import { useCallback, useEffect, useState } from 'react';
import { useToast } from '../../../../app/providers/ToastProvider';
import { PageHeader } from '../../../../shared/ui/PageHeader/PageHeader';
import { matieresApi } from '../../api/matieres.api';
import { MatiereForm } from '../../components/MatiereForm/MatiereForm';
import { MatieresTable } from '../../components/MatieresTable/MatieresTable';
import type { Matiere } from '../../types/matiere.types';
import './MatieresPage.css';

export function MatieresPage() {
  const { notify } = useToast();
  const [items, setItems] = useState<Matiere[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [editing, setEditing] = useState<Matiere | null>(null);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await matieresApi.list()); }
    catch { notify('Impossible de charger les matières.', 'error'); }
    finally { setLoading(false); }
  }, [notify]);
  useEffect(() => { void load(); }, [load]);

  const save = async (data: Matiere) => {
    setLoading(true);
    try {
      if (mode === 'create') await matieresApi.create(data); else await matieresApi.update(data);
      notify(mode === 'create' ? 'Matière créée.' : 'Matière mise à jour.');
      setOpen(false); await load();
    } catch (error) { notify(error instanceof Error ? error.message : "Erreur lors de l'enregistrement.", 'error'); setLoading(false); }
  };
  const remove = async (id: number) => {
    if (!window.confirm('Supprimer cette matière ?')) return;
    try { await matieresApi.remove(id); notify('Matière supprimée.'); setOpen(false); await load(); }
    catch (error) { notify(error instanceof Error ? error.message : 'Suppression impossible.', 'error'); }
  };
  const importCsv = async (file: File) => { try { await matieresApi.importCsv(file); notify('Matières importées.'); await load(); } catch { notify("Échec de l'import CSV.", 'error'); } };
  const exportCsv = async () => { try { await matieresApi.exportCsv(); } catch { notify("Échec de l'export CSV.", 'error'); } };

  return <div className="feature-page"><PageHeader title="Gestion des matières" description="Catalogue des cours enseignés et utilisés dans le planning." createLabel="Matière" loading={loading} onCreate={() => { setMode('create'); setEditing(null); setOpen(true); }} onRefresh={load} onImport={importCsv} onExport={exportCsv} /><MatieresTable items={items} searchTerm={searchTerm} onSearchChange={setSearchTerm} onEdit={(item) => { setMode('edit'); setEditing(item); setOpen(true); }} onDelete={remove} /><MatiereForm open={open} mode={mode} item={editing} loading={loading} onClose={() => setOpen(false)} onSave={save} onDelete={remove} /></div>;
}
