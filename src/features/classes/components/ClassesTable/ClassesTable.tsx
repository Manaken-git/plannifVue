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
  const selectors = useMemo(() => ({
    nom: (item: Classe) => item.nom,
    effectif: (item: Classe) => item.effectif ?? 0,
    presences: (item: Classe) => item.presences?.[0]?.dateDebut ?? '',
  }), []);
  const sorted = useSortableData(filtered, selectors);
  return (
    <DataTable title="Classes enregistrées" count={items.length} searchTerm={searchTerm} onSearchChange={onSearchChange} searchPlaceholder="Rechercher une classe…">
      {filtered.length === 0 ? (
        <EmptyState compact icon={<UsersRound size={20} />} title="Aucune classe trouvée" description="Créez vos classes, effectifs, demi-groupes et règles de journée lycée." />
      ) : (
        <TableScroll>
          <table className="entity-table">
            <thead>
              <tr>
                <th><SortButton label="Classe" columnKey="nom" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th>
                <th><SortButton label="Effectif" columnKey="effectif" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th>
                <th>Demi-groupes</th>
                <th>Règles Lycée</th>
                <th><SortButton label="Périodes" columnKey="presences" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th>
                <th style={{ width: 90 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.items.map((item) => (
                <tr key={item.id ?? item.nom}>
                  <td className="entity-table__primary">{item.nom}</td>
                  <td>{item.effectif ? `${item.effectif} élèves` : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {item.groupes && item.groupes.length > 0 ? (
                        item.groupes.map((grp) => (
                          <Badge key={grp.id ?? grp.nom} tone="primary">
                            {grp.nom} ({grp.effectif} él.)
                          </Badge>
                        ))
                      ) : (
                        <span style={{ color: 'var(--text-muted, #888)', fontSize: '0.82rem' }}>Classe entière</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.82rem' }}>
                      <span>Repas : {item.pauseDejeunerDureeMin ?? item.dureePauseDejeunerMin ?? 90} min min.</span>
                      <span style={{ color: 'var(--text-muted, #888)' }}>
                        {item.heureDebutMin ?? '08:00'} → {item.heureFinMax ?? '18:00'} (max {item.maxHeuresParJour ?? 7}h/j)
                      </span>
                    </div>
                  </td>
                  <td>
                    {item.presences?.length ? (
                      <div className="entity-table__chips">
                        {item.presences.map((period, index) => (
                          <Badge key={period.id ?? `${period.dateDebut}-${index}`} tone="info">
                            {dateLabel(period.dateDebut)} → {dateLabel(period.dateFin)}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="entity-table__muted">Standard</span>
                    )}
                  </td>
                  <td>
                    <div className="entity-table__actions">
                      <Button variant="icon" className="entity-table__action-edit" onClick={() => onEdit(item)} icon={<Edit2 size={14} />} />
                      <Button variant="icon" className="entity-table__action-delete" onClick={() => item.id && onDelete(item.id)} icon={<Trash2 size={14} />} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScroll>
      )}
    </DataTable>
  );
}
