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

export function ProfesseursTable({ items, searchTerm, onSearchChange, onEdit, onDelete }: Props) {
  const q = searchTerm.toLowerCase();
  const filtered = items.filter((item) => `${item.nom} ${item.prenom} ${item.email}`.toLowerCase().includes(q));
  const selectors = useMemo(() => ({
    nom: (item: Professeur) => `${item.nom} ${item.prenom}`,
    email: (item: Professeur) => item.email,
    heures: (item: Professeur) => item.nb_heures,
    matieres: (item: Professeur) => item.matieres?.map((matiere) => matiere.nom).join(',') ?? '',
    plage: (item: Professeur) => item.plageHorairePreferee?.libelle ?? '',
  }), []);
  const sorted = useSortableData(filtered, selectors);

  return <DataTable title="Enseignants inscrits" count={items.length} searchTerm={searchTerm} onSearchChange={onSearchChange} searchPlaceholder="Nom, prénom ou email…">
    {filtered.length === 0 ? <EmptyState compact icon={<GraduationCap size={20} />} title="Aucun professeur trouvé" description="Ajoutez vos enseignants, leurs matières et leurs contraintes de planning." /> : <TableScroll><table className="entity-table professeurs-table"><thead><tr><th><SortButton label="Enseignant" columnKey="nom" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th><th><SortButton label="Email" columnKey="email" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th><th><SortButton label="Charge" columnKey="heures" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th><th><SortButton label="Matières" columnKey="matieres" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th><th><SortButton label="Préférence" columnKey="plage" sortConfig={sorted.sortConfig} onSort={sorted.requestSort} /></th><th>Indisponibilités</th><th style={{ width: 90 }}>Actions</th></tr></thead><tbody>{sorted.items.map((item) => <tr key={item.id ?? item.email}><td><div className="professeurs-table__identity"><span className="professeurs-table__avatar">{item.prenom?.[0]}{item.nom?.[0]}</span><span className="entity-table__primary">{item.prenom} {item.nom}</span></div></td><td>{item.email || <span className="entity-table__muted">—</span>}</td><td><div className="entity-table__stack"><Badge tone="primary">{item.nb_heures} h total</Badge><span className="professeurs-table__constraints">{item.maxHeuresParJour != null ? `${item.maxHeuresParJour}h/j` : '—'} · {item.maxHeuresParSemaine != null ? `${item.maxHeuresParSemaine}h/sem` : '—'} · {item.maxHeuresParSeance != null ? `${item.maxHeuresParSeance}h/séance` : '—'}</span></div></td><td>{item.matieres?.length ? <div className="entity-table__chips">{item.matieres.map((matiere) => <Badge key={matiere.id ?? matiere.nom} tone="warning">{matiere.nom}</Badge>)}</div> : <span className="entity-table__muted">Aucune</span>}</td><td>{item.plageHorairePreferee ? <Badge tone="success">{item.plageHorairePreferee.libelle}</Badge> : <span className="entity-table__muted">Non définie</span>}</td><td>{item.daysOff?.length ? <div className="entity-table__chips">{item.daysOff.map((day) => <Badge key={day.id ?? day.jourSemaine} tone="danger">{dayNames[day.jourSemaine] ?? day.jourSemaine}</Badge>)}</div> : <span className="entity-table__muted">Aucune</span>}</td><td><div className="entity-table__actions"><Button variant="icon" className="entity-table__action-edit" onClick={() => onEdit(item)} icon={<Edit2 size={14} />} /><Button variant="icon" className="entity-table__action-delete" onClick={() => item.id && onDelete(item.id)} icon={<Trash2 size={14} />} /></div></td></tr>)}</tbody></table></TableScroll>}
  </DataTable>;
}
