import { CalendarClock, Eye, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { Badge } from '../../../../shared/ui/Badge/Badge';
import { Button } from '../../../../shared/ui/Button/Button';
import { DataTable, TableScroll } from '../../../../shared/ui/DataTable/DataTable';
import { SortButton } from '../../../../shared/ui/DataTable/SortButton';
import { EmptyState } from '../../../../shared/ui/EmptyState/EmptyState';
import { useSortableData } from '../../../../shared/hooks/useSortableData';
import type { PlanningDTO } from '../../types/planning-saved.types';

interface Props { items: PlanningDTO[]; searchTerm: string; onSearchChange: (value: string) => void; onVisualize: (item: PlanningDTO) => void; onDelete: (id: number) => void; }
export function PlanningsTable({ items, searchTerm, onSearchChange, onVisualize, onDelete }: Props) {
  const filtered = items.filter((item) => item.nom.toLowerCase().includes(searchTerm.toLowerCase()));
  const selectors = useMemo(() => ({ nom: (item: PlanningDTO) => item.nom, date: (item: PlanningDTO) => item.dateCreation, seances: (item: PlanningDTO) => item.seances?.length ?? 0 }), []);
  const sorted = useSortableData(filtered, selectors);
  return <DataTable title="Plannings enregistrés" count={items.length} searchTerm={searchTerm} onSearchChange={onSearchChange} searchPlaceholder="Rechercher un planning…">{filtered.length === 0 ? <EmptyState compact icon={<CalendarClock size={20} />} title="Aucun planning enregistré" description="Les plannings sauvegardés par le backend apparaîtront ici." /> : <TableScroll><table className="entity-table"><thead><tr><th><SortButton label="Nom" columnKey="nom" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th><th><SortButton label="Créé le" columnKey="date" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th><th><SortButton label="Séances" columnKey="seances" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th><th style={{ width: 150 }}>Actions</th></tr></thead><tbody>{sorted.items.map((item) => <tr key={item.id ?? item.nom}><td className="entity-table__primary">{item.nom}</td><td>{item.dateCreation ? new Date(item.dateCreation).toLocaleString('fr-FR') : '—'}</td><td><Badge tone="primary">{item.seances?.length ?? 0} séances</Badge></td><td><div className="entity-table__actions"><Button variant="secondary" onClick={() => onVisualize(item)} icon={<Eye size={13} />}>Visualiser</Button><Button variant="icon" className="entity-table__action-delete" onClick={() => item.id && onDelete(item.id)} icon={<Trash2 size={14} />} /></div></td></tr>)}</tbody></table></TableScroll>}</DataTable>;
}
