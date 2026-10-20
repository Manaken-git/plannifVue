import { useMemo } from 'react';
import type { Classe } from '../../classes/types/classe.types';
import type { Matiere } from '../../matieres/types/matiere.types';
import type { Professeur } from '../../professeurs/types/professeur.types';
import type { Salle } from '../../salles/types/salle.types';
import type { Seance } from '../types/planning.types';

export interface PlanningHealthProps {
  sessions: Seance[];
  professors: Professeur[];
  classes: Classe[];
  subjects: Matiere[];
  salles?: Salle[];
}

export interface PlanningHealthRow {
  id: number;
  name: string;
  value: string;
  status: string;
  progress: number;
  alert: boolean;
}

const hours = (session: Seance) =>
  Math.max(0, (new Date(session.fin).getTime() - new Date(session.debut).getTime()) / 3_600_000);

export function usePlanningHealth({
  sessions,
  professors,
  classes,
  subjects,
  salles = [],
}: PlanningHealthProps) {
  return useMemo(() => {
    const profRows: PlanningHealthRow[] = professors.map((prof) => {
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

    const classRows: PlanningHealthRow[] = classes.map((classe) => {
      const classSessions = sessions.filter((item) => item.classeNom === classe.nom);
      const planned = classSessions.reduce((sum, item) => sum + hours(item), 0);

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

    const subjectRows: PlanningHealthRow[] = subjects.map((subject) => {
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

    const roomAlerts: PlanningHealthRow[] = salles.map((salle) => {
      const roomSessions = sessions.filter((item) => item.salleCode === salle.code);
      let capacityExceededCount = 0;

      roomSessions.forEach((s) => {
        const classe = classes.find((c) => c.nom === s.classeNom);
        if (classe) {
          const effectiveCount =
            s.groupeNom && s.groupeNom !== 'Classe entière'
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

    const profAlertsCount = profRows.filter((row) => row.alert).length;
    const classAlertsCount = classRows.filter((row) => row.alert).length;
    const roomAlertsCount = roomAlerts.filter((row) => row.alert).length;
    const subjectAlertsCount = subjectRows.filter((row) => row.alert).length;
    const totalAlerts = profAlertsCount + classAlertsCount + roomAlertsCount + subjectAlertsCount;

    const classRate = classes.length
      ? Math.round((classRows.filter((row) => !row.alert).length / classes.length) * 100)
      : 0;
    const subjectRate = subjects.length
      ? Math.round((subjectRows.filter((row) => !row.alert).length / subjects.length) * 100)
      : 0;
    const roomRate = salles.length
      ? Math.round((roomAlerts.filter((row) => !row.alert).length / salles.length) * 100)
      : 100;

    return {
      profRows,
      classRows,
      subjectRows,
      roomAlerts,
      profAlertsCount,
      classAlertsCount,
      roomAlertsCount,
      subjectAlertsCount,
      totalAlerts,
      classRate,
      subjectRate,
      roomRate,
    };
  }, [sessions, professors, classes, subjects, salles]);
}
