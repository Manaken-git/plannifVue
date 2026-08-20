import { useMemo, useState } from 'react';

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc' | null;
}

export function useSortableData<T>(
  items: T[],
  selectors: Record<string, (item: T) => string | number | null | undefined>,
) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: null });

  const sortedItems = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return items;
    const selector = selectors[sortConfig.key];
    if (!selector) return items;

    return [...items].sort((left, right) => {
      const a = selector(left);
      const b = selector(right);
      if (a == null) return 1;
      if (b == null) return -1;
      if (typeof a === 'string' && typeof b === 'string') {
        return sortConfig.direction === 'asc'
          ? a.localeCompare(b, 'fr', { sensitivity: 'base' })
          : b.localeCompare(a, 'fr', { sensitivity: 'base' });
      }
      if (a < b) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a > b) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [items, selectors, sortConfig]);

  const requestSort = (key: string) => {
    setSortConfig((current) => {
      if (current.key !== key) return { key, direction: 'asc' };
      if (current.direction === 'asc') return { key, direction: 'desc' };
      if (current.direction === 'desc') return { key: '', direction: null };
      return { key, direction: 'asc' };
    });
  };

  return { items: sortedItems, sortConfig, requestSort };
}
