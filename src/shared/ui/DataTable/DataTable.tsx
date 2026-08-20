import type { ReactNode } from 'react';
import { SearchInput } from '../SearchInput/SearchInput';
import './DataTable.css';

interface DataTableProps {
  title: string;
  count: number;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  children: ReactNode;
}

export function DataTable({ title, count, searchTerm, onSearchChange, searchPlaceholder, children }: DataTableProps) {
  return (
    <section className="data-card">
      <header className="data-card__header">
        <div>
          <h2>{title}</h2>
          <span>{count} élément{count > 1 ? 's' : ''}</span>
        </div>
        <SearchInput value={searchTerm} onChange={onSearchChange} placeholder={searchPlaceholder} />
      </header>
      <div className="data-card__body">{children}</div>
    </section>
  );
}

interface TableScrollProps { children: ReactNode; }
export function TableScroll({ children }: TableScrollProps) {
  return <div className="table-scroll">{children}</div>;
}
