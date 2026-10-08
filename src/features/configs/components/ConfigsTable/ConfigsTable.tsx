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
  const q = searchTerm.toLowerCase();
  const filtered = items.filter((item) =>
    `${item.classeNom ?? ''} ${item.matiereNom ?? ''} ${item.typeSalleRequis ?? ''}`.toLowerCase().includes(q)
  );
  const selectors = useMemo(() => ({
    classe: (item: MatiereClasseConfig) => item.classeNom ?? '',
    matiere: (item: MatiereClasseConfig) => item.matiereNom ?? '',
    debut: (item: MatiereClasseConfig) => item.dateDebut ?? '',
    volume: (item: MatiereClasseConfig) => item.volumeHorairePeriode ?? 0,
  }), []);
  const sorted = useSortableData(filtered, selectors);

  return (
    <DataTable
      title="Configurations matières / classes"
      count={items.length}
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      searchPlaceholder="Rechercher une classe, matière ou type de salle…"
    >
      {filtered.length === 0 ? (
        <EmptyState
          compact
          icon={<SlidersHorizontal size={20} />}
          title="Aucune configuration"
          description="Associez une matière à une classe avec son volume, durée de séance et contraintes pédagogiques."
        />
      ) : (
        <TableScroll>
          <table className="entity-table">
            <thead>
              <tr>
                <th><SortButton label="Classe" columnKey="classe" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th>
                <th><SortButton label="Matière" columnKey="matiere" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th>
                <th><SortButton label="Volume & Durée" columnKey="volume" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th>
                <th>Règles Pédagogiques</th>
                <th>Salle & Équipements requis</th>
                <th style={{ width: 90 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.items.map((item) => (
                <tr key={item.id ?? `${item.classeId}-${item.matiereId}`}>
                  <td className="entity-table__primary">{item.classeNom ?? `Classe #${item.classeId}`}</td>
                  <td><Badge tone="warning">{item.matiereNom ?? `Matière #${item.matiereId}`}</Badge></td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      {item.volumeHorairePeriode != null ? (
                        <Badge tone="primary">{item.volumeHorairePeriode} h total</Badge>
                      ) : (
                        <span className="entity-table__muted">—</span>
                      )}
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted, #888)' }}>
                        Cours: {item.dureeCoursMinutes ?? item.dureeParDefautMinutes ?? 60}m · TP: {item.dureeTpMinutes ?? 90}m
                      </span>
                      {(item.dateDebut || item.dateFin) && (
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted, #888)' }}>
                          {dateLabel(item.dateDebut)} → {dateLabel(item.dateFin)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {(item.forteChargeCognitive ?? item.prioriteMatin ?? item.chargeCognitiveElevee) && (
                        <Badge tone="danger">Matin prioritaire</Badge>
                      )}
                      {(item.autoriserBlocDeuxHeures ?? item.autoriserBlocDouble) && (
                        <Badge tone="info">Blocs de 2h</Badge>
                      )}
                      {!(item.forteChargeCognitive ?? item.prioriteMatin ?? item.chargeCognitiveElevee) && !(item.autoriserBlocDeuxHeures ?? item.autoriserBlocDouble) && (
                        <span className="entity-table__muted">Standard</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>
                        Type : {item.typeSalleRequis ?? 'Cours'}
                      </span>
                      {item.equipementsRequis && item.equipementsRequis.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                          {item.equipementsRequis.map((eq) => {
                            const label = typeof eq === 'string' ? eq : eq.libelle ?? `Équipement #${eq.id}`;
                            return <Badge key={label} tone="neutral">{label}</Badge>;
                          })}
                        </div>
                      ) : null}
                    </div>
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
