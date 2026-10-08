import { Edit2, GraduationCap, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { Badge } from '../../../../shared/ui/Badge/Badge';
import { Button } from '../../../../shared/ui/Button/Button';
import { DataTable, TableScroll } from '../../../../shared/ui/DataTable/DataTable';
import { SortButton } from '../../../../shared/ui/DataTable/SortButton';
import { EmptyState } from '../../../../shared/ui/EmptyState/EmptyState';
import { useSortableData } from '../../../../shared/hooks/useSortableData';
import type { Professeur } from '../../types/professeur.types';
import './ProfesseursTable.css';

interface Props { items: Professeur[]; searchTerm: string; onSearchChange: (value: string) => void; onEdit: (item: Professeur) => void; onDelete: (id: number) => void; }
const dayNames: Record<number, string> = { 1: 'Lun', 2: 'Mar', 3: 'Mer', 4: 'Jeu', 5: 'Ven' };
const plageShortLabels: Record<string, string> = {
  MATIN: 'Matin',
  APRES_MIDI: 'Aprem',
  JOURNEE: 'Jour',
  CRENEAU: 'Créneau',
};

export function ProfesseursTable({ items, searchTerm, onSearchChange, onEdit, onDelete }: Props) {
  const q = searchTerm.toLowerCase();
  const filtered = items.filter((item) => `${item.nom} ${item.prenom} ${item.email} ${item.batimentPrincipal ?? ''}`.toLowerCase().includes(q));
  const selectors = useMemo(() => ({
    nom: (item: Professeur) => `${item.nom} ${item.prenom}`,
    email: (item: Professeur) => item.email,
    batiment: (item: Professeur) => item.batimentPrincipal ?? '',
    heures: (item: Professeur) => item.nb_heures,
    matieres: (item: Professeur) => item.matieres?.map((matiere) => matiere.nom).join(',') ?? '',
    plage: (item: Professeur) => item.plageHorairePreferee?.libelle ?? '',
  }), []);
  const sorted = useSortableData(filtered, selectors);

  return (
    <DataTable title="Enseignants inscrits" count={items.length} searchTerm={searchTerm} onSearchChange={onSearchChange} searchPlaceholder="Nom, prénom, email ou bâtiment…">
      {filtered.length === 0 ? (
        <EmptyState compact icon={<GraduationCap size={20} />} title="Aucun professeur trouvé" description="Ajoutez vos enseignants, leurs matières, bâtiment et disponibilités." />
      ) : (
        <TableScroll>
          <table className="entity-table professeurs-table">
            <thead>
              <tr>
                <th><SortButton label="Enseignant" columnKey="nom" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th>
                <th><SortButton label="Bâtiment" columnKey="batiment" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th>
                <th><SortButton label="Charge" columnKey="heures" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th>
                <th><SortButton label="Matières" columnKey="matieres" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th>
                <th>Repas & Vœu</th>
                <th>Indisponibilités</th>
                <th style={{ width: 90 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.items.map((item) => (
                <tr key={item.id ?? item.email}>
                  <td>
                    <div className="professeurs-table__identity">
                      <span className="professeurs-table__avatar">{item.prenom?.[0]}{item.nom?.[0]}</span>
                      <div>
                        <span className="entity-table__primary">{item.prenom} {item.nom}</span>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #888)' }}>{item.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{item.batimentPrincipal || 'Bâtiment A'}</td>
                  <td>
                    <div className="entity-table__stack">
                      <Badge tone="primary">{item.nb_heures} h total</Badge>
                      <span className="professeurs-table__constraints">
                        {item.maxHeuresParJour != null ? `${item.maxHeuresParJour}h/j` : '—'} · {item.maxHeuresParSemaine != null ? `${item.maxHeuresParSemaine}h/sem` : '—'} · {item.maxHeuresParSeance != null ? `${item.maxHeuresParSeance}h/séance` : '—'}
                      </span>
                    </div>
                  </td>
                  <td>
                    {item.matieres?.length ? (
                      <div className="entity-table__chips">
                        {item.matieres.map((matiere) => <Badge key={matiere.id ?? matiere.nom} tone="warning">{matiere.nom}</Badge>)}
                      </div>
                    ) : (
                      <span className="entity-table__muted">Aucune</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.82rem' }}>
                      {(item.pauseDejeunerDureeMin != null ? item.pauseDejeunerDureeMin > 0 : item.pauseDejeunerRequise !== false) ? (
                        <span style={{ color: 'var(--success, #10b981)' }}>✓ Pause repas requise ({item.pauseDejeunerDureeMin ?? 60}m)</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted, #888)' }}>Pause repas libre</span>
                      )}
                      {item.plageHorairePreferee && (
                        <span style={{ color: 'var(--text-muted, #888)' }}>Préférence : {item.plageHorairePreferee.libelle}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {item.indisponibilites?.length ? (
                      <div className="entity-table__chips">
                        {item.indisponibilites.map((indispo, i) => (
                          <Badge key={indispo.id ?? i} tone={indispo.plage === 'JOURNEE' ? 'danger' : 'warning'}>
                            {dayNames[indispo.jourSemaine] ?? indispo.jourSemaine} ({plageShortLabels[indispo.plage] ?? indispo.plage})
                          </Badge>
                        ))}
                      </div>
                    ) : item.daysOff?.length ? (
                      <div className="entity-table__chips">
                        {item.daysOff.map((day) => {
                          const j = day.jourSemaine ?? day.dayOfWeek ?? 1;
                          return <Badge key={day.id ?? j} tone="danger">{dayNames[j] ?? j}</Badge>;
                        })}
                      </div>
                    ) : (
                      <span className="entity-table__muted">Disponible 100%</span>
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
