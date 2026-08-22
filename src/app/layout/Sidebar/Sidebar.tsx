import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  Clock3,
  GraduationCap,
  Home,
  SlidersHorizontal,
  SunMedium,
  UserRoundCheck,
  UsersRound,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import type { AppTab } from '../../navigation/navigation.types';
import './Sidebar.css';

interface SidebarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

const groups: Array<{
  label: string;
  items: Array<{ id: AppTab; label: string; icon: typeof CalendarDays }>;
}> = [
  {
    label: 'Planning',
    items: [
      { id: 'planning', label: 'Emploi du temps', icon: CalendarDays },
      { id: 'creneaux', label: 'Créneaux', icon: Clock3 },
      { id: 'plannings', label: 'Plannings enregistrés', icon: ClipboardList },
    ],
  },
  {
    label: 'Ressources',
    items: [
      { id: 'professeurs', label: 'Professeurs', icon: GraduationCap },
      { id: 'classes', label: 'Classes', icon: UsersRound },
      { id: 'eleves', label: 'Élèves', icon: UserRoundCheck },
      { id: 'matieres', label: 'Matières', icon: BookOpen },
      { id: 'salles', label: 'Salles', icon: Home },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { id: 'configs', label: 'Config. matières', icon: SlidersHorizontal },
      { id: 'vacances', label: 'Vacances scolaires', icon: SunMedium },
    ],
  },
];

export function Sidebar({ activeTab, onTabChange, collapsed, onCollapsedChange }: SidebarProps) {
  return (
    <aside className={`sidebar${collapsed ? ' is-collapsed' : ''}`}>
      <div className="sidebar__brand">
        <div className="sidebar__brand-mark" aria-hidden="true">P</div>
        <div className="sidebar__brand-copy">
          <strong>Plannif'Edu</strong>
          <span>Gestion scolaire</span>
        </div>
        <button className="sidebar__collapse" type="button" onClick={() => onCollapsedChange(!collapsed)} aria-label={collapsed ? 'Ouvrir la navigation' : 'Réduire la navigation'}>{collapsed ? <PanelLeftOpen size={17}/> : <PanelLeftClose size={17}/>}</button>
      </div>

      <nav className="sidebar__nav" aria-label="Navigation principale">
        {groups.map((group) => (
          <section className="sidebar__group" key={group.label}>
            <p className="sidebar__group-label">{group.label}</p>
            <div className="sidebar__items">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`sidebar__item${isActive ? ' is-active' : ''}`}
                    onClick={() => onTabChange(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    title={item.label}
                  >
                    <span className="sidebar__item-indicator" aria-hidden="true" />
                    <Icon size={17} strokeWidth={1.9} />
                    <span className="sidebar__item-label">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </nav>
    </aside>
  );
}
