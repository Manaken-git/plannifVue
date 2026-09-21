import { createContext } from 'react';

export interface ToastContextValue {
  notify: (message: string, type?: 'success' | 'error') => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
