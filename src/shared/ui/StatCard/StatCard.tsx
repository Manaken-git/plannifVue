import type { ReactNode } from 'react';
import './StatCard.css';

interface StatCardProps {
  icon: ReactNode;
  value: number | string;
  label: string;
}

export function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <article className="stat-card">
      <div className="stat-card__icon">{icon}</div>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </article>
  );
}
