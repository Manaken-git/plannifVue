import { AlertTriangle, CalendarClock, Eye, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { Badge } from '../../../../shared/ui/Badge/Badge';
import { Button } from '../../../../shared/ui/Button/Button';
import { DataTable, TableScroll } from '../../../../shared/ui/DataTable/DataTable';
import { SortButton } from '../../../../shared/ui/DataTable/SortButton';
import { EmptyState } from '../../../../shared/ui/EmptyState/EmptyState';
import { useSortableData } from '../../../../shared/hooks/useSortableData';
import type { PlanningDTO } from '../../types/planning-saved.types';

interface Props {
  items: PlanningDTO[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onVisualize: (item: PlanningDTO) => void;
  onViewUnplanned: (item: PlanningDTO) => void;
  onDelete: (id: number) => void;
}

export function PlanningsTable({ items, searchTerm, onSearchChange, onVisualize, onViewUnplanned, onDelete }: Props) {
  const filtered = items.filter((item) => item.nom.toLowerCase().includes(searchTerm.toLowerCase()));
  const selectors = useMemo(() => ({
    nom: (item: PlanningDTO) => item.nom,
    date: (item: PlanningDTO) => item.dateCreation,
    seances: (item: PlanningDTO) => item.seances?.length ?? 0,
    nonPlanifiees: (item: PlanningDTO) => item.seancesNonPlanifiees?.length ?? 0,
  }), []);
  const sorted = useSortableData(filtered, selectors);

  return (
    <DataTable title="Plannings enregistrés" count={items.length} searchTerm={searchTerm} onSearchChange={onSearchChange} searchPlaceholder="Rechercher un planning…">
      {filtered.length === 0 ? (
        <EmptyState compact icon={<CalendarClock size={20} />} title="Aucun planning enregistré" description="Les plannings sauvegardés par le backend apparaîtront ici." />
      ) : (
        <TableScroll>
          <table className="entity-table">
            <thead>
              <tr>
                <th><SortButton label="Nom" columnKey="nom" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th>
                <th><SortButton label="Créé le" columnKey="date" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th>
                <th><SortButton label="Séances planifiées" columnKey="seances" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th>
                <th><SortButton label="Non planifiées" columnKey="nonPlanifiees" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th>
                <th style={{ width: 220 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.items.map((item) => {
                const unplannedCount = item.seancesNonPlanifiees?.length ?? 0;
                return (
                  <tr key={item.id ?? item.nom}>
                    <td className="entity-table__primary">{item.nom}</td>
                    <td>{item.dateCreation ? new Date(item.dateCreation).toLocaleString('fr-FR') : '—'}</td>
                    <td>
                      <Badge tone="primary">{item.seances?.length ?? 0} planifiée{(item.seances?.length ?? 0) > 1 ? 's' : ''}</Badge>
                    </td>
                    <td>
                      {unplannedCount > 0 ? (
                        <button
                          type="button"
                          onClick={() => onViewUnplanned(item)}
                          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
                          title="Cliquer pour afficher le détail"
                        >
                          <Badge tone="danger">{unplannedCount} non planifiée{unplannedCount > 1 ? 's' : ''}</Badge>
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.85rem' }}>0</span>
                      )}
                    </td>
                    <td>
                      <div className="entity-table__actions">
                        <Button variant="secondary" onClick={() => onVisualize(item)} icon={<Eye size={13} />}>
                          Visualiser
                        </Button>
                        {unplannedCount > 0 && (
                          <Button
                            variant="secondary"
                            onClick={() => onViewUnplanned(item)}
                            icon={<AlertTriangle size={13} />}
                            title="Voir les séances qui n'ont pas pu être planifiées"
                          >
                            Échecs ({unplannedCount})
                          </Button>
                        )}
                        <Button variant="icon" className="entity-table__action-delete" onClick={() => item.id && onDelete(item.id)} icon={<Trash2 size={14} />} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableScroll>
      )}
    </DataTable>
  );
}
