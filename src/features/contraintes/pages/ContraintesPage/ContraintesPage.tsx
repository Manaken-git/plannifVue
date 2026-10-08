import { useCallback, useEffect, useMemo, useState } from 'react';
import { RotateCcw, Save, ShieldAlert, Sparkles, SlidersHorizontal } from 'lucide-react';
import { useToast } from '../../../../app/providers/useToast';
import { Button } from '../../../../shared/ui/Button/Button';
import { PageHeader } from '../../../../shared/ui/PageHeader/PageHeader';
import { constraintsApi } from '../../../configs/api/constraints.api';
import type {
  ConstraintCategory,
  ConstraintConfigItem,
  ConstraintConfiguration,
} from '../../../configs/types/constraint.types';
import { ConstraintCard } from '../../components/ConstraintCard/ConstraintCard';
import './ContraintesPage.css';

type CategoryFilter = 'ALL' | ConstraintCategory;

const categories: Array<{ id: CategoryFilter; label: string }> = [
  { id: 'ALL', label: 'Toutes les règles' },
  { id: 'STUDENT', label: 'Élèves & Horaires' },
  { id: 'TEACHER', label: 'Enseignants' },
  { id: 'ROOM', label: 'Salles & Capacité' },
  { id: 'PEDAGOGY', label: 'Organisation Pédagogique' },
];

export function ContraintesPage() {
  const { notify } = useToast();
  const [config, setConfig] = useState<ConstraintConfiguration | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('ALL');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await constraintsApi.get();
      setConfig(data);
    } catch {
      notify('Impossible de charger la configuration des contraintes solveur.', 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleConstraintUpdate = (updated: ConstraintConfigItem) => {
    if (!config) return;
    setConfig({
      ...config,
      constraints: config.constraints.map((item) => (item.id === updated.id ? updated : item)),
    });
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const saved = await constraintsApi.save(config);
      setConfig(saved);
      notify('Configuration des contraintes Timefold enregistrée avec succès.');
    } catch (error) {
      notify(error instanceof Error ? error.message : "Erreur lors de l'enregistrement.", 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Réinitialiser tous les poids aux valeurs par défaut du lycée ?')) return;
    await load();
    notify('Poids réinitialisés.');
  };

  const filteredConstraints = useMemo(() => {
    if (!config?.constraints) return [];
    if (selectedCategory === 'ALL') return config.constraints;
    return config.constraints.filter((item) => item.category === selectedCategory);
  }, [config, selectedCategory]);

  const hardCount = config?.constraints.filter((c) => c.level === 'HARD' && c.active).length ?? 0;
  const softCount = config?.constraints.filter((c) => c.level === 'SOFT' && c.active).length ?? 0;
  const proportionalCount = config?.constraints.filter((c) => c.isProportional && c.active).length ?? 0;

  return (
    <div className="contraintes-page">
      <PageHeader
        title="Règles du Solveur (@ConstraintConfiguration)"
        description="Ajustez les poids et pénalités dynamiques des contraintes lycée pour orienter le moteur Timefold."
        loading={loading}
        onRefresh={load}
      />

      <div className="contraintes-page__stats">
        <div className="contraintes-stat-card">
          <span className="contraintes-stat-card__icon is-hard">
            <ShieldAlert size={20} />
          </span>
          <div>
            <strong>{hardCount}</strong>
            <span>Contraintes dures (Hard)</span>
          </div>
        </div>
        <div className="contraintes-stat-card">
          <span className="contraintes-stat-card__icon is-soft">
            <Sparkles size={20} />
          </span>
          <div>
            <strong>{softCount}</strong>
            <span>Optimisations douces (Soft)</span>
          </div>
        </div>
        <div className="contraintes-stat-card">
          <span className="contraintes-stat-card__icon is-proportional">
            <SlidersHorizontal size={20} />
          </span>
          <div>
            <strong>{proportionalCount}</strong>
            <span>Pénalités proportionnelles</span>
          </div>
        </div>
      </div>

      <div className="contraintes-page__toolbar">
        <div className="contraintes-page__tabs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`contraintes-page__tab${selectedCategory === cat.id ? ' is-active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="contraintes-page__actions">
          <Button type="button" variant="secondary" onClick={handleReset} icon={<RotateCcw size={15} />}>
            Réinitialiser
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
            loading={saving}
            icon={<Save size={15} />}
          >
            Enregistrer
          </Button>
        </div>
      </div>

      <div className="contraintes-page__grid">
        {filteredConstraints.map((constraint) => (
          <ConstraintCard key={constraint.id} item={constraint} onChange={handleConstraintUpdate} />
        ))}
      </div>
    </div>
  );
}
