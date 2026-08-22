import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import './DatePicker.css';

interface Props { value: string; onChange: (value: string) => void; placeholder?: string; displayLabel?: string; }
const parse = (value: string) => { const [y, m, d] = value.split('-').map(Number); return new Date(y, m - 1, d); };
const serialize = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export function DatePicker({ value, onChange, placeholder = 'Choisir une date', displayLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => value ? parse(value) : new Date());
  const days = useMemo(() => { const first = new Date(month.getFullYear(), month.getMonth(), 1); const start = new Date(first); start.setDate(first.getDate() - ((first.getDay() + 6) % 7)); return Array.from({ length: 42 }, (_, index) => { const day = new Date(start); day.setDate(start.getDate() + index); return day; }); }, [month]);
  const today = serialize(new Date());
  const select = (date: Date) => { onChange(serialize(date)); setMonth(date); setOpen(false); };
  return <div className="custom-date-picker">
    <button className={`custom-date-picker__trigger${open ? ' is-open' : ''}`} type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}><CalendarDays size={16}/><span>{displayLabel || (value ? parse(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : placeholder)}</span><ChevronDown size={14}/></button>
    {open && <><button className="custom-date-picker__backdrop" type="button" aria-label="Fermer" onClick={() => setOpen(false)}/><div className="custom-date-picker__popover">
      <header><button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft size={15}/></button><strong>{month.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</strong><button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight size={15}/></button></header>
      <div className="custom-date-picker__weekdays">{['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map((day) => <span key={day}>{day}</span>)}</div>
      <div className="custom-date-picker__days">{days.map((day) => { const key = serialize(day); return <button key={key} type="button" className={`${day.getMonth() !== month.getMonth() ? 'outside ' : ''}${key === today ? 'today ' : ''}${key === value ? 'selected' : ''}`} onClick={() => select(day)}>{day.getDate()}</button>; })}</div>
      <button className="custom-date-picker__today" type="button" onClick={() => select(new Date())}><CalendarDays size={14}/>Aujourd'hui</button>
    </div></>}
  </div>;
}
