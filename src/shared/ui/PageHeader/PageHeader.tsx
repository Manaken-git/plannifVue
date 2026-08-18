import { Download, Plus, RefreshCw, Upload } from 'lucide-react';
import { useRef, type ChangeEvent, type ReactNode } from 'react';
import { Button } from '../Button/Button';
import './PageHeader.css';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  createLabel?: string;
  loading?: boolean;
  onCreate?: () => void;
  onRefresh?: () => void;
  onImport?: (file: File) => void;
  onExport?: () => void;
  extraActions?: ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  createLabel,
  loading = false,
  onCreate,
  onRefresh,
  onImport,
  onExport,
  extraActions,
}: PageHeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImport) onImport(file);
    event.target.value = '';
  };

  return (
    <header className="page-header">
      <div className="page-header__copy">
        {eyebrow && <span className="page-header__eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="page-header__actions">
        {extraActions}
        {onImport && (
          <>
            <input ref={inputRef} type="file" accept=".csv" className="sr-only" onChange={handleFile} />
            <Button variant="secondary" disabled={loading} onClick={() => inputRef.current?.click()} icon={<Upload size={14} />}>Importer</Button>
          </>
        )}
        {onExport && <Button variant="secondary" disabled={loading} onClick={onExport} icon={<Download size={14} />}>Exporter</Button>}
        {onRefresh && <Button variant="secondary" disabled={loading} onClick={onRefresh} icon={<RefreshCw size={14} className={loading ? 'spin' : ''} />}>Actualiser</Button>}
        {onCreate && createLabel && <Button onClick={onCreate} disabled={loading} icon={<Plus size={15} />}>{createLabel}</Button>}
      </div>
    </header>
  );
}
