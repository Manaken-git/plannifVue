import { Atom, BookOpen, Calculator, Globe2, Languages, Landmark } from 'lucide-react';
import type { Seance } from '../../types/planning.types';
import './SessionCard.css';

interface Props { seance: Seance; top: number; height: number; onClick: () => void; }
const formatTime = (value: string) => { const date = new Date(value); return Number.isNaN(date.getTime()) ? value.slice(11,16) : date.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}); };
const colorIndex = (seance: Seance) => [...(seance.matiereNom || String(seance.id || 0))].reduce((sum,char)=>sum+char.charCodeAt(0),0)%5;
function SubjectIcon({ name = '' }: { name?: string }) { const value=name.toLowerCase(); if(value.includes('math'))return <Calculator size={13}/>; if(value.includes('phys')||value.includes('bio'))return <Atom size={13}/>; if(value.includes('anglais')||value.includes('fran'))return <Languages size={13}/>; if(value.includes('histoire'))return <Landmark size={13}/>; if(value.includes('géo'))return <Globe2 size={13}/>; return <BookOpen size={13}/>; }

export function SessionCard({seance,top,height,onClick}:Props){return <button type="button" className={`session-card session-card--${colorIndex(seance)}`} style={{top,height}} onClick={onClick} title={`${seance.matiereNom||'Séance'} · ${seance.professeurNomComplet||'Professeur non assigné'}`}><span className="session-card__time">{formatTime(seance.debut)} – {formatTime(seance.fin)}</span><span className="session-card__subject"><i><SubjectIcon name={seance.matiereNom}/></i><strong>{seance.matiereNom||'Matière inconnue'}</strong></span><span className="session-card__meta">{seance.professeurNomComplet||'Enseignant non assigné'}</span><span className="session-card__meta">{seance.classeNom||'Classe non assignée'} · {seance.salleCode||'Salle non assignée'}</span></button>}
