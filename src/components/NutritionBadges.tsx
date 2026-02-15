import { NutritionInfo } from '@/types/mealPlanner';

interface NutritionBadgesProps {
  nutrition: NutritionInfo;
  compact?: boolean;
  showWeight?: boolean;
}

export function NutritionBadges({ nutrition, compact = false, showWeight = false }: NutritionBadgesProps) {
  if (compact) {
    return (
      <div className="flex flex-wrap gap-1 text-xs">
        <span className="nutrition-badge bg-accent/20 text-accent-foreground">
          {nutrition.kcal} ккал
        </span>
        <span className="nutrition-badge bg-primary/15 text-primary">
          Б:{nutrition.protein}
        </span>
        <span className="nutrition-badge bg-warning/20 text-warning-foreground">
          Ж:{nutrition.fat}
        </span>
        <span className="nutrition-badge bg-secondary text-secondary-foreground">
          У:{nutrition.carbs}
        </span>
        {(nutrition.mg > 0 || nutrition.fe > 0 || nutrition.vitC > 0) && (
          <>
            <span className="nutrition-badge bg-muted text-muted-foreground">
              Mg:{nutrition.mg}
            </span>
            <span className="nutrition-badge bg-muted text-muted-foreground">
              Fe:{nutrition.fe}
            </span>
            <span className="nutrition-badge bg-muted text-muted-foreground">
              C:{nutrition.vitC}
            </span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      <span className="nutrition-badge bg-accent/20 text-foreground font-semibold">
        🔥 {nutrition.kcal} ккал
      </span>
      <span className="nutrition-badge bg-primary/15 text-primary">
        Б: {nutrition.protein}г
      </span>
      <span className="nutrition-badge bg-warning/20 text-foreground">
        Ж: {nutrition.fat}г
      </span>
      <span className="nutrition-badge bg-secondary text-secondary-foreground">
        У: {nutrition.carbs}г
      </span>
      <span className="nutrition-badge bg-success/15 text-success">
        Кл: {nutrition.fiber}г
      </span>
      {(nutrition.mg > 0 || nutrition.fe > 0 || nutrition.vitC > 0) && (
        <>
          <span className="nutrition-badge bg-muted text-muted-foreground">
            Mg: {nutrition.mg}мг
          </span>
          <span className="nutrition-badge bg-muted text-muted-foreground">
            Fe: {nutrition.fe}мг
          </span>
          <span className="nutrition-badge bg-muted text-muted-foreground">
            C: {nutrition.vitC}мг
          </span>
        </>
      )}
      {showWeight && (
        <span className="nutrition-badge bg-muted text-muted-foreground">
          ⚖️ {nutrition.weight}г
        </span>
      )}
    </div>
  );
}
