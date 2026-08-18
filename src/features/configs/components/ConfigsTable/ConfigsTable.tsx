import { Edit2, SlidersHorizontal, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { Badge } from '../../../../shared/ui/Badge/Badge';
import { Button } from '../../../../shared/ui/Button/Button';
import { DataTable, TableScroll } from '../../../../shared/ui/DataTable/DataTable';
import { SortButton } from '../../../../shared/ui/DataTable/SortButton';
import { EmptyState } from '../../../../shared/ui/EmptyState/EmptyState';
import { useSortableData } from '../../../../shared/hooks/useSortableData';
import type { MatiereClasseConfig } from '../../types/config.types';

interface Props { items: MatiereClasseConfig[]; searchTerm: string; onSearchChange: (value: string) => void; onEdit: (item: MatiereClasseConfig) => void; onDelete: (id: number) => void; }
const dateLabel = (value?: string | null) => value ? value.split('-').reverse().join('/') : 'Non définie';
export function ConfigsTable({ items, searchTerm, onSearchChange, onEdit, onDelete }: Props) {
  const q = searchTerm.toLowerCase(); const filtered = items.filter((item) => `${item.classeNom ?? ''} ${item.matiereNom ?? ''}`.toLowerCase().includes(q));
  const selectors = useMemo(() => ({ classe: (item: MatiereClasseConfig) => item.classeNom ?? '', matiere: (item: MatiereClasseConfig) => item.matiereNom ?? '', debut: (item: MatiereClasseConfig) => item.dateDebut ?? '', volume: (item: MatiereClasseConfig) => item.volumeHorairePeriode ?? 0 }), []);
  const sorted = useSortableData(filtered, selectors);
  return <DataTable title="Configurations matières / classes" count={items.length} searchTerm={searchTerm} onSearchChange={onSearchChange} searchPlaceholder="Rechercher une classe ou matière…">{filtered.length === 0 ? <EmptyState compact icon={<SlidersHorizontal size={20} />} title="Aucune configuration" description="Associez une matière à une classe avec son volume horaire et sa période de validité." /> : <TableScroll><table className="entity-table"><thead><tr><th><SortButton label="Classe" columnKey="classe" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th><th><SortButton label="Matière" columnKey="matiere" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th><th><SortButton label="Début" columnKey="debut" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th><th>Fin</th><th><SortButton label="Volume" columnKey="volume" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th><th style={{ width: 90 }}>Actions</th></tr></thead><tbody>{sorted.items.map((item) => <tr key={item.id ?? `${item.classeId}-${item.matiereId}`}><td className="entity-table__primary">{item.classeNom ?? `Classe #${item.classeId}`}</td><td><Badge tone="warning">{item.matiereNom ?? `Matière #${item.matiereId}`}</Badge></td><td>{dateLabel(item.dateDebut)}</td><td>{dateLabel(item.dateFin)}</td><td>{item.volumeHorairePeriode != null ? <Badge tone="primary">{item.volumeHorairePeriode} h</Badge> : <span className="entity-table__muted">—</span>}</td><td><div className="entity-table__actions"><Button variant="icon" className="entity-table__action-edit" onClick={() => onEdit(item)} icon={<Edit2 size={14} />} /><Button variant="icon" className="entity-table__action-delete" onClick={() => item.id && onDelete(item.id)} icon={<Trash2 size={14} />} /></div></td></tr>)}</tbody></table></TableScroll>}</DataTable>;
}
