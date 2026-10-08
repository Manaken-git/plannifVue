import { BellRing, BookOpen, CalendarRange, ChevronRight, UsersRound, X, Building2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Classe } from '../../../classes/types/classe.types';
import type { Matiere } from '../../../matieres/types/matiere.types';
import type { Professeur } from '../../../professeurs/types/professeur.types';
import type { Salle } from '../../../salles/types/salle.types';
import type { Seance } from '../../types/planning.types';
import './PlanningStats.css';

interface Props {
  sessions: Seance[];
  professors: Professeur[];
  classes: Classe[];
  subjects: Matiere[];
  salles?: Salle[];
  onSelect: (type: 'professeur' | 'classe' | 'matiere', id: number) => void;
}

type Detail = 'professors' | 'classes' | 'subjects' | 'rooms' | null;

const hours = (session: Seance) =>
  Math.max(0, (new Date(session.fin).getTime() - new Date(session.debut).getTime()) / 3_600_000);

export function PlanningStats({ sessions, professors, classes, subjects, salles = [], onSelect }: Props) {
  const [detail, setDetail] = useState<Detail>(null);

  const data = useMemo(() => {
    const profRows = professors.map((prof) => {
      const name = `${prof.prenom} ${prof.nom}`.trim();
      const planned = sessions
        .filter((item) => item.professeurNomComplet === name || item.professeurNomComplet?.includes(prof.nom))
        .reduce((sum, item) => sum + hours(item), 0);
      const target = prof.nb_heures || 0;
      return {
        id: prof.id || 0,
        name,
        value: `${planned.toFixed(1)} h / ${target.toFixed(1)} h`,
        status: planned === target ? 'Équilibré' : planned < target ? 'Sous-alloué' : 'Surchargé',
        progress: target ? Math.min(100, (planned / target) * 100) : 0,
        alert: planned !== target,
      };
    });

    const classRows = classes.map((classe) => {
      const classSessions = sessions.filter((item) => item.classeNom === classe.nom);
      const planned = classSessions.reduce((sum, item) => sum + hours(item), 0);

      // Check lunch break conflict (courses occupying the full 11:30 - 14:00 period)
      const hasLunchConflict = classSessions.some((s) => {
        const d = new Date(s.debut);
        const f = new Date(s.fin);
        const startHour = d.getHours() + d.getMinutes() / 60;
        const endHour = f.getHours() + f.getMinutes() / 60;
        return startHour < 13.5 && endHour > 12.0 && hours(s) >= 2.5;
      });

      return {
        id: classe.id || 0,
        name: classe.nom,
        value: `${planned.toFixed(1)} h`,
        status: hasLunchConflict ? 'Repas impacté' : planned ? 'Planifiée' : 'Vide',
        progress: planned ? 100 : 0,
        alert: hasLunchConflict || !planned,
      };
    });

    const subjectRows = subjects.map((subject) => {
      const planned = sessions
        .filter((item) => item.matiereNom === subject.nom)
        .reduce((sum, item) => sum + hours(item), 0);
      return {
        id: subject.id || 0,
        name: subject.nom,
        value: `${planned.toFixed(1)} h`,
        status: planned ? 'Planifiée' : 'Vide',
        progress: planned ? 100 : 0,
        alert: !planned,
      };
    });

    // Check room capacity and equipment adequacy
    const roomAlerts = salles.map((salle) => {
      const roomSessions = sessions.filter((item) => item.salleCode === salle.code);
      let capacityExceededCount = 0;

      roomSessions.forEach((s) => {
        const classe = classes.find((c) => c.nom === s.classeNom);
        if (classe) {
          const effectiveCount = s.groupeNom && s.groupeNom !== 'Classe entière'
            ? Math.ceil((classe.effectif ?? 30) / 2)
            : (classe.effectif ?? 30);
          if (salle.capacite < effectiveCount) {
            capacityExceededCount++;
          }
        }
      });

      return {
        id: salle.id || 0,
        name: `${salle.code} (${salle.batiment || 'Bât. A'})`,
        value: `${salle.capacite} pl. · ${roomSessions.length} cours`,
        status: capacityExceededCount > 0 ? `${capacityExceededCount} sous-capacités` : 'Conforme',
        progress: capacityExceededCount > 0 ? 30 : 100,
        alert: capacityExceededCount > 0,
      };
    });

    return { profRows, classRows, subjectRows, roomAlerts };
  }, [sessions, professors, classes, subjects, salles]);

  const classRate = classes.length
    ? Math.round((data.classRows.filter((row) => !row.alert).length / classes.length) * 100)
    : 0;
  const subjectRate = subjects.length
    ? Math.round((data.subjectRows.filter((row) => !row.alert).length / subjects.length) * 100)
    : 0;
  const roomRate = salles.length
    ? Math.round((data.roomAlerts.filter((row) => !row.alert).length / salles.length) * 100)
    : 100;

  const cards = [
    {
      id: 'professors' as const,
      title: 'Alertes professeurs',
      subtitle: 'Disponibilités & Charges',
      icon: BellRing,
      tone: 'alert',
      value: data.profRows.filter((row) => row.alert).length,
      status: 'À vérifier',
      rows: data.profRows.filter((row) => row.alert),
      link: 'Voir toutes les alertes',
    },
    {
      id: 'classes' as const,
      title: 'Classes & Pause repas',
      subtitle: 'Respect de la méridienne',
      icon: UsersRound,
      tone: 'success',
      value: `${classRate}%`,
      status: 'Conforme',
      rows: data.classRows,
      link: 'Voir le détail des classes',
    },
    {
      id: 'rooms' as const,
      title: 'Adéquation des salles',
      subtitle: 'Capacités & Équipements',
      icon: Building2,
      tone: 'purple',
      value: `${roomRate}%`,
      status: data.roomAlerts.some((r) => r.alert) ? 'Alertes capacité' : 'Optimal',
      rows: data.roomAlerts,
      link: 'Voir le détail des salles',
    },
    {
      id: 'subjects' as const,
      title: 'Volume des matières',
      subtitle: 'Heures planifiées / cible',
      icon: BookOpen,
      tone: 'info',
      value: `${subjectRate}%`,
      status: 'Bon niveau',
      rows: data.subjectRows,
      link: 'Voir toutes les matières',
    },
  ];
  const selected = cards.find((card) => card.id === detail);
  return <>
    <div className="planning-stats-dashboard">{cards.map((card) => { const Icon = card.icon; return <article className={`planning-kpi planning-kpi--${card.tone}`} key={card.id}><header><span className="planning-kpi__icon"><Icon size={23}/></span><div><h3>{card.title}</h3><p>{card.subtitle}</p></div></header><div className="planning-kpi__value"><strong>{card.value}</strong><span>{card.status}</span></div>{card.id !== 'professors' && <div className="planning-kpi__progress"><i style={{ width: `${card.id === 'classes' ? classRate : card.id === 'subjects' ? subjectRate : 0}%` }}/></div>}<div className="planning-kpi__preview">{card.rows.slice(0,2).map((row)=><div key={row.id}><span>{row.name}</span><em>{row.value}</em></div>)}{!card.rows.length && <p>Aucune donnée définie.</p>}</div><button type="button" onClick={()=>setDetail(card.id)}>{card.link}</button></article>; })}</div>
    {selected && <div className="planning-detail-backdrop" role="presentation" onMouseDown={(event)=>{if(event.target===event.currentTarget)setDetail(null)}}><section className="planning-detail" role="dialog" aria-modal="true"><header><span className="planning-kpi__icon"><selected.icon size={24}/></span><div><h2>{selected.title}</h2><p>{selected.subtitle}</p></div><button type="button" onClick={()=>setDetail(null)} aria-label="Fermer"><X size={17}/></button></header><div className="planning-detail__count"><strong>{selected.rows.length}</strong> éléments</div><div className="planning-detail__rows">{selected.rows.length ? selected.rows.map((row)=><button type="button" className="planning-detail__row" key={row.id} onClick={()=>{if(selected.id!=='rooms'){onSelect(selected.id==='professors'?'professeur':selected.id==='classes'?'classe':'matiere',row.id);setDetail(null)}}}><i className={row.alert?'is-alert':''}/><span><strong>{row.name}</strong><small><b style={{width:`${row.progress}%`}}/></small></span><em>{row.value}</em><mark>{row.status}</mark><ChevronRight size={15}/></button>):<div className="planning-detail__empty"><CalendarRange size={34}/><strong>Aucun élément</strong><p>Aucune contrainte configurée.</p></div>}</div><footer className="planning-detail__footer">Cliquez sur une ligne pour ouvrir sa première séance dans le planning.</footer></section></div>}
  </>;
}
