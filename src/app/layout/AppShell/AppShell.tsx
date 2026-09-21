import { useState, type ReactNode } from 'react';
import { Sidebar } from '../Sidebar/Sidebar';
import type { AppTab } from '../../navigation/navigation.types';
import './AppShell.css';

interface AppShellProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  children: ReactNode;
}

export function AppShell({ activeTab, onTabChange, children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  return (
    <div className={`app-shell${sidebarCollapsed ? ' is-sidebar-collapsed' : ''}`}>
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
      <main className="app-shell__main">
        <div className="app-shell__content">{children}</div>
      </main>
    </div>
  );
}
