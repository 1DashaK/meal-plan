import { useState } from 'react';
import { Check } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Recipe, DayPlan, Ingredient } from '@/types/mealPlanner';
import { calculateRecipeNutrition } from '@/utils/nutrition';

interface ShoppingListProps {
  weekPlan: { [dayIndex: number]: DayPlan } | undefined;
  recipes: Recipe[];
}

interface ShoppingItem {
  name: string;
  totalWeight: number;
  checked: boolean;
}

export function ShoppingList({ weekPlan, recipes }: ShoppingListProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const aggregateIngredients = (): ShoppingItem[] => {
    if (!weekPlan) return [];

    const ingredientMap = new Map<string, number>();

    Object.values(weekPlan).forEach((dayPlan) => {
      if (!dayPlan) return;
      
      const allMeals = [
        ...(dayPlan.breakfast || []),
        ...(dayPlan.snack || []),
        ...(dayPlan.lunch || []),
        ...(dayPlan.dinner || []),
      ];

      allMeals.forEach((mealItem) => {
        const recipe = recipes.find((r) => r.id === mealItem.recipeId);
        if (!recipe) return;

        const totalRecipeWeight = calculateRecipeNutrition(recipe).weight;
        const ratio = mealItem.portionWeight / totalRecipeWeight;

        recipe.ingredients.forEach((ingredient) => {
          const ingredientWeight = ingredient.weight * ratio;
          const normalizedName = ingredient.name.toLowerCase().trim();
          const existing = ingredientMap.get(normalizedName) || 0;
          ingredientMap.set(normalizedName, existing + ingredientWeight);
        });
      });
    });

    return Array.from(ingredientMap.entries())
      .map(([name, weight]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        totalWeight: Math.round(weight),
        checked: checkedItems.has(name.toLowerCase()),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  };

  const items = aggregateIngredients();

  const toggleItem = (name: string) => {
    const normalizedName = name.toLowerCase();
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(normalizedName)) {
        next.delete(normalizedName);
      } else {
        next.add(normalizedName);
      }
      return next;
    });
  };

  const checkedCount = items.filter((item) => item.checked).length;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Список пуст
        </h3>
        <p className="text-muted-foreground text-sm max-w-[250px]">
          Добавьте блюда в план на неделю, и список покупок сформируется автоматически
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Список покупок</h2>
        <span className="text-sm text-muted-foreground">
          {checkedCount}/{items.length} куплено
        </span>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.name}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer ${
              item.checked
                ? 'bg-success/10 opacity-60'
                : 'bg-card border border-border/50'
            }`}
            onClick={() => toggleItem(item.name)}
          >
            <Checkbox
              checked={item.checked}
              onCheckedChange={() => toggleItem(item.name)}
              className="h-5 w-5"
            />
            <span
              className={`flex-1 font-medium ${
                item.checked ? 'line-through text-muted-foreground' : ''
              }`}
            >
              {item.name}
            </span>
            <span className="text-sm text-muted-foreground">
              {item.totalWeight}г
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
