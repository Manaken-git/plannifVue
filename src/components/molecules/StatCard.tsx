import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  iconColor: 'primary' | 'success' | 'info' | 'warning';
  value: number | string;
  label: string;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, iconColor, value, label }) => {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${iconColor}`}>
        {icon}
      </div>
      <div className="stat-details">
        <h3>{value}</h3>
        <p>{label}</p>
      </div>
    </div>
  );
};
