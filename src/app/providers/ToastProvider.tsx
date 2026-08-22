import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { Toast, type ToastMessage } from '../../shared/ui/Toast/Toast';
import { ToastContext } from './ToastContext';

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const nextId = useRef(1);

  const remove = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => remove(id), 3800);
  }, [remove]);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack">
        {toasts.map((toast) => <Toast key={toast.id} {...toast} onClose={() => remove(toast.id)} />)}
      </div>
    </ToastContext.Provider>
  );
}
