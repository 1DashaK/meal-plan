import { useState } from 'react';
import { X, Check, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Recipe, MealItem, MealType } from '@/types/mealPlanner';
import { NutritionBadges } from '@/components/NutritionBadges';
import { calculateRecipeNutrition, calculatePortionNutrition } from '@/utils/nutrition';

interface RecipeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (items: MealItem[]) => void;
  recipes: Recipe[];
  currentItems: MealItem[];
  mealType: MealType;
}

const mealLabels: Record<MealType, string> = {
  breakfast: 'Завтрак',
  snack: 'Перекус',
  lunch: 'Обед',
  dinner: 'Ужин',
};

export function RecipeSelectorModal({
  isOpen,
  onClose,
  onSave,
  recipes,
  currentItems,
  mealType,
}: RecipeSelectorModalProps) {
  const [selectedItems, setSelectedItems] = useState<MealItem[]>(currentItems);

  if (!isOpen) return null;

  const handleToggleRecipe = (recipe: Recipe) => {
    const existing = selectedItems.find((item) => item.recipeId === recipe.id);
    if (existing) {
      setSelectedItems(selectedItems.filter((item) => item.recipeId !== recipe.id));
    } else {
      const totalWeight = calculateRecipeNutrition(recipe).weight;
      setSelectedItems([
        ...selectedItems,
        {
          recipeId: recipe.id,
          recipeName: recipe.name,
          portionWeight: totalWeight,
        },
      ]);
    }
  };

  const handlePortionChange = (recipeId: string, weight: number) => {
    setSelectedItems(
      selectedItems.map((item) =>
        item.recipeId === recipeId ? { ...item, portionWeight: Math.max(1, weight) } : item
      )
    );
  };

  const handleSave = () => {
    onSave(selectedItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 animate-fade-in">
      <div className="bg-background w-full max-w-lg rounded-t-2xl max-h-[85vh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">{mealLabels[mealType]}: выбор блюд</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {recipes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Нет рецептов</p>
              <p className="text-sm">Добавьте рецепты во вкладке "Мои рецепты"</p>
            </div>
          ) : (
            recipes.map((recipe) => {
              const isSelected = selectedItems.some((item) => item.recipeId === recipe.id);
              const selectedItem = selectedItems.find((item) => item.recipeId === recipe.id);
              const nutrition = calculateRecipeNutrition(recipe);
              const portionNutrition = selectedItem
                ? calculatePortionNutrition(recipe, selectedItem.portionWeight)
                : null;

              return (
                <div
                  key={recipe.id}
                  className={`rounded-xl p-3 border-2 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent bg-secondary/50'
                  }`}
                >
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => handleToggleRecipe(recipe)}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                        isSelected
                          ? 'bg-primary border-primary'
                          : 'border-muted-foreground/30'
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{recipe.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        Всего: {nutrition.weight}г • {nutrition.kcal} ккал
                      </p>
                    </div>
                  </div>

                  {isSelected && selectedItem && (
                    <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Порция:</span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              handlePortionChange(
                                recipe.id,
                                selectedItem.portionWeight - 50
                              )
                            }
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <Input
                            type="number"
                            value={selectedItem.portionWeight}
                            onChange={(e) =>
                              handlePortionChange(recipe.id, Number(e.target.value))
                            }
                            className="w-20 h-8 text-center"
                          />
                          <span className="text-sm text-muted-foreground">г</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              handlePortionChange(
                                recipe.id,
                                selectedItem.portionWeight + 50
                              )
                            }
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {portionNutrition && (
                        <NutritionBadges nutrition={portionNutrition} compact />
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t">
          <Button onClick={handleSave} className="w-full h-12">
            <Check className="w-5 h-5 mr-2" />
            Сохранить ({selectedItems.length})
          </Button>
        </div>
      </div>
    </div>
  );
}
