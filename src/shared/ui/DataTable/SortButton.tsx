import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { SortConfig } from '../../hooks/useSortableData';

interface SortButtonProps {
  label: string;
  columnKey: string;
  sortConfig: SortConfig;
  onSort: (key: string) => void;
}

export function SortButton({ label, columnKey, sortConfig, onSort }: SortButtonProps) {
  const active = sortConfig.key === columnKey && sortConfig.direction;
  const Icon = !active ? ArrowUpDown : sortConfig.direction === 'asc' ? ArrowUp : ArrowDown;
  return (
    <button type="button" className={`sort-button${active ? ' is-active' : ''}`} onClick={() => onSort(columnKey)}>
      {label}<Icon size={11} />
    </button>
  );
}
