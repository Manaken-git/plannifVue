import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BookmarkCheck, CalendarDays, Clock, Eye, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '../../../../app/providers/useToast';
import { Button } from '../../../../shared/ui/Button/Button';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import { PageHeader } from '../../../../shared/ui/PageHeader/PageHeader';
import { classesApi } from '../../../classes/api/classes.api';
import type { Classe } from '../../../classes/types/classe.types';
import { matieresApi } from '../../../matieres/api/matieres.api';
import type { Matiere } from '../../../matieres/types/matiere.types';
import { planningsApi } from '../../../plannings/api/plannings.api';
import { SeancesNonPlanifieesModal } from '../../../plannings/components/SeancesNonPlanifieesModal/SeancesNonPlanifieesModal';
import type { PlanningDTO, PlanningSaveDTO } from '../../../plannings/types/planning-saved.types';
import { professeursApi } from '../../../professeurs/api/professeurs.api';
import type { Professeur } from '../../../professeurs/types/professeur.types';
import { sallesApi } from '../../../salles/api/salles.api';
import type { Salle } from '../../../salles/types/salle.types';
import { planningApi } from '../../api/planning.api';
import { CalendarGrid } from '../../components/CalendarGrid/CalendarGrid';
import { ClassesPresenceAgenda } from '../../components/ClassesPresenceAgenda';
import { PlanningStats } from '../../components/PlanningStats/PlanningStats';
import { SessionForm } from '../../components/SessionForm/SessionForm';
import { SolverProgressModal } from '../../components/SolverProgressModal/SolverProgressModal';
import { useSolverJob } from '../../hooks/useSolverJob';
import type { CalendarFilter, Seance, SessionAssociations } from '../../types/planning.types';
import './PlanningPage.css';

interface Props {
  selectedPlanningId: number | null;
  onSelectedPlanningChange: (id: number | null) => void;
}

