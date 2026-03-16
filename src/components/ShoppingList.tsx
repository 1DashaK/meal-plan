import { useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Recipe, DayPlan, BaseIngredient } from '@/types/mealPlanner';
import { calculateRecipeNutrition, getIngredientName } from '@/utils/nutrition';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface ShoppingListProps {
  weekPlan: { [dayIndex: number]: DayPlan } | undefined;
  recipes: Recipe[];
  ingredientBase: BaseIngredient[];
}

interface ShoppingItem {
  name: string;
  totalWeight: number;
  checked: boolean;
  isCustom?: boolean;
}

export function ShoppingList({ weekPlan, recipes, ingredientBase }: ShoppingListProps) {
  const [checkedItems, setCheckedItems] = useLocalStorage<string[]>('meal-planner-shopping-checked', []);
  const [customItems, setCustomItems] = useLocalStorage<{ name: string; weight: number }[]>('meal-planner-shopping-custom', []);
  const [newItemName, setNewItemName] = useState('');
  const [newItemWeight, setNewItemWeight] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const checkedSet = new Set(checkedItems);

  const aggregateIngredients = (): ShoppingItem[] => {
    const ingredientMap = new Map<string, number>();

    if (weekPlan) {
      Object.values(weekPlan).forEach((dayPlan) => {
        if (!dayPlan) return;
        const allMeals = [
          ...(dayPlan.breakfast || []),
          ...(dayPlan.snack || []),
          ...(dayPlan.lunch || []),
          ...(dayPlan.dinner || []),
        ];

        allMeals.forEach((mealItem) => {
          const excluded = new Set(mealItem.excludedIngredientIds || []);

          if (mealItem.type === 'ingredient') {
            if (excluded.has(mealItem.recipeId)) return;
            const ingredientName = getIngredientName(mealItem.recipeId, ingredientBase);
            const normalizedName = ingredientName.toLowerCase().trim();
            const existing = ingredientMap.get(normalizedName) || 0;
            ingredientMap.set(normalizedName, existing + mealItem.portionWeight);
          } else {
            const recipe = recipes.find((r) => r.id === mealItem.recipeId);
            if (!recipe) return;
            const totalRecipeWeight = calculateRecipeNutrition(recipe, ingredientBase).weight;
            const ratio = totalRecipeWeight > 0 ? mealItem.portionWeight / totalRecipeWeight : 0;

            recipe.ingredients.forEach((recipeIngredient) => {
              if (excluded.has(recipeIngredient.ingredientId)) return;
              const ingredientName = getIngredientName(recipeIngredient.ingredientId, ingredientBase);
              const ingredientWeight = recipeIngredient.weight * ratio;
              const normalizedName = ingredientName.toLowerCase().trim();
              const existing = ingredientMap.get(normalizedName) || 0;
              ingredientMap.set(normalizedName, existing + ingredientWeight);
            });
          }
        });
      });
    }

    const items: ShoppingItem[] = Array.from(ingredientMap.entries())
      .map(([name, weight]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        totalWeight: Math.round(weight),
        checked: checkedSet.has(name.toLowerCase()),
      }));

    // Add custom items
    customItems.forEach((ci) => {
      const normalizedName = ci.name.toLowerCase().trim();
      const existingIdx = items.findIndex((i) => i.name.toLowerCase() === normalizedName);
      if (existingIdx >= 0) {
        items[existingIdx].totalWeight += ci.weight;
      } else {
        items.push({
          name: ci.name,
          totalWeight: ci.weight,
          checked: checkedSet.has(normalizedName),
          isCustom: true,
        });
      }
    });

    return items.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  };

  const items = aggregateIngredients();

  const toggleItem = (name: string) => {
    const normalizedName = name.toLowerCase();
    if (checkedSet.has(normalizedName)) {
      setCheckedItems(checkedItems.filter((i) => i !== normalizedName));
    } else {
      setCheckedItems([...checkedItems, normalizedName]);
    }
  };

  const handleAddCustomItem = () => {
    if (!newItemName.trim()) return;
    const weight = Number(newItemWeight) || 0;
    setCustomItems([...customItems, { name: newItemName.trim(), weight }]);
    setNewItemName('');
    setNewItemWeight('');
    setShowAddForm(false);
  };

  const handleRemoveCustomItem = (name: string) => {
    setCustomItems(customItems.filter((i) => i.name !== name));
    setCheckedItems(checkedItems.filter((i) => i !== name.toLowerCase()));
  };

  const checkedCount = items.filter((item) => item.checked).length;

  if (items.length === 0 && !showAddForm) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Список пуст</h3>
          <p className="text-muted-foreground text-sm max-w-[250px]">
            Добавьте блюда в план на неделю, и список покупок сформируется автоматически
          </p>
        </div>
        <Button variant="outline" className="w-full gap-2" onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4" /> Добавить вручную
        </Button>
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
              item.checked ? 'bg-success/10 opacity-60' : 'bg-card border border-border/50'
            }`}
            onClick={() => toggleItem(item.name)}
          >
            <Checkbox
              checked={item.checked}
              onCheckedChange={() => toggleItem(item.name)}
              className="h-5 w-5"
            />
            <span className={`flex-1 font-medium ${item.checked ? 'line-through text-muted-foreground' : ''}`}>
              {item.name}
            </span>
            {item.totalWeight > 0 && (
              <span className="text-sm text-muted-foreground">{item.totalWeight}г</span>
            )}
            {item.isCustom && (
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0"
                onClick={(e) => { e.stopPropagation(); handleRemoveCustomItem(item.name); }}>
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {showAddForm ? (
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Input placeholder="Название" value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustomItem()} />
          </div>
          <div className="w-20">
            <Input placeholder="г" type="number" value={newItemWeight}
              onChange={(e) => setNewItemWeight(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustomItem()} />
          </div>
          <Button size="icon" className="h-10 w-10 shrink-0" onClick={handleAddCustomItem}>
            <Check className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0" onClick={() => setShowAddForm(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <Button variant="outline" className="w-full gap-2" onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4" /> Добавить вручную
        </Button>
      )}
    </div>
  );
}
