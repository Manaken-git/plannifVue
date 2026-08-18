import { Search, X } from 'lucide-react';
import './SearchInput.css';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Rechercher…' }: SearchInputProps) {
  return (
    <label className="search-field">
      <Search size={14} className="search-field__icon" />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      {value && (
        <button type="button" aria-label="Effacer la recherche" onClick={() => onChange('')}>
          <X size={13} />
        </button>
      )}
    </label>
  );
}
