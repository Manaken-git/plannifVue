import { BookOpen, Edit2, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { Button } from '../../../../shared/ui/Button/Button';
import { DataTable, TableScroll } from '../../../../shared/ui/DataTable/DataTable';
import { SortButton } from '../../../../shared/ui/DataTable/SortButton';
import { EmptyState } from '../../../../shared/ui/EmptyState/EmptyState';
import { useSortableData } from '../../../../shared/hooks/useSortableData';
import type { Matiere } from '../../types/matiere.types';

interface Props {
  items: Matiere[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onEdit: (item: Matiere) => void;
  onDelete: (id: number) => void;
}

export function MatieresTable({ items, searchTerm, onSearchChange, onEdit, onDelete }: Props) {
  const filtered = items.filter((item) => item.nom.toLowerCase().includes(searchTerm.toLowerCase()));
  const selectors = useMemo(() => ({ nom: (item: Matiere) => item.nom }), []);
  const sorted = useSortableData(filtered, selectors);

  return (
    <DataTable title="Catalogue des matières" count={items.length} searchTerm={searchTerm} onSearchChange={onSearchChange} searchPlaceholder="Rechercher une matière…">
      {filtered.length === 0 ? (
        <EmptyState compact icon={<BookOpen size={20} />} title="Aucune matière trouvée" description="Ajoutez les matières enseignées pour pouvoir les utiliser dans le planning." />
      ) : (
        <TableScroll>
          <table className="entity-table">
            <thead><tr><th><SortButton label="Matière" columnKey="nom" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th><th style={{ width: 90 }}>Actions</th></tr></thead>
            <tbody>{sorted.items.map((item) => (
              <tr key={item.id ?? item.nom}>
                <td className="entity-table__primary">{item.nom}</td>
                <td><div className="entity-table__actions"><Button variant="icon" className="entity-table__action-edit" onClick={() => onEdit(item)} icon={<Edit2 size={14} />} /><Button variant="icon" className="entity-table__action-delete" onClick={() => item.id && onDelete(item.id)} icon={<Trash2 size={14} />} /></div></td>
              </tr>
            ))}</tbody>
          </table>
        </TableScroll>
      )}
    </DataTable>
  );
}
