import React, { useState, useMemo } from 'react';
import { 
  Search, Edit2, Trash2, GraduationCap, Users, UserCheck, BookOpen, Home, Clock, Sliders, Calendar,
  ArrowUpDown, ArrowUp, ArrowDown, Eye
} from 'lucide-react';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import type { Professeur, Eleve, Classe, Matiere, Salle, Creneau, MatiereClasseConfig, Vacances, PlanningDTO } from '../../services/api';

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc' | null;
}

function useSortableData<T>(
  items: T[],
  selectors: Record<string, (item: T) => any>,
  defaultConfig: SortConfig = { key: '', direction: null }
) {
  const [sortConfig, setSortConfig] = useState<SortConfig>(defaultConfig);

  const sortedItems = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return items;

    const selector = selectors[sortConfig.key];
    if (!selector) return items;

    return [...items].sort((a, b) => {
      const aVal = selector(a);
      const bVal = selector(b);

      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal, 'fr', { sensitivity: 'base' })
          : bVal.localeCompare(aVal, 'fr', { sensitivity: 'base' });
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [items, sortConfig, selectors]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      }
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
}

const SortHeaderIcon: React.FC<{ sortConfig: SortConfig; columnKey: string }> = ({ sortConfig, columnKey }) => {
  if (sortConfig.key !== columnKey || !sortConfig.direction) {
    return <ArrowUpDown size={14} className="sort-icon" />;
  }
  if (sortConfig.direction === 'asc') {
    return <ArrowUp size={14} className="sort-icon active" />;
  }
  return <ArrowDown size={14} className="sort-icon active" />;
};

interface TableHeaderProps {
  title: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
}

const TableHeader: React.FC<TableHeaderProps> = ({ 
  title, 
  searchTerm, 
  onSearchChange, 
  placeholder = "Rechercher..." 
}) => (
  <div className="table-header">
    <h2>{title}</h2>
    <div style={{ position: 'relative' }}>
      <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
      <input 
        type="text" 
        placeholder={placeholder} 
        className="search-input"
        style={{ paddingLeft: '2.2rem' }}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  </div>
);

