import { Edit2, Trash2, UserRoundCheck } from 'lucide-react';
import { useMemo } from 'react';
import { Badge } from '../../../../shared/ui/Badge/Badge';
import { Button } from '../../../../shared/ui/Button/Button';
import { DataTable, TableScroll } from '../../../../shared/ui/DataTable/DataTable';
import { SortButton } from '../../../../shared/ui/DataTable/SortButton';
import { EmptyState } from '../../../../shared/ui/EmptyState/EmptyState';
import { useSortableData } from '../../../../shared/hooks/useSortableData';
import type { Classe } from '../../../classes/types/classe.types';
import type { Eleve } from '../../types/eleve.types';

interface Props { items: Eleve[]; classes: Classe[]; searchTerm: string; onSearchChange: (value: string) => void; onEdit: (item: Eleve) => void; onDelete: (id: number) => void; }
export function ElevesTable({ items, classes, searchTerm, onSearchChange, onEdit, onDelete }: Props) {
  const q = searchTerm.toLowerCase();
  const filtered = items.filter((item) => `${item.nom} ${item.prenom}`.toLowerCase().includes(q));
  const selectors = useMemo(() => ({ nom: (item: Eleve) => item.nom, prenom: (item: Eleve) => item.prenom }), []);
  const sorted = useSortableData(filtered, selectors);
  const className = (id?: number) => classes.find((classe) => classe.id === id)?.nom;
  return <DataTable title="Élèves inscrits" count={items.length} searchTerm={searchTerm} onSearchChange={onSearchChange} searchPlaceholder="Rechercher un élève…">
    {filtered.length === 0 ? <EmptyState compact icon={<UserRoundCheck size={20} />} title="Aucun élève trouvé" description="Enregistrez les élèves puis rattachez-les à une classe." /> : <TableScroll><table className="entity-table"><thead><tr><th><SortButton label="Nom" columnKey="nom" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th><th><SortButton label="Prénom" columnKey="prenom" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th><th>Classe</th><th style={{ width: 90 }}>Actions</th></tr></thead><tbody>{sorted.items.map((item) => <tr key={item.id ?? `${item.nom}-${item.prenom}`}><td className="entity-table__primary">{item.nom}</td><td>{item.prenom}</td><td>{item.classeId ? <Badge tone="primary">{className(item.classeId) ?? `Classe #${item.classeId}`}</Badge> : <span className="entity-table__muted">Non renseignée</span>}</td><td><div className="entity-table__actions"><Button variant="icon" className="entity-table__action-edit" onClick={() => onEdit(item)} icon={<Edit2 size={14} />} /><Button variant="icon" className="entity-table__action-delete" onClick={() => item.id && onDelete(item.id)} icon={<Trash2 size={14} />} /></div></td></tr>)}</tbody></table></TableScroll>}
  </DataTable>;
}
