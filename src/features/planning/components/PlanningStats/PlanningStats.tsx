import {
  Activity,
  AlertCircle,
  BellRing,
  BookOpen,
  Building2,
  CalendarRange,
  CheckCircle2,
  ChevronRight,
  UsersRound,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePlanningHealth, type PlanningHealthProps } from '../../hooks/usePlanningHealth';
import './PlanningStats.css';

export interface PlanningStatsDrawerProps extends PlanningHealthProps {
  open: boolean;
  onClose: () => void;
  onSelect: (type: 'professeur' | 'classe' | 'matiere', id: number) => void;
}

type TabType = 'professors' | 'classes' | 'rooms' | 'subjects';

export function PlanningStatsDrawer({
  open,
  onClose,
  sessions,
  professors,
  classes,
  subjects,
  salles = [],
  onSelect,
}: PlanningStatsDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('professors');

  const health = usePlanningHealth({ sessions, professors, classes, subjects, salles });

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const tabs: Array<{
    id: TabType;
    label: string;
    icon: typeof BellRing;
    badge: string | number;
    badgeTone: 'alert' | 'success' | 'neutral';
  }> = [
    {
      id: 'professors',
      label: 'Professeurs',
      icon: BellRing,
      badge: health.profAlertsCount > 0 ? `${health.profAlertsCount}` : '✓',
      badgeTone: health.profAlertsCount > 0 ? 'alert' : 'success',
    },
    {
      id: 'classes',
      label: 'Classes & Repas',
      icon: UsersRound,
      badge: `${health.classRate}%`,
      badgeTone: health.classAlertsCount > 0 ? 'alert' : 'success',
    },
    {
      id: 'rooms',
      label: 'Salles',
      icon: Building2,
      badge: `${health.roomRate}%`,
      badgeTone: health.roomAlertsCount > 0 ? 'alert' : 'success',
    },
    {
      id: 'subjects',
      label: 'Matières',
      icon: BookOpen,
      badge: `${health.subjectRate}%`,
      badgeTone: health.subjectAlertsCount > 0 ? 'alert' : 'success',
    },
  ];

  const currentRows =
    activeTab === 'professors'
      ? health.profRows
      : activeTab === 'classes'
      ? health.classRows
      : activeTab === 'rooms'
      ? health.roomAlerts
      : health.subjectRows;

  return (
    <div
      className="planning-drawer-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside
        className="planning-stats-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Diagnostic et santé du planning"
      >
        {/* Header */}
        <header className="planning-stats-drawer__header">
          <div className="planning-stats-drawer__header-title">
            <span className="planning-stats-drawer__icon">
              <Activity size={22} />
            </span>
            <div>
              <h2>Santé & Diagnostics</h2>
              <p>Affectations, contraintes et volumes horaires</p>
            </div>
          </div>
          <button
            type="button"
            className="planning-stats-drawer__tab"
            style={{ padding: '6px 8px' }}
            onClick={onClose}
            aria-label="Fermer le volet"
          >
            <X size={20} />
          </button>
        </header>

        {/* Global health alert / success banner */}
        <div
          className={`planning-stats-drawer__banner ${
            health.totalAlerts > 0
              ? 'planning-stats-drawer__banner--warning'
              : 'planning-stats-drawer__banner--success'
          }`}
        >
          {health.totalAlerts > 0 ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <div className="planning-stats-drawer__banner-text">
            <strong>
              {health.totalAlerts > 0
                ? `${health.totalAlerts} point${health.totalAlerts > 1 ? 's' : ''} d'attention détecté${
                    health.totalAlerts > 1 ? 's' : ''
                  }`
                : 'Planning 100% équilibré'}
            </strong>
            <span>
              {health.totalAlerts > 0
                ? `${health.profAlertsCount} profs avec écart d'heures · ${health.classAlertsCount} repas/classes · ${health.roomAlertsCount} salles`
                : 'Toutes les charges d’heures, pauses méridiennes et capacités de salles sont respectées.'}
            </span>
          </div>
        </div>

        {/* Category tabs */}
        <div className="planning-stats-drawer__tabs" role="tablist">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`planning-stats-drawer__tab ${isActive ? 'is-active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
                <span
                  className={`planning-stats-drawer__tab-badge planning-stats-drawer__tab-badge--${tab.badgeTone}`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* List items */}
        <div className="planning-stats-drawer__body">
          <div className="planning-stats-drawer__category-summary">
            <span>
              <strong>{currentRows.length}</strong> éléments analysés
            </span>
            <span>Cliquez sur une ligne pour afficher sa séance</span>
          </div>

          {currentRows.length === 0 ? (
            <div className="planning-stats-drawer__empty">
              <CalendarRange size={36} />
              <strong>Aucun élément configuré</strong>
              <p>Ajoutez des ressources ou des configurations de matières.</p>
            </div>
          ) : (
            currentRows.map((row) => (
              <button
                key={row.id}
                type="button"
                className="planning-stats-drawer__row"
                onClick={() => {
                  if (activeTab !== 'rooms') {
                    onSelect(
                      activeTab === 'professors'
                        ? 'professeur'
                        : activeTab === 'classes'
                        ? 'classe'
                        : 'matiere',
                      row.id
                    );
                    onClose();
                  }
                }}
              >
                <i
                  className={`planning-stats-drawer__row-indicator ${
                    row.alert ? 'is-alert' : ''
                  }`}
                />
                <div className="planning-stats-drawer__row-info">
                  <span className="planning-stats-drawer__row-name">{row.name}</span>
                  <div className="planning-stats-drawer__row-bar">
                    <div
                      className="planning-stats-drawer__row-bar-fill"
                      style={{ width: `${row.progress}%` }}
                    />
                  </div>
                </div>
                <span className="planning-stats-drawer__row-val">{row.value}</span>
                <span
                  className={`planning-stats-drawer__row-tag ${
                    row.alert
                      ? 'planning-stats-drawer__row-tag--alert'
                      : 'planning-stats-drawer__row-tag--success'
                  }`}
                >
                  {row.status}
                </span>
                <ChevronRight size={14} color="var(--text-faint)" />
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <footer className="planning-stats-drawer__footer">
          <span>🎯 Cliquez pour filtrer et zoomer sur la première séance dans l'emploi du temps</span>
        </footer>
      </aside>
    </div>
  );
}

// Backward compatibility alias
export const PlanningStats = PlanningStatsDrawer;
