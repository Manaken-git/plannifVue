import { Home, Edit2, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { Badge } from '../../../../shared/ui/Badge/Badge';
import { Button } from '../../../../shared/ui/Button/Button';
import { DataTable, TableScroll } from '../../../../shared/ui/DataTable/DataTable';
import { SortButton } from '../../../../shared/ui/DataTable/SortButton';
import { EmptyState } from '../../../../shared/ui/EmptyState/EmptyState';
import { useSortableData } from '../../../../shared/hooks/useSortableData';
import type { Salle } from '../../types/salle.types';

interface Props { items: Salle[]; searchTerm: string; onSearchChange: (value: string) => void; onEdit: (item: Salle) => void; onDelete: (id: number) => void; }
export function SallesTable({ items, searchTerm, onSearchChange, onEdit, onDelete }: Props) {
  const q = searchTerm.toLowerCase();
  const filtered = items.filter((item) => `${item.code} ${item.type}`.toLowerCase().includes(q));
  const selectors = useMemo(() => ({ code: (item: Salle) => item.code, capacite: (item: Salle) => item.capacite, type: (item: Salle) => item.type }), []);
  const sorted = useSortableData(filtered, selectors);
  return <DataTable title="Salles configurées" count={items.length} searchTerm={searchTerm} onSearchChange={onSearchChange} searchPlaceholder="Rechercher une salle…">
    {filtered.length === 0 ? <EmptyState compact icon={<Home size={20} />} title="Aucune salle trouvée" description="Ajoutez les locaux disponibles, leur capacité et leur type." /> : <TableScroll><table className="entity-table"><thead><tr><th><SortButton label="Code" columnKey="code" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th><th><SortButton label="Capacité" columnKey="capacite" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th><th><SortButton label="Type" columnKey="type" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th><th style={{ width: 90 }}>Actions</th></tr></thead><tbody>{sorted.items.map((item) => <tr key={item.id ?? item.code}><td className="entity-table__primary">{item.code}</td><td>{item.capacite} places</td><td><Badge tone="primary">{item.type}</Badge></td><td><div className="entity-table__actions"><Button variant="icon" className="entity-table__action-edit" onClick={() => onEdit(item)} icon={<Edit2 size={14} />} /><Button variant="icon" className="entity-table__action-delete" onClick={() => item.id && onDelete(item.id)} icon={<Trash2 size={14} />} /></div></td></tr>)}</tbody></table></TableScroll>}
  </DataTable>;
}
