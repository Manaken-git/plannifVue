import { CalendarRange, Edit2, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { Button } from '../../../../shared/ui/Button/Button';
import { DataTable, TableScroll } from '../../../../shared/ui/DataTable/DataTable';
import { SortButton } from '../../../../shared/ui/DataTable/SortButton';
import { EmptyState } from '../../../../shared/ui/EmptyState/EmptyState';
import { useSortableData } from '../../../../shared/hooks/useSortableData';
import type { Vacances } from '../../types/vacances.types';

interface Props { items: Vacances[]; searchTerm: string; onSearchChange: (value: string) => void; onEdit: (item: Vacances) => void; onDelete: (id: number) => void; }
const formatDate = (value: string) => value ? new Date(`${value}T12:00:00`).toLocaleDateString('fr-FR') : '—';

export function VacancesTable({ items, searchTerm, onSearchChange, onEdit, onDelete }: Props) {
  const filtered = items.filter((item) => item.nom.toLowerCase().includes(searchTerm.toLowerCase()));
  const selectors = useMemo(() => ({ nom: (item: Vacances) => item.nom, dateDebut: (item: Vacances) => item.dateDebut, dateFin: (item: Vacances) => item.dateFin }), []);
  const sorted = useSortableData(filtered, selectors);
  return <DataTable title="Périodes de vacances" count={items.length} searchTerm={searchTerm} onSearchChange={onSearchChange} searchPlaceholder="Rechercher une période…">
    {filtered.length === 0 ? <EmptyState compact icon={<CalendarRange size={20} />} title="Aucune période enregistrée" description="Ajoutez les vacances scolaires et jours fériés pour les exclure du planning." /> : <TableScroll><table className="entity-table"><thead><tr><th><SortButton label="Nom" columnKey="nom" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th><th><SortButton label="Début" columnKey="dateDebut" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th><th><SortButton label="Fin" columnKey="dateFin" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th><th style={{ width: 90 }}>Actions</th></tr></thead><tbody>{sorted.items.map((item) => <tr key={item.id ?? `${item.nom}-${item.dateDebut}`}><td className="entity-table__primary">{item.nom}</td><td>{formatDate(item.dateDebut)}</td><td>{formatDate(item.dateFin)}</td><td><div className="entity-table__actions"><Button variant="icon" className="entity-table__action-edit" onClick={() => onEdit(item)} icon={<Edit2 size={14} />} /><Button variant="icon" className="entity-table__action-delete" onClick={() => item.id && onDelete(item.id)} icon={<Trash2 size={14} />} /></div></td></tr>)}</tbody></table></TableScroll>}
  </DataTable>;
}
