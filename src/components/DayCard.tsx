import { useState } from 'react';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DayPlan, MealType, Recipe, MealItem, DAY_NAMES, MEAL_TYPES, BaseIngredient } from '@/types/mealPlanner';
import { NutritionBadges } from '@/components/NutritionBadges';
import { RecipeSelectorModal } from '@/components/RecipeSelectorModal';
import { calculateMealNutrition, calculateDayNutrition } from '@/utils/nutrition';

interface DayCardProps {
  dayIndex: number;
  dayPlan: DayPlan;
  recipes: Recipe[];
  ingredientBase: BaseIngredient[];
  onUpdateMeal: (mealType: MealType, items: MealItem[]) => void;
  onCopyMeal: (mealType: MealType, targetDayIndex: number) => void;
  allDayPlans: { [dayIndex: number]: DayPlan };
  allTags: string[];
}

const mealBgColors: Record<MealType, string> = {
  breakfast: 'bg-meal-breakfast',
  snack: 'bg-meal-snack',
  lunch: 'bg-meal-lunch',
  dinner: 'bg-meal-dinner',
};

const emptyDayPlan: DayPlan = {
  breakfast: [],
  snack: [],
  lunch: [],
  dinner: [],
};

export function DayCard({
  dayIndex,
  dayPlan,
  recipes,
  ingredientBase,
  onUpdateMeal,
  onCopyMeal,
  allDayPlans,
  allTags,
}: DayCardProps) {
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);
  const [copyingMeal, setCopyingMeal] = useState<MealType | null>(null);

  const safeDayPlan = dayPlan || emptyDayPlan;
  const dayNutrition = calculateDayNutrition(safeDayPlan, recipes, ingredientBase);

  const handleMealClick = (mealType: MealType) => {
    setSelectedMealType(mealType);
  };

  const handleSaveMeal = (items: MealItem[]) => {
    if (selectedMealType) {
      onUpdateMeal(selectedMealType, items);
    }
  };

  const handleCopyClick = (mealType: MealType) => {
    setCopyingMeal(mealType);
  };

  const handleCopyToDay = (targetDayIndex: number) => {
    if (copyingMeal) {
      onCopyMeal(copyingMeal, targetDayIndex);
      setCopyingMeal(null);
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border/50 overflow-hidden">
      <div className="bg-primary/10 px-4 py-3">
        <h3 className="font-bold text-lg text-foreground">{DAY_NAMES[dayIndex]}</h3>
      </div>

      <div className="p-3 space-y-2">
        {MEAL_TYPES.map(({ key, label }) => {
          const mealItems = safeDayPlan[key] || [];
          const mealNutrition = calculateMealNutrition(mealItems, recipes, ingredientBase);
          const hasMeals = mealItems.length > 0;

          return (
            <div key={key} className={`meal-card ${mealBgColors[key]}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">{label}</span>
                {hasMeals && (
                  <Button variant="ghost" size="icon" className="h-7 w-7"
                    onClick={(e) => { e.stopPropagation(); handleCopyClick(key); }}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>

              <div className="cursor-pointer min-h-[40px]" onClick={() => handleMealClick(key)}>
                {hasMeals ? (
                  <div className="space-y-1">
                    {mealItems.map((item, idx) => (
                      <p key={idx} className="text-sm text-foreground/80">
                        • {item.recipeName} ({item.portionWeight}г)
                      </p>
                    ))}
                    <NutritionBadges nutrition={mealNutrition} compact />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">+ Добавить блюдо</p>
                )}
              </div>

              {copyingMeal === key && (
                <div className="mt-2 p-2 bg-card rounded-lg border animate-fade-in">
                  <p className="text-xs text-muted-foreground mb-2">Копировать в:</p>
                  <div className="flex flex-wrap gap-1">
                    {DAY_NAMES.map((dayName, idx) => (
                      <Button key={idx} variant="outline" size="sm" className="h-7 text-xs"
                        onClick={() => handleCopyToDay(idx)} disabled={idx === dayIndex}>
                        {dayName}
                      </Button>
                    ))}
                    <Button variant="ghost" size="sm" className="h-7 text-xs"
                      onClick={() => setCopyingMeal(null)}>
                      Отмена
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-4 py-3 bg-muted/50 border-t">
        <p className="text-sm font-semibold mb-1">Итого за день:</p>
        <NutritionBadges nutrition={dayNutrition} compact />
      </div>

      <RecipeSelectorModal
        isOpen={selectedMealType !== null}
        onClose={() => setSelectedMealType(null)}
        onSave={handleSaveMeal}
        recipes={recipes}
        ingredientBase={ingredientBase}
        currentItems={selectedMealType ? safeDayPlan[selectedMealType] || [] : []}
        mealType={selectedMealType || 'breakfast'}
        allTags={allTags}
      />
    </div>
  );
}
