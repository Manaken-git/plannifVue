import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'icon-edit' | 'icon-delete';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  icon, 
  className = '', 
  ...props 
}) => {
  if (variant === 'icon-edit') {
    return (
      <button className={`btn-icon edit ${className}`} {...props}>
        {icon || children}
      </button>
    );
  }
  if (variant === 'icon-delete') {
    return (
      <button className={`btn-icon delete ${className}`} {...props}>
        {icon || children}
      </button>
    );
  }

  const btnClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  return (
    <button className={`${btnClass} ${className}`} {...props}>
      {icon && <span className="btn-icon-wrapper">{icon}</span>}
      {children}
    </button>
  );
};
