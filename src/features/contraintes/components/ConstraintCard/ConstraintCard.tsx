import { ShieldAlert, Sparkles } from 'lucide-react';
import { Badge } from '../../../../shared/ui/Badge/Badge';
import type { ConstraintConfigItem } from '../../types/constraint.types';
import './ConstraintCard.css';

interface Props {
  item: ConstraintConfigItem;
  onChange: (updated: ConstraintConfigItem) => void;
}

export function ConstraintCard({ item, onChange }: Props) {
  const isHard = item.level === 'HARD';

  const handleWeightChange = (newWeight: number) => {
    onChange({ ...item, weight: Math.max(0, newWeight) });
  };

  const handleActiveToggle = (active: boolean) => {
    onChange({ ...item, active });
  };

  return (
    <article className={`constraint-card${!item.active ? ' is-disabled' : ''}`}>
      <header className="constraint-card__header">
        <div className="constraint-card__title-box">
          <span className={`constraint-card__icon ${isHard ? 'is-hard' : 'is-soft'}`}>
            {isHard ? <ShieldAlert size={18} /> : <Sparkles size={18} />}
          </span>
          <div>
            <h4 className="constraint-card__title">{item.label}</h4>
            <p className="constraint-card__id">{item.id}</p>
          </div>
        </div>
        <div className="constraint-card__badges">
          <Badge tone={isHard ? 'danger' : 'primary'}>{item.level}</Badge>
          <label className="constraint-card__switch" title="Activer / Désactiver">
            <input
              type="checkbox"
              checked={item.active}
              onChange={(e) => handleActiveToggle(e.target.checked)}
            />
            <span className="constraint-card__switch-slider" />
          </label>
        </div>
      </header>

      <p className="constraint-card__description">{item.description}</p>

      <div className="constraint-card__controls">
        <div className="constraint-card__control-item">
          <label>Poids (Score)</label>
          <div className="constraint-card__input-group">
            <input
              type="number"
              min="0"
              max={isHard ? 100 : 50}
              value={item.weight}
              disabled={!item.active}
              onChange={(e) => handleWeightChange(Number(e.target.value))}
            />
            {item.isProportional && (
              <span className="constraint-card__unit">
                {item.unitLabel || 'par unité excédentaire'}
              </span>
            )}
          </div>
        </div>

        {item.isProportional && (
          <div className="constraint-card__tag-proportional">
            <span>Pénalité dynamique proportionnelle</span>
          </div>
        )}
      </div>
    </article>
  );
}
