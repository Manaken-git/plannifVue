import { useMemo, useState } from 'react';
import { AlertCircle, CalendarX2 } from 'lucide-react';
import { Badge } from '../../../../shared/ui/Badge/Badge';
import { EmptyState } from '../../../../shared/ui/EmptyState/EmptyState';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import { SearchInput } from '../../../../shared/ui/SearchInput/SearchInput';
import type { SeanceNonPlanifieeDTO } from '../../types/planning-saved.types';
import './SeancesNonPlanifieesModal.css';

interface Props {
  open: boolean;
  onClose: () => void;
  planningName?: string;
  items: SeanceNonPlanifieeDTO[];
}

function formatMotif(motif: string): { label: string; tone: 'danger' | 'warning' | 'neutral' } {
  const trimmed = motif.trim();
  switch (trimmed) {
    case 'PROFESSEUR_MANQUANT':
      return { label: 'Professeur manquant', tone: 'danger' };
    case 'SALLE_MANQUANTE':
      return { label: 'Salle manquante', tone: 'warning' };
    case 'CRENEAU_DEBUT_MANQUANT':
      return { label: 'Créneau manquant', tone: 'warning' };
    case 'CLASSE_MANQUANTE':
      return { label: 'Classe manquante', tone: 'danger' };
    case 'MATIERE_MANQUANTE':
      return { label: 'Matière manquante', tone: 'danger' };
    default:
      return { label: trimmed.replace(/_/g, ' ').toLowerCase(), tone: 'neutral' };
  }
}

function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export function SeancesNonPlanifieesModal({ open, onClose, planningName, items }: Props) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const term = searchTerm.toLowerCase();
    return items.filter((item) =>
      (item.matiereNom ?? '').toLowerCase().includes(term) ||
      (item.classeNom ?? '').toLowerCase().includes(term) ||
      (item.professeurNomComplet ?? '').toLowerCase().includes(term) ||
      (item.salleCode ?? '').toLowerCase().includes(term) ||
      (item.motifEchec ?? '').toLowerCase().includes(term) ||
      (item.groupe ?? '').toLowerCase().includes(term)
    );
  }, [items, searchTerm]);

  const stats = useMemo(() => {
    let missingTeacher = 0;
    let missingRoom = 0;
    let missingSlot = 0;
    for (const item of items) {
      const motifs = item.motifEchec ?? '';
      if (motifs.includes('PROFESSEUR_MANQUANT')) missingTeacher++;
      if (motifs.includes('SALLE_MANQUANTE')) missingRoom++;
      if (motifs.includes('CRENEAU_DEBUT_MANQUANT')) missingSlot++;
    }
    return { missingTeacher, missingRoom, missingSlot };
  }, [items]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={planningName ? `Séances non planifiées — ${planningName}` : 'Séances non planifiées'}
      description="Liste des séances qui n'ont pas pu être programmées dans le planning lors de son enregistrement."
      size="lg"
    >
      <div className="snp-modal">
        <div className="snp-modal__banner">
          <AlertCircle size={20} className="snp-modal__banner-icon" />
          <div className="snp-modal__banner-text">
            <h4>{items.length} séance{items.length > 1 ? 's n\'ont' : ' n\'a'} pas pu être planifiée{items.length > 1 ? 's' : ''}</h4>
            <p>
              Ces séances sont persistées séparément dans la base de données afin de ne pas bloquer la sauvegarde
              du planning tout en identifiant clairement les éléments à corriger (affectation d'enseignant, de salle ou de créneau).
            </p>
          </div>
        </div>

        <div className="snp-modal__stats">
          <span className="snp-modal__stat-pill">Total en attente : <strong>{items.length}</strong></span>
          {stats.missingTeacher > 0 && (
            <span className="snp-modal__stat-pill snp-modal__stat-pill--danger">
              Professeur manquant : <strong>{stats.missingTeacher}</strong>
            </span>
          )}
          {stats.missingRoom > 0 && (
            <span className="snp-modal__stat-pill snp-modal__stat-pill--warning">
              Salle manquante : <strong>{stats.missingRoom}</strong>
            </span>
          )}
          {stats.missingSlot > 0 && (
            <span className="snp-modal__stat-pill snp-modal__stat-pill--warning">
              Créneau horaire manquant : <strong>{stats.missingSlot}</strong>
            </span>
          )}
        </div>

        <div className="snp-modal__search">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Filtrer par matière, classe, prof, motif…"
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            compact
            icon={<CalendarX2 size={24} />}
            title="Aucune séance non planifiée trouvée"
            description={searchTerm ? 'Aucun résultat ne correspond à votre filtre.' : 'Toutes les séances de ce planning ont été planifiées avec succès.'}
          />
        ) : (
          <div className="snp-modal__table-container">
            <table className="snp-modal__table">
              <thead>
                <tr>
                  <th>Matière</th>
                  <th>Classe / Groupe</th>
                  <th>Professeur</th>
                  <th>Salle</th>
                  <th>Date & Heure</th>
                  <th>Type</th>
                  <th>Motifs d'échec</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, index) => {
                  const motifsList = (item.motifEchec ? item.motifEchec.split(',') : [])
                    .map((m) => formatMotif(m));

                  return (
                    <tr key={item.id ?? `snp-${index}`}>
                      <td style={{ fontWeight: 600 }}>{item.matiereNom || <span className="snp-modal__missing-tag">Non renseignée</span>}</td>
                      <td>
                        {item.classeNom || <span className="snp-modal__missing-tag">Non renseignée</span>}
                        {item.groupe && <Badge tone="neutral">{item.groupe}</Badge>}
                      </td>
                      <td>{item.professeurNomComplet || <span className="snp-modal__missing-tag">Non assigné</span>}</td>
                      <td>{item.salleCode || <span className="snp-modal__missing-tag">Non assignée</span>}</td>
                      <td>{formatDateTime(item.debut)}</td>
                      <td>
                        <Badge tone={item.type === 'TP' ? 'info' : 'primary'}>
                          {item.type || 'COURS'}
                        </Badge>
                      </td>
                      <td>
                        <div className="snp-modal__motifs">
                          {motifsList.length > 0 ? (
                            motifsList.map((m, mIdx) => (
                              <Badge key={mIdx} tone={m.tone}>
                                {m.label}
                              </Badge>
                            ))
                          ) : (
                            <Badge tone="warning">Incomplète</Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
}
