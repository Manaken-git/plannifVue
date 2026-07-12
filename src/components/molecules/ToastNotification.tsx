import React from 'react';
import { Info } from 'lucide-react';

interface ToastNotificationProps {
  message: string;
  type: 'success' | 'error';
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ message, type }) => {
  return (
    <div className={`toast ${type === 'error' ? 'error' : ''}`}>
      <Info size={18} />
      <span>{message}</span>
    </div>
  );
};
