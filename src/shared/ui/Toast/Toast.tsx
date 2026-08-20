import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Button } from '../Button/Button';
import './Toast.css';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface ToastProps extends ToastMessage {
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  const Icon = type === 'success' ? CheckCircle2 : AlertCircle;
  return (
    <div className={`toast toast--${type}`} role="status">
      <Icon size={17} />
      <span>{message}</span>
      <Button variant="icon" onClick={onClose} aria-label="Fermer la notification" icon={<X size={14} />} />
    </div>
  );
}
