import { Edit2, Trash2, UsersRound } from 'lucide-react';
import { useMemo } from 'react';
import { Badge } from '../../../../shared/ui/Badge/Badge';
import { Button } from '../../../../shared/ui/Button/Button';
import { DataTable, TableScroll } from '../../../../shared/ui/DataTable/DataTable';
import { SortButton } from '../../../../shared/ui/DataTable/SortButton';
import { EmptyState } from '../../../../shared/ui/EmptyState/EmptyState';
import { useSortableData } from '../../../../shared/hooks/useSortableData';
import type { Classe } from '../../types/classe.types';

interface Props { items: Classe[]; searchTerm: string; onSearchChange: (value: string) => void; onEdit: (item: Classe) => void; onDelete: (id: number) => void; }
const dateLabel = (value: string) => value ? new Date(`${value}T12:00:00`).toLocaleDateString('fr-FR') : '—';

export function ClassesTable({ items, searchTerm, onSearchChange, onEdit, onDelete }: Props) {
  const filtered = items.filter((item) => item.nom.toLowerCase().includes(searchTerm.toLowerCase()));
  const selectors = useMemo(() => ({ nom: (item: Classe) => item.nom, presences: (item: Classe) => item.presences?.[0]?.dateDebut ?? '' }), []);
  const sorted = useSortableData(filtered, selectors);
  return <DataTable title="Classes enregistrées" count={items.length} searchTerm={searchTerm} onSearchChange={onSearchChange} searchPlaceholder="Rechercher une classe…">
    {filtered.length === 0 ? <EmptyState compact icon={<UsersRound size={20} />} title="Aucune classe trouvée" description="Créez vos groupes ou promotions avant d'y rattacher des élèves." /> : <TableScroll><table className="entity-table"><thead><tr><th><SortButton label="Classe" columnKey="nom" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th><th><SortButton label="Périodes de présence" columnKey="presences" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th><th style={{ width: 90 }}>Actions</th></tr></thead><tbody>{sorted.items.map((item) => <tr key={item.id ?? item.nom}><td className="entity-table__primary">{item.nom}</td><td>{item.presences?.length ? <div className="entity-table__chips">{item.presences.map((period, index) => <Badge key={period.id ?? `${period.dateDebut}-${index}`} tone="info">{dateLabel(period.dateDebut)} → {dateLabel(period.dateFin)}</Badge>)}</div> : <span className="entity-table__muted">Aucune période</span>}</td><td><div className="entity-table__actions"><Button variant="icon" className="entity-table__action-edit" onClick={() => onEdit(item)} icon={<Edit2 size={14} />} /><Button variant="icon" className="entity-table__action-delete" onClick={() => item.id && onDelete(item.id)} icon={<Trash2 size={14} />} /></div></td></tr>)}</tbody></table></TableScroll>}
  </DataTable>;
}
