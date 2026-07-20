import React from 'react';
import { Search, Edit2, Trash2, GraduationCap, Users, UserCheck, BookOpen, Home, Clock } from 'lucide-react';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import type { Professeur, Eleve, Classe, Matiere, Salle, Creneau } from '../../services/api';

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
              <th>Nom & Prénom</th>
              <th>Email</th>
              <th>Volume & Contraintes</th>
              <th>Matières Enseignées</th>
              <th>Plage Horaire Préférée</th>
              <th>Jours Off</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
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
              <th>ID</th>
              <th>Nom de la Classe</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <td>#{c.id}</td>
                <td style={{ fontWeight: 600 }}>{c.nom}</td>
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
              <th>Nom</th>
              <th>Prénom</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
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
              <th>Nom de la Matière</th>
              <th>Volume Horaire Annuel</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id}>
                <td style={{ fontWeight: 600 }}>{m.nom}</td>
                <td>
                  <Badge variant="primary">{m.volumeHoraireAnnuel} heures</Badge>
                </td>
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
              <th>Code Salle</th>
              <th>Capacité d'accueil</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
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
              <th>ID</th>
              <th>Heure de Début</th>
              <th>Heure de Fin</th>
              <th>Plage Horaire</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
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