export function PlanningPage({ selectedPlanningId, onSelectedPlanningChange }: Props) {
  const { notify } = useToast();
  const [seances, setSeances] = useState<Seance[]>([]);
  const [professeurs, setProfesseurs] = useState<Professeur[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [plannings, setPlannings] = useState<PlanningDTO[]>([]);
  const [filter, setFilter] = useState<CalendarFilter>({ type: 'all', value: '' });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [editing, setEditing] = useState<Seance | null>(null);
  const [focusDate, setFocusDate] = useState<string>();
  const [homeView, setHomeView] = useState<'schedule' | 'presence'>('schedule');

  // Modals for unplanned sessions and planning saving
  const [unplannedModalOpen, setUnplannedModalOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [planningSaveName, setPlanningSaveName] = useState('');

  // Solver modal and job orchestration
  const [solverModalOpen, setSolverModalOpen] = useState(false);

  const solver = useSolverJob({
    onSuccess: async (savedPlanningId, finalScore) => {
      notify(`Optimisation terminée ! Score : ${finalScore || 'optimal'}`);
      await load();
      if (savedPlanningId) {
        onSelectedPlanningChange(savedPlanningId);
      }
    },
    onError: (errMsg) => {
      notify(errMsg, 'error');
    },
  });

  const handleOpenSolver = () => {
    setSolverModalOpen(true);
    if (!solver.isSolving && solver.status !== 'COMPLETED') {
      void solver.startSolving();
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sessions, professors, classList, subjects, rooms, savedPlannings] = await Promise.all([
        planningApi.list(),
        professeursApi.list().catch(() => []),
        classesApi.list().catch(() => []),
        matieresApi.list().catch(() => []),
        sallesApi.list().catch(() => []),
        planningsApi.list().catch(() => []),
      ]);
      setSeances(sessions);
      setProfesseurs(professors);
      setClasses(classList);
      setMatieres(subjects);
      setSalles(rooms);
      setPlannings(savedPlannings);
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Impossible de charger le planning.', 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedPlanning = useMemo(
    () => plannings.find((planning) => planning.id === selectedPlanningId),
    [plannings, selectedPlanningId]
  );

  const sourceSessions = useMemo(
    () => selectedPlanning?.seances ?? seances,
    [selectedPlanning, seances]
  );

  const filteredSessions = useMemo(() => sourceSessions.filter((seance) => {
    if (filter.type === 'all' || !filter.value) return true;
    if (filter.type === 'professeur') return seance.professeurNomComplet === filter.value;
    if (filter.type === 'classe') return seance.classeNom === filter.value;
    if (filter.type === 'matiere') return seance.matiereNom === filter.value;
    if (filter.type === 'salle') return seance.salleCode === filter.value;
    return true;
  }), [sourceSessions, filter]);

  const save = async (data: Seance, associations: SessionAssociations) => {
    setLoading(true);
    try {
      if (mode === 'create') await planningApi.create(data, associations);
      else await planningApi.update(data, associations);
      notify(mode === 'create' ? 'Séance planifiée.' : 'Séance mise à jour.');
      setOpen(false);
      await load();
    } catch (error) {
      notify(error instanceof Error ? error.message : "Erreur lors de l'enregistrement de la séance.", 'error');
      setLoading(false);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm('Supprimer cette séance ?')) return;
    try {
      await planningApi.remove(id);
      notify('Séance supprimée.');
      setOpen(false);
      await load();
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Suppression impossible.', 'error');
    }
  };

  const importCsv = async (file: File) => {
    try {
      await planningApi.importCsv(file);
      notify('Séances importées.');
      await load();
    } catch {
      notify("Échec de l'import CSV.", 'error');
    }
  };

  const exportCsv = async () => {
    try {
      await planningApi.exportCsv();
    } catch {
      notify("Échec de l'export CSV.", 'error');
    }
  };

  const create = () => {
    setMode('create');
    setEditing(null);
    setOpen(true);
  };

  const edit = (seance: Seance) => {
    setMode('edit');
    setEditing(seance);
    setOpen(true);
  };

  const handleOpenSaveModal = () => {
    const defaultName = selectedPlanning
      ? `${selectedPlanning.nom} (copie)`
      : `Planning du ${new Date().toLocaleDateString('fr-FR')}`;
    setPlanningSaveName(defaultName);
    setSaveModalOpen(true);
  };

  const handleSavePlanning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planningSaveName.trim()) return;

    setLoading(true);
    try {
      const payload: PlanningSaveDTO = {
        nom: planningSaveName.trim(),
        dateCreation: new Date().toISOString(),
        seances: sourceSessions.map((s) => {
          const prof = professeurs.find((p) =>
            s.professeurNomComplet && (`${p.prenom} ${p.nom}` === s.professeurNomComplet || s.professeurNomComplet.includes(p.nom))
          );
          const classe = classes.find((c) => c.nom === s.classeNom);
          const matiere = matieres.find((m) => m.nom === s.matiereNom);
          const salle = salles.find((r) => r.code === s.salleCode);

          return {
            id: s.id,
            professeurId: prof?.id,
            classeId: classe?.id,
            matiereId: matiere?.id,
            salleId: salle?.id,
            debut: s.debut,
            fin: s.fin,
            type: s.type || s.typeSeance,
            groupe: s.groupe || s.groupeNom,
            alignementCode: s.alignementCode || s.alignementId,
          };
        }),
      };

      const saved = await planningsApi.save(payload);
      setSaveModalOpen(false);
      await load();

      if (saved?.id) {
        onSelectedPlanningChange(saved.id);
      }

      const unplannedCount = saved?.seancesNonPlanifiees?.length ?? 0;
      if (unplannedCount > 0) {
        notify(
          `Planning "${saved.nom}" sauvegardé : ${saved.seances?.length ?? 0} séances planifiées, ${unplannedCount} séance(s) non planifiée(s).`,
          'warning'
        );
      } else {
        notify(`Planning "${saved.nom}" sauvegardé avec succès (${saved.seances?.length ?? 0} séances).`);
      }
    } catch (error) {
      notify(error instanceof Error ? error.message : "Erreur lors de la sauvegarde du planning.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const focusFromStats = (type: 'professeur' | 'classe' | 'matiere', id: number) => {
    const value =
      type === 'professeur'
        ? (() => {
            const item = professeurs.find((professeur) => professeur.id === id);
            return item ? `${item.prenom} ${item.nom}`.trim() : '';
          })()
        : type === 'classe'
        ? classes.find((classe) => classe.id === id)?.nom || ''
        : matieres.find((matiere) => matiere.id === id)?.nom || '';

    const session = sourceSessions.find((item) =>
      type === 'professeur'
        ? item.professeurNomComplet === value || item.professeurNomComplet?.includes(value.split(' ').at(-1) || '')
        : type === 'classe'
        ? item.classeNom === value
        : item.matiereNom === value
    );

    if (!session) {
      notify('Aucune séance planifiée pour cet élément.', 'error');
      return;
    }

    setFilter({ type, value });
    setFocusDate(session.debut);
    setTimeout(() => {
      const calendar = document.querySelector('.calendar-panel');
      calendar?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      calendar?.animate(
        [{ boxShadow: '0 0 0 1px rgba(69,197,245,.8),0 0 36px rgba(69,197,245,.3)' }, { boxShadow: 'none' }],
        { duration: 1400, easing: 'ease-out' }
      );
    }, 80);
    notify('Élément sélectionné et affiché dans le planning.');
  };

  const handleViewScheduleForClass = (classeNom: string) => {
    setFilter({ type: 'classe', value: classeNom });
    setHomeView('schedule');
    const session = sourceSessions.find((s) => s.classeNom === classeNom);
    if (session) {
      setFocusDate(session.debut);
    }
    notify(`Affichage de l'emploi du temps pour la classe ${classeNom}`);
  };

  const unplannedCount = selectedPlanning?.seancesNonPlanifiees?.length ?? 0;

  const classesWithPresencesCount = useMemo(
    () => classes.filter((c) => (c.presences ?? []).some((p) => p.dateDebut && p.dateFin)).length,
    [classes]
  );

  return (
    <div className="planning-page">
      <PageHeader
        title={homeView === 'presence' ? "Présence des classes (Google Agenda)" : "Planning de la semaine"}
        description={
          homeView === 'presence'
            ? "Visualisez, filtrez et organisez les périodes de présence des promotions au format Google Agenda."
            : "Visualisez, filtrez et organisez les séances de cours."
        }
        createLabel="Nouvelle séance"
        loading={loading}
        onCreate={create}
        onRefresh={load}
        onImport={importCsv}
        onExport={exportCsv}
        extraActions={
          homeView === 'schedule' ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Button
                variant={solver.isSolving ? 'secondary' : 'primary'}
                disabled={loading}
                onClick={handleOpenSolver}
                icon={solver.isSolving ? <Loader2 size={15} className="solver-modal__icon-spinner" /> : <Sparkles size={15} />}
                title="Lancer l'optimisation automatique des cours et salles par Timefold"
              >
                {solver.isSolving ? `Optimisation (${solver.progress?.elapsedSeconds ?? 0}s)...` : 'Optimiser le planning'}
              </Button>
              <Button
                variant="secondary"
                disabled={loading || sourceSessions.length === 0}
                onClick={handleOpenSaveModal}
                icon={<BookmarkCheck size={14} />}
                title="Enregistrer les séances affichées sous un nom de planning"
              >
                Sauvegarder en planning
              </Button>
            </div>
          ) : undefined
        }
      />

      {/* Solver running in background banner */}
      {solver.isSolving && !solverModalOpen && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Loader2 size={18} className="solver-modal__icon-spinner" />
            <span style={{ fontSize: '0.9rem', color: '#1e40af' }}>
              <strong>Optimisation Timefold en arrière-plan</strong> : Score actuel{' '}
              <code>{solver.progress?.score || 'en calcul...'}</code> ({solver.progress?.elapsedSeconds ?? 0}s écoulées)
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" onClick={() => setSolverModalOpen(true)}>
              Afficher les détails
            </Button>
            <Button variant="danger" onClick={solver.stopSolving}>
              Arrêter
            </Button>
          </div>
        </div>
      )}

      {/* Main Home Switcher */}
      <div className="planning-view-switcher" role="tablist" aria-label="Mode d'affichage d'accueil">
        <button
          type="button"
          role="tab"
          aria-selected={homeView === 'schedule'}
          className={`planning-view-switcher__btn${homeView === 'schedule' ? ' is-active' : ''}`}
          onClick={() => setHomeView('schedule')}
        >
          <Clock size={16} />
          <span>Emploi du temps (Séances)</span>
          <span className="planning-view-switcher__badge">{filteredSessions.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={homeView === 'presence'}
          className={`planning-view-switcher__btn${homeView === 'presence' ? ' is-active' : ''}`}
          onClick={() => setHomeView('presence')}
        >
          <CalendarDays size={16} />
          <span>Présence des classes (Google Agenda)</span>
          <span className="planning-view-switcher__badge">{classesWithPresencesCount} classes</span>
        </button>
      </div>

      {homeView === 'presence' ? (
        <ClassesPresenceAgenda
          classes={classes}
          seances={sourceSessions}
          onRefreshClasses={load}
          onViewScheduleForClass={handleViewScheduleForClass}
        />
      ) : (
        <>
          {unplannedCount > 0 && (
            <div className="planning-unplanned-banner">
              <div className="planning-unplanned-banner__content">
                <AlertTriangle size={18} className="planning-unplanned-banner__icon" />
                <span>
                  <strong>{unplannedCount} séance{unplannedCount > 1 ? 's' : ''} non planifiée{unplannedCount > 1 ? 's' : ''}</strong> dans ce planning en raison de données manquantes (professeur, salle, créneau).
                </span>
              </div>
              <Button
                variant="secondary"
                onClick={() => setUnplannedModalOpen(true)}
                icon={<Eye size={14} />}
              >
                Voir les séances non planifiées ({unplannedCount})
              </Button>
            </div>
          )}

          <PlanningStats
            sessions={sourceSessions}
            professors={professeurs}
            classes={classes}
            subjects={matieres}
            salles={salles}
            onSelect={focusFromStats}
          />

          <CalendarGrid
            seances={filteredSessions}
            professeurs={professeurs}
            classes={classes}
            matieres={matieres}
            salles={salles}
            plannings={plannings}
            selectedPlanningId={selectedPlanningId}
            onPlanningChange={onSelectedPlanningChange}
            filter={filter}
            onFilterChange={setFilter}
            onEdit={edit}
            onCreate={create}
            focusDate={focusDate}
          />

          <footer className="planning-page__footer">
            <div>
              <button type="button" onClick={() => setFilter({ type: 'professeur', value: '' })}>
                Professeurs ({professeurs.length})
              </button>
              <button type="button" onClick={() => setFilter({ type: 'classe', value: '' })}>
                Classes ({classes.length})
              </button>
              <button type="button" onClick={() => setFilter({ type: 'matiere', value: '' })}>
                Matières ({matieres.length})
              </button>
            </div>
            <span>Les séances sont affichées en heure locale de l’établissement.</span>
          </footer>
        </>
      )}

      <SessionForm
        open={open}
        mode={mode}
        item={editing}
        professeurs={professeurs}
        classes={classes}
        matieres={matieres}
        salles={salles}
        loading={loading}
        onClose={() => setOpen(false)}
        onSave={save}
        onDelete={remove}
      />

      <SeancesNonPlanifieesModal
        open={unplannedModalOpen}
        onClose={() => setUnplannedModalOpen(false)}
        planningName={selectedPlanning?.nom}
        items={selectedPlanning?.seancesNonPlanifiees ?? []}
      />

      <Modal
        open={saveModalOpen}
        title="Sauvegarder le planning"
        description="Donnez un nom pour enregistrer cette version de planning et persister l'ensemble des séances."
        onClose={() => setSaveModalOpen(false)}
        onSubmit={handleSavePlanning}
        submitLabel="Enregistrer le planning"
        loading={loading}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem' }}>
            <strong>Nom du planning</strong>
            <input
              type="text"
              required
              value={planningSaveName}
              onChange={(e) => setPlanningSaveName(e.target.value)}
              placeholder="ex: Semaine 43 - Lycée"
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color, #cbd5e1)',
                background: 'var(--surface-color, #ffffff)',
                color: 'var(--text-color, #0f172a)',
                fontSize: '0.9rem',
              }}
            />
          </label>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted, #64748b)' }}>
            Note : Si certaines séances n'ont pas de professeur, pas de salle ou pas de créneau attribué,
            le backend les enregistrera automatiquement dans la table des séances non planifiées avec le motif associé.
          </p>
        </div>
      </Modal>

      <SolverProgressModal
        open={solverModalOpen}
        onClose={() => setSolverModalOpen(false)}
        status={solver.status}
        progress={solver.progress}
        result={solver.result}
        error={solver.error}
        isSolving={solver.isSolving}
        onStop={solver.stopSolving}
        onViewResult={(savedId) => {
          setSolverModalOpen(false);
          onSelectedPlanningChange(savedId);
        }}
      />
    </div>
  );
}