// 1. PROFESSEURS TABLE
interface ProfesseursTableProps {
  professeurs: Professeur[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onEdit: (professeur: Professeur) => void;
  onDelete: (id: number) => void;
}

export const ProfesseursTable: React.FC<ProfesseursTableProps> = ({
  professeurs,
  searchTerm,
  onSearchChange,
  onEdit,
  onDelete,
}) => {
  const filtered = professeurs.filter(p => 
    `${p.nom} ${p.prenom}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectors = useMemo<Record<string, (p: Professeur) => any>>(() => ({
    nom: p => `${p.nom} ${p.prenom}`,
    email: p => p.email || '',
    nb_heures: p => p.nb_heures || 0,
    matieres: p => (p.matieres || []).map(m => m.nom).join(', '),
    plage: p => p.plageHorairePreferee?.libelle || '',
    daysOff: p => (p.daysOff || []).length,
  }), []);

  const { items: sorted, requestSort, sortConfig } = useSortableData(filtered, selectors);

  return (
    <div className="table-card">
      <TableHeader 
        title={`Enseignants inscrits (${professeurs.length})`}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
      />

      {filtered.length === 0 ? (
        <div className="empty-state">
          <GraduationCap className="empty-state-icon" />
          <h3>Aucun professeur trouvé</h3>
          <p>Commencez par ajouter un professeur à l'aide du bouton "+".</p>
        </div>
      ) : (
        <table className="custom-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => requestSort('nom')}>
                <div className="th-content">Nom & Prénom <SortHeaderIcon sortConfig={sortConfig} columnKey="nom" /></div>
              </th>
              <th className="sortable" onClick={() => requestSort('email')}>
                <div className="th-content">Email <SortHeaderIcon sortConfig={sortConfig} columnKey="email" /></div>
              </th>
              <th className="sortable" onClick={() => requestSort('nb_heures')}>
                <div className="th-content">Volume & Contraintes <SortHeaderIcon sortConfig={sortConfig} columnKey="nb_heures" /></div>
              </th>
              <th className="sortable" onClick={() => requestSort('matieres')}>
                <div className="th-content">Matières Enseignées <SortHeaderIcon sortConfig={sortConfig} columnKey="matieres" /></div>
              </th>
              <th className="sortable" onClick={() => requestSort('plage')}>
                <div className="th-content">Plage Horaire Préférée <SortHeaderIcon sortConfig={sortConfig} columnKey="plage" /></div>
              </th>
              <th className="sortable" onClick={() => requestSort('daysOff')}>
                <div className="th-content">Jours Off <SortHeaderIcon sortConfig={sortConfig} columnKey="daysOff" /></div>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}>{p.nom} {p.prenom}</td>
                <td>{p.email}</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div><Badge variant="primary">{p.nb_heures} h total</Badge></div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {p.maxHeuresParJour !== undefined && <span>Jour: <strong>{p.maxHeuresParJour}h</strong> </span>}
                      {p.maxHeuresParSemaine !== undefined && <span>| Sem: <strong>{p.maxHeuresParSemaine}h</strong> </span>}
                      {p.maxHeuresParSeance !== undefined && <span>| Séance: <strong>{p.maxHeuresParSeance}h</strong></span>}
                    </div>
                  </div>
                </td>
                <td>
                  {p.matieres && p.matieres.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {p.matieres.map(m => (
                        <Badge key={m.id || m.nom} variant="warning">{m.nom}</Badge>
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Aucune</span>
                  )}
                </td>
                <td>
                  {p.plageHorairePreferee ? (
                    <Badge variant="success">{p.plageHorairePreferee.libelle}</Badge>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Non spécifié</span>
                  )}
                </td>
                <td>
                  {p.daysOff && p.daysOff.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {p.daysOff.map(d => {
                        const dayNames: Record<number, string> = { 1: 'Lun', 2: 'Mar', 3: 'Mer', 4: 'Jeu', 5: 'Ven' };
                        return (
                          <Badge key={d.id || d.jourSemaine} variant="warning">
                            🚫 {dayNames[d.jourSemaine] || `Jour ${d.jourSemaine}`}
                          </Badge>
                        );
                      })}
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Aucun</span>
                  )}
                </td>
                <td className="actions-cell">
                  <Button variant="icon-edit" onClick={() => onEdit(p)} icon={<Edit2 size={16} />} />
                  <Button variant="icon-delete" onClick={() => p.id && onDelete(p.id)} icon={<Trash2 size={16} />} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// 2. CLASSES TABLE
interface ClassesTableProps {
  classes: Classe[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onEdit: (classe: Classe) => void;
  onDelete: (id: number) => void;
}

export const ClassesTable: React.FC<ClassesTableProps> = ({
  classes,
  searchTerm,
  onSearchChange,
  onEdit,
  onDelete,
}) => {
  const filtered = classes.filter(c => 
    c.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectors = useMemo<Record<string, (c: Classe) => any>>(() => ({
    id: c => c.id || 0,
    nom: c => c.nom || '',
    presences: c => c.presences?.[0]?.dateDebut || '',
  }), []);

  const { items: sorted, requestSort, sortConfig } = useSortableData(filtered, selectors);

  return (
    <div className="table-card">
      <TableHeader 
        title={`Classes enregistrées (${classes.length})`}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
      />

      {filtered.length === 0 ? (
        <div className="empty-state">
          <Users className="empty-state-icon" />
          <h3>Aucune classe trouvée</h3>
          <p>Ajoutez une classe pour structurer vos plannings.</p>
        </div>
      ) : (
        <table className="custom-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => requestSort('id')} style={{ width: '80px' }}>
                <div className="th-content">ID <SortHeaderIcon sortConfig={sortConfig} columnKey="id" /></div>
              </th>
              <th className="sortable" onClick={() => requestSort('nom')}>
                <div className="th-content">Nom de la Classe <SortHeaderIcon sortConfig={sortConfig} columnKey="nom" /></div>
              </th>
              <th className="sortable" onClick={() => requestSort('presences')}>
                <div className="th-content">Périodes de présence <SortHeaderIcon sortConfig={sortConfig} columnKey="presences" /></div>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(c => (
              <tr key={c.id}>
                <td>#{c.id}</td>
                <td style={{ fontWeight: 600 }}>{c.nom}</td>
                <td>
                  {c.presences && c.presences.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {c.presences.map((p, idx) => (
                        <Badge key={p.id || idx} variant="success">
                          📅 Du {new Date(p.dateDebut).toLocaleDateString('fr-FR')} au {new Date(p.dateFin).toLocaleDateString('fr-FR')}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Aucune</span>
                  )}
                </td>
                <td className="actions-cell">
                  <Button variant="icon-edit" onClick={() => onEdit(c)} icon={<Edit2 size={16} />} />
                  <Button variant="icon-delete" onClick={() => c.id && onDelete(c.id)} icon={<Trash2 size={16} />} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// 3. ELEVES TABLE
interface ElevesTableProps {
  eleves: Eleve[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onEdit: (eleve: Eleve) => void;
  onDelete: (id: number) => void;
}

export const ElevesTable: React.FC<ElevesTableProps> = ({
  eleves,
  searchTerm,
  onSearchChange,
  onEdit,
  onDelete,
}) => {
  const filtered = eleves.filter(e => 
    `${e.nom} ${e.prenom}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectors = useMemo<Record<string, (e: Eleve) => any>>(() => ({
    nom: e => e.nom || '',
    prenom: e => e.prenom || '',
  }), []);

  const { items: sorted, requestSort, sortConfig } = useSortableData(filtered, selectors);

  return (
    <div className="table-card">
      <TableHeader 
        title={`Liste des Élèves (${filtered.length})`}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        placeholder="Filtrer par nom..."
      />

      {filtered.length === 0 ? (
        <div className="empty-state">
          <UserCheck className="empty-state-icon" />
          <h3>Aucun élève trouvé</h3>
          <p>Enregistrez vos premiers élèves dans la base.</p>
        </div>
      ) : (
        <table className="custom-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => requestSort('nom')}>
                <div className="th-content">Nom <SortHeaderIcon sortConfig={sortConfig} columnKey="nom" /></div>
              </th>
              <th className="sortable" onClick={() => requestSort('prenom')}>
                <div className="th-content">Prénom <SortHeaderIcon sortConfig={sortConfig} columnKey="prenom" /></div>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(e => (
              <tr key={e.id}>
                <td style={{ fontWeight: 600 }}>{e.nom}</td>
                <td>{e.prenom}</td>
                <td className="actions-cell">
                  <Button variant="icon-edit" onClick={() => onEdit(e)} icon={<Edit2 size={16} />} />
                  <Button variant="icon-delete" onClick={() => e.id && onDelete(e.id)} icon={<Trash2 size={16} />} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// 4. MATIERES TABLE
interface MatieresTableProps {
  matieres: Matiere[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onEdit: (matiere: Matiere) => void;
  onDelete: (id: number) => void;
}

export const MatieresTable: React.FC<MatieresTableProps> = ({
  matieres,
  searchTerm,
  onSearchChange,
  onEdit,
  onDelete,
}) => {
  const filtered = matieres.filter(m => 
    m.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectors = useMemo<Record<string, (m: Matiere) => any>>(() => ({
    nom: m => m.nom || '',
  }), []);

  const { items: sorted, requestSort, sortConfig } = useSortableData(filtered, selectors);

  return (
    <div className="table-card">
      <TableHeader 
        title={`Matières enseignées (${matieres.length})`}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
      />

      {filtered.length === 0 ? (
        <div className="empty-state">
          <BookOpen className="empty-state-icon" />
          <h3>Aucune matière</h3>
          <p>Ajoutez des matières à votre catalogue.</p>
        </div>
      ) : (
        <table className="custom-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => requestSort('nom')}>
                <div className="th-content">Nom de la Matière <SortHeaderIcon sortConfig={sortConfig} columnKey="nom" /></div>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(m => (
              <tr key={m.id}>
                <td style={{ fontWeight: 600 }}>{m.nom}</td>
                <td className="actions-cell">
                  <Button variant="icon-edit" onClick={() => onEdit(m)} icon={<Edit2 size={16} />} />
                  <Button variant="icon-delete" onClick={() => m.id && onDelete(m.id)} icon={<Trash2 size={16} />} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// 5. SALLES TABLE
interface SallesTableProps {
  salles: Salle[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onEdit: (salle: Salle) => void;
  onDelete: (id: number) => void;
}

export const SallesTable: React.FC<SallesTableProps> = ({
  salles,
  searchTerm,
  onSearchChange,
  onEdit,
  onDelete,
}) => {
  const filtered = salles.filter(s => 
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectors = useMemo<Record<string, (s: Salle) => any>>(() => ({
    code: s => s.code || '',
    capacite: s => s.capacite || 0,
    type: s => s.type || '',
  }), []);

  const { items: sorted, requestSort, sortConfig } = useSortableData(filtered, selectors);

  return (
    <div className="table-card">
      <TableHeader 
        title={`Salles disponibles (${salles.length})`}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
      />

      {filtered.length === 0 ? (
        <div className="empty-state">
          <Home className="empty-state-icon" />
          <h3>Aucune salle</h3>
          <p>Créez des salles de cours avec leurs capacités d'accueil.</p>
        </div>
      ) : (
        <table className="custom-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => requestSort('code')}>
                <div className="th-content">Code Salle <SortHeaderIcon sortConfig={sortConfig} columnKey="code" /></div>
              </th>
              <th className="sortable" onClick={() => requestSort('capacite')}>
                <div className="th-content">Capacité d'accueil <SortHeaderIcon sortConfig={sortConfig} columnKey="capacite" /></div>
              </th>
              <th className="sortable" onClick={() => requestSort('type')}>
                <div className="th-content">Type <SortHeaderIcon sortConfig={sortConfig} columnKey="type" /></div>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(s => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600 }}>{s.code}</td>
                <td>
                  <Badge variant="success">{s.capacite} places</Badge>
                </td>
                <td>{s.type}</td>
                <td className="actions-cell">
                  <Button variant="icon-edit" onClick={() => onEdit(s)} icon={<Edit2 size={16} />} />
                  <Button variant="icon-delete" onClick={() => s.id && onDelete(s.id)} icon={<Trash2 size={16} />} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// 6. CRENEAUX TABLE
interface CreneauxTableProps {
  creneaux: Creneau[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onEdit: (creneau: Creneau) => void;
  onDelete: (id: number) => void;
}

export const CreneauxTable: React.FC<CreneauxTableProps> = ({
  creneaux,
  searchTerm,
  onSearchChange,
  onEdit,
  onDelete,
}) => {
  const filtered = creneaux.filter(c => 
    `${c.debut} - ${c.fin}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectors = useMemo<Record<string, (c: Creneau) => any>>(() => ({
    id: c => c.id || 0,
    debut: c => c.debut || '',
    fin: c => c.fin || '',
    plage: c => c.debut || '',
  }), []);

  const { items: sorted, requestSort, sortConfig } = useSortableData(filtered, selectors);

  return (
    <div className="table-card">
      <TableHeader 
        title={`Créneaux horaires (${creneaux.length})`}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        placeholder="Rechercher une heure..."
      />

      {filtered.length === 0 ? (
        <div className="empty-state">
          <Clock className="empty-state-icon" />
          <h3>Aucun créneau trouvé</h3>
          <p>Ajoutez des créneaux horaires à l'aide du bouton "+".</p>
        </div>
      ) : (
        <table className="custom-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => requestSort('id')} style={{ width: '80px' }}>
                <div className="th-content">ID <SortHeaderIcon sortConfig={sortConfig} columnKey="id" /></div>
              </th>
              <th className="sortable" onClick={() => requestSort('debut')}>
                <div className="th-content">Heure de Début <SortHeaderIcon sortConfig={sortConfig} columnKey="debut" /></div>
              </th>
              <th className="sortable" onClick={() => requestSort('fin')}>
                <div className="th-content">Heure de Fin <SortHeaderIcon sortConfig={sortConfig} columnKey="fin" /></div>
              </th>
              <th className="sortable" onClick={() => requestSort('plage')}>
                <div className="th-content">Plage Horaire <SortHeaderIcon sortConfig={sortConfig} columnKey="plage" /></div>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(c => (
              <tr key={c.id}>
                <td>#{c.id}</td>
                <td style={{ fontWeight: 600 }}>{c.debut}</td>
                <td style={{ fontWeight: 600 }}>{c.fin}</td>
                <td>
                  <Badge variant="primary">{c.debut} ➔ {c.fin}</Badge>
                </td>
                <td className="actions-cell">
                  <Button variant="icon-edit" onClick={() => onEdit(c)} icon={<Edit2 size={16} />} />
                  <Button variant="icon-delete" onClick={() => c.id && onDelete(c.id)} icon={<Trash2 size={16} />} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// 7. MATIERE CLASSE CONFIGS TABLE
interface MatiereClasseConfigsTableProps {
  configs: MatiereClasseConfig[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onEdit: (config: MatiereClasseConfig) => void;
  onDelete: (id: number) => void;
}

export const MatiereClasseConfigsTable: React.FC<MatiereClasseConfigsTableProps> = ({
  configs,
  searchTerm,
  onSearchChange,
  onEdit,
  onDelete,
}) => {
  const filtered = configs.filter(c => 
    (c.classeNom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.matiereNom || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectors = useMemo<Record<string, (c: MatiereClasseConfig) => any>>(() => ({
    id: c => c.id || 0,
    classeNom: c => c.classeNom || '',
    matiereNom: c => c.matiereNom || '',
    dateDebut: c => c.dateDebut || '',
    dateFin: c => c.dateFin || '',
    volumeHoraire: c => c.volumeHorairePeriode || 0,
  }), []);

  const { items: sorted, requestSort, sortConfig } = useSortableData(filtered, selectors);

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Non définie';
    try {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="table-card">
      <TableHeader 
        title={`Configurations Matières/Classes (${configs.length})`}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        placeholder="Rechercher par classe ou matière..."
      />

      {filtered.length === 0 ? (
        <div className="empty-state">
          <Sliders className="empty-state-icon" />
          <h3>Aucune configuration trouvée</h3>
          <p>Associez des matières à vos classes avec des périodes de validité.</p>
        </div>
      ) : (
        <table className="custom-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => requestSort('id')} style={{ width: '80px' }}>
                <div className="th-content">ID <SortHeaderIcon sortConfig={sortConfig} columnKey="id" /></div>
              </th>
              <th className="sortable" onClick={() => requestSort('classeNom')}>
                <div className="th-content">Classe <SortHeaderIcon sortConfig={sortConfig} columnKey="classeNom" /></div>
              </th>
              <th className="sortable" onClick={() => requestSort('matiereNom')}>
                <div className="th-content">Matière <SortHeaderIcon sortConfig={sortConfig} columnKey="matiereNom" /></div>
              </th>
              <th className="sortable" onClick={() => requestSort('dateDebut')}>
                <div className="th-content">Date de Début <SortHeaderIcon sortConfig={sortConfig} columnKey="dateDebut" /></div>
              </th>
              <th className="sortable" onClick={() => requestSort('dateFin')}>
                <div className="th-content">Date de Fin <SortHeaderIcon sortConfig={sortConfig} columnKey="dateFin" /></div>
              </th>
              <th className="sortable" onClick={() => requestSort('volumeHoraire')}>
                <div className="th-content">Volume Horaire <SortHeaderIcon sortConfig={sortConfig} columnKey="volumeHoraire" /></div>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(c => (
              <tr key={c.id}>
                <td>#{c.id}</td>
                <td style={{ fontWeight: 600 }}>{c.classeNom || `Classe ID: ${c.classeId}`}</td>
                <td style={{ fontWeight: 600 }}>
                  <Badge variant="warning">{c.matiereNom || `Matière ID: ${c.matiereId}`}</Badge>
                </td>
                <td>{formatDate(c.dateDebut)}</td>
                <td>{formatDate(c.dateFin)}</td>
                <td>
                  {c.volumeHorairePeriode != null
                    ? <Badge variant="primary">{c.volumeHorairePeriode} h</Badge>
                    : <span style={{ color: 'var(--text-muted)' }}>-</span>
                  }
                </td>
                <td className="actions-cell">
                  <Button variant="icon-edit" onClick={() => onEdit(c)} icon={<Edit2 size={16} />} />
                  <Button variant="icon-delete" onClick={() => c.id && onDelete(c.id)} icon={<Trash2 size={16} />} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// 8. VACANCES TABLE
interface VacancesTableProps {
  vacances: Vacances[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onEdit: (vacances: Vacances) => void;
  onDelete: (id: number) => void;
}

export const VacancesTable: React.FC<VacancesTableProps> = ({
  vacances,
  searchTerm,
  onSearchChange,
  onEdit,
  onDelete,
}) => {
  const filtered = vacances.filter(v => 
    v.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectors = useMemo<Record<string, (v: Vacances) => any>>(() => ({
    nom: v => v.nom || '',
    dateDebut: v => v.dateDebut || '',
    dateFin: v => v.dateFin || '',
  }), []);

  const { items: sorted, requestSort, sortConfig } = useSortableData(filtered, selectors);

  return (
    <div className="table-card">
      <TableHeader 
        title={`Périodes de vacances (${vacances.length})`}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        placeholder="Rechercher par nom..."
      />

      {filtered.length === 0 ? (
        <div className="empty-state">
          <Calendar className="empty-state-icon" />
          <h3>Aucune période de vacances trouvée</h3>
          <p>Ajoutez des vacances scolaires ou jours fériés.</p>
        </div>
      ) : (
        <table className="custom-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => requestSort('nom')}>
                <div className="th-content">Nom <SortHeaderIcon sortConfig={sortConfig} columnKey="nom" /></div>
              </th>
              <th className="sortable" onClick={() => requestSort('dateDebut')}>
                <div className="th-content">Date de début <SortHeaderIcon sortConfig={sortConfig} columnKey="dateDebut" /></div>
              </th>
              <th className="sortable" onClick={() => requestSort('dateFin')}>
                <div className="th-content">Date de fin <SortHeaderIcon sortConfig={sortConfig} columnKey="dateFin" /></div>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(v => (
              <tr key={v.id}>
                <td style={{ fontWeight: 600 }}>{v.nom}</td>
                <td>📅 {new Date(v.dateDebut).toLocaleDateString('fr-FR')}</td>
                <td>📅 {new Date(v.dateFin).toLocaleDateString('fr-FR')}</td>
                <td className="actions-cell">
                  <Button variant="icon-edit" onClick={() => onEdit(v)} icon={<Edit2 size={16} />} />
                  <Button variant="icon-delete" onClick={() => v.id && onDelete(v.id)} icon={<Trash2 size={16} />} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};


// 9. PLANNINGS TABLE
interface PlanningsTableProps {
  plannings: PlanningDTO[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onVisualize: (planning: PlanningDTO) => void;
  onDelete: (id: number) => void;
}

export const PlanningsTable: React.FC<PlanningsTableProps> = ({
  plannings,
  searchTerm,
  onSearchChange,
  onVisualize,
  onDelete,
}) => {
  const filtered = plannings.filter(p => 
    p.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectors = useMemo<Record<string, (p: PlanningDTO) => any>>(() => ({
    nom: p => p.nom || '',
    dateCreation: p => p.dateCreation || '',
    nbSeances: p => (p.seances || []).length,
  }), []);

  const { items: sorted, requestSort, sortConfig } = useSortableData(filtered, selectors);

  return (
    <div className="table-card">
      <TableHeader 
        title={`Plannings enregistrés (${plannings.length})`}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        placeholder="Rechercher par nom..."
      />

      {filtered.length === 0 ? (
        <div className="empty-state">
          <Calendar className="empty-state-icon" />
          <h3>Aucun planning trouvé</h3>
          <p>Les plannings générés s'afficheront ici.</p>
        </div>
      ) : (
        <table className="custom-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => requestSort('nom')}>
                <div className="th-content">Nom <SortHeaderIcon sortConfig={sortConfig} columnKey="nom" /></div>
              </th>
              <th className="sortable" onClick={() => requestSort('dateCreation')}>
                <div className="th-content">Date de création <SortHeaderIcon sortConfig={sortConfig} columnKey="dateCreation" /></div>
              </th>
              <th className="sortable" onClick={() => requestSort('nbSeances')}>
                <div className="th-content">Nombre de séances <SortHeaderIcon sortConfig={sortConfig} columnKey="nbSeances" /></div>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}>{p.nom}</td>
                <td>📅 {new Date(p.dateCreation).toLocaleString('fr-FR')}</td>
                <td>
                  <Badge variant="primary">{(p.seances || []).length} séances</Badge>
                </td>
                <td className="actions-cell">
                  <Button 
                    variant="primary" 
                    onClick={() => onVisualize(p)}
                    icon={<Eye size={16} />}
                    style={{ marginRight: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                  >
                    Visualiser
                  </Button>
                  <Button variant="icon-delete" onClick={() => p.id && onDelete(p.id)} icon={<Trash2 size={16} />} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};



