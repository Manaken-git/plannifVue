import { Clock3, Edit2, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { Badge } from '../../../../shared/ui/Badge/Badge';
import { Button } from '../../../../shared/ui/Button/Button';
import { DataTable, TableScroll } from '../../../../shared/ui/DataTable/DataTable';
import { SortButton } from '../../../../shared/ui/DataTable/SortButton';
import { EmptyState } from '../../../../shared/ui/EmptyState/EmptyState';
import { useSortableData } from '../../../../shared/hooks/useSortableData';
import type { Creneau } from '../../types/creneau.types';

interface Props { items: Creneau[]; searchTerm: string; onSearchChange: (value: string) => void; onEdit: (item: Creneau) => void; onDelete: (id: number) => void; }
const shortTime = (value: string) => {
  if (!value) return '—';
  const timePart = value.includes('T') ? value.split('T')[1] : value;
  return timePart.slice(0, 5) || '—';
};

export function CreneauxTable({ items, searchTerm, onSearchChange, onEdit, onDelete }: Props) {
  const filtered = items.filter((item) => `${item.debut} ${item.fin} ${item.typeClasse || ''}`.toLowerCase().includes(searchTerm.toLowerCase()));
  const selectors = useMemo(() => ({
    debut: (item: Creneau) => item.debut,
    fin: (item: Creneau) => item.fin,
    typeClasse: (item: Creneau) => item.typeClasse || ''
  }), []);
  const sorted = useSortableData(filtered, selectors);
  return <DataTable title="Créneaux horaires" count={items.length} searchTerm={searchTerm} onSearchChange={onSearchChange} searchPlaceholder="Rechercher une heure ou un type…">
    {filtered.length === 0 ? <EmptyState compact icon={<Clock3 size={20} />} title="Aucun créneau" description="Créez les plages horaires qui serviront de base au planning." /> : <TableScroll><table className="entity-table"><thead><tr><th><SortButton label="Début" columnKey="debut" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th><th><SortButton label="Fin" columnKey="fin" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th><th>Durée</th><th><SortButton label="Type" columnKey="typeClasse" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th><th style={{ width: 90 }}>Actions</th></tr></thead><tbody>{sorted.items.map((item) => {
      const getCleanTime = (val: string) => val?.includes('T') ? val.split('T')[1] : val;
      const startTime = getCleanTime(item.debut);
      const endTime = getCleanTime(item.fin);
      const [dh, dm] = startTime.split(':').map(Number);
      const [fh, fm] = endTime.split(':').map(Number);
      const duration = Number.isFinite(dh + dm + fh + fm) ? Math.max(0, (fh * 60 + fm) - (dh * 60 + dm)) : 0;
      const getBadgeTone = (type?: string) => {
        if (type === 'TP') return 'warning';
        if (type === 'Examen') return 'danger';
        if (type === 'Cours') return 'info';
        return 'neutral';
      };
      return <tr key={item.id ?? `${item.debut}-${item.fin}`}><td className="entity-table__primary">{shortTime(item.debut)}</td><td>{shortTime(item.fin)}</td><td><Badge tone="primary">{Math.floor(duration / 60)} h {duration % 60 ? `${duration % 60} min` : ''}</Badge></td><td><Badge tone={getBadgeTone(item.typeClasse)}>{item.typeClasse || 'Cours'}</Badge></td><td><div className="entity-table__actions"><Button variant="icon" className="entity-table__action-edit" onClick={() => onEdit(item)} icon={<Edit2 size={14} />} /><Button variant="icon" className="entity-table__action-delete" onClick={() => item.id && onDelete(item.id)} icon={<Trash2 size={14} />} /></div></td></tr>;
    })}</tbody></table></TableScroll>}
  </DataTable>;
}
