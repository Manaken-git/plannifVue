import { CalendarDays, GraduationCap, Home, UsersRound } from 'lucide-react';
import { StatCard } from '../../../../shared/ui/StatCard/StatCard';
import './PlanningStats.css';

interface Props { sessions: number; professors: number; students: number; rooms: number; }
export function PlanningStats({ sessions, professors, students, rooms }: Props) {
  return <div className="planning-stats"><StatCard icon={<CalendarDays size={17} />} value={sessions} label="Séances planifiées" /><StatCard icon={<GraduationCap size={17} />} value={professors} label="Enseignants" /><StatCard icon={<UsersRound size={17} />} value={students} label="Élèves inscrits" /><StatCard icon={<Home size={17} />} value={rooms} label="Salles configurées" /></div>;
}
