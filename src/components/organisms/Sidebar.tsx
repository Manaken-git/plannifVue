import React from 'react';
import { 
  Calendar as CalendarIcon, 
  Users, 
  UserCheck, 
  BookOpen, 
  Home, 
  GraduationCap
} from 'lucide-react';

export type Tab = 'dashboard' | 'professeurs' | 'classes' | 'eleves' | 'matieres' | 'salles';

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'dashboard' as Tab, label: 'Emploi du Temps', icon: <CalendarIcon size={18} /> },
    { id: 'professeurs' as Tab, label: 'Professeurs', icon: <GraduationCap size={18} /> },
    { id: 'classes' as Tab, label: 'Classes', icon: <Users size={18} /> },
    { id: 'eleves' as Tab, label: 'Élèves', icon: <UserCheck size={18} /> },
    { id: 'matieres' as Tab, label: 'Matières', icon: <BookOpen size={18} /> },
    { id: 'salles' as Tab, label: 'Salles', icon: <Home size={18} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="logo-container">
        <div className="logo-icon">P</div>
        <span className="logo-text">Plannif'Edu</span>
      </div>
      
      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li 
            key={item.id}
            className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            {item.icon}
            {item.label}
          </li>
        ))}
      </ul>
    </aside>
  );
};
