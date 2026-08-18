import type { FormEventHandler, ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from '../Button/Button';
import './Modal.css';

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  submitLabel?: string;
  loading?: boolean;
  dangerAction?: { label: string; onClick: () => void };
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({
  open,
  title,
  description,
  children,
  onClose,
  onSubmit,
  submitLabel = 'Enregistrer',
  loading = false,
  dangerAction,
  size = 'md',
}: ModalProps) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.currentTarget === event.target) onClose();
    }}>
      <section className={`modal modal--${size}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header className="modal__header">
          <div>
            <h2 id="modal-title">{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <Button variant="icon" aria-label="Fermer" onClick={onClose} icon={<X size={18} />} />
        </header>

        <form className="modal__form" onSubmit={onSubmit}>
          <div className="modal__body">{children}</div>
          <footer className="modal__footer">
            {dangerAction && (
              <Button type="button" variant="danger" onClick={dangerAction.onClick} className="modal__danger">
                {dangerAction.label}
              </Button>
            )}
            <div className="modal__footer-actions">
              <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
              {onSubmit && <Button type="submit" loading={loading}>{submitLabel}</Button>}
            </div>
          </footer>
        </form>
      </section>
    </div>
  );
}
