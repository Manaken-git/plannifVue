import { useCallback, useEffect, useState } from 'react';
import { useToast } from '../../../../app/providers/useToast';
import { PageHeader } from '../../../../shared/ui/PageHeader/PageHeader';
import { matieresApi } from '../../../matieres/api/matieres.api';
import type { Matiere } from '../../../matieres/types/matiere.types';
import { professeursApi } from '../../api/professeurs.api';
import { ProfesseurForm } from '../../components/ProfesseurForm/ProfesseurForm';
import { ProfesseursTable } from '../../components/ProfesseursTable/ProfesseursTable';
import type { Professeur } from '../../types/professeur.types';
import './ProfesseursPage.css';

export function ProfesseursPage() {
  const { notify } = useToast(); const [items, setItems] = useState<Professeur[]>([]); const [matieres, setMatieres] = useState<Matiere[]>([]); const [search, setSearch] = useState(''); const [loading, setLoading] = useState(false); const [open, setOpen] = useState(false); const [mode, setMode] = useState<'create' | 'edit'>('create'); const [editing, setEditing] = useState<Professeur | null>(null);
  const load = useCallback(async () => { setLoading(true); try { const [profs, subjects] = await Promise.all([professeursApi.list(), matieresApi.list().catch(() => [])]); setItems(profs); setMatieres(subjects); } catch { notify('Impossible de charger les professeurs.', 'error'); } finally { setLoading(false); } }, [notify]);
  useEffect(() => { void load(); }, [load]);
  const save = async (data: Professeur) => { setLoading(true); try { if (mode === 'create') await professeursApi.create(data); else await professeursApi.update(data); notify(mode === 'create' ? 'Professeur créé.' : 'Professeur mis à jour.'); setOpen(false); await load(); } catch (error) { notify(error instanceof Error ? error.message : "Erreur d'enregistrement.", 'error'); setLoading(false); } };
  const remove = async (id: number) => { if (!window.confirm('Supprimer ce professeur ?')) return; try { await professeursApi.remove(id); notify('Professeur supprimé.'); setOpen(false); await load(); } catch (error) { notify(error instanceof Error ? error.message : 'Suppression impossible.', 'error'); } };
  const importCsv = async (file: File) => { try { await professeursApi.importCsv(file); notify('Professeurs importés.'); await load(); } catch { notify("Échec de l'import CSV.", 'error'); } };
  const exportCsv = async () => { try { await professeursApi.exportCsv(); } catch { notify("Échec de l'export CSV.", 'error'); } };
  return <div className="professeurs-page"><PageHeader title="Gestion des professeurs" description="Enseignants, matières, volumes et contraintes de disponibilité." createLabel="Professeur" loading={loading} onCreate={() => { setMode('create'); setEditing(null); setOpen(true); }} onRefresh={load} onImport={importCsv} onExport={exportCsv} /><ProfesseursTable items={items} searchTerm={search} onSearchChange={setSearch} onEdit={(item) => { setMode('edit'); setEditing(item); setOpen(true); }} onDelete={remove} /><ProfesseurForm open={open} mode={mode} item={editing} matieres={matieres} loading={loading} onClose={() => setOpen(false)} onSave={save} onDelete={remove} /></div>;
}
