import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Recipe, Ingredient } from '@/types/mealPlanner';
import { NutritionBadges } from '@/components/NutritionBadges';
import { calculateRecipeNutrition } from '@/utils/nutrition';

interface RecipeFormProps {
  onSave: (recipe: Recipe) => void;
  onCancel: () => void;
  initialRecipe?: Recipe;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function createEmptyIngredient(): Ingredient {
  return {
    id: generateId(),
    name: '',
    weight: 100,
    kcalPer100: 0,
    proteinPer100: 0,
    fatPer100: 0,
    carbsPer100: 0,
    fiberPer100: 0,
  };
}

export function RecipeForm({ onSave, onCancel, initialRecipe }: RecipeFormProps) {
  const [name, setName] = useState(initialRecipe?.name || '');
  const [instructions, setInstructions] = useState(initialRecipe?.instructions || '');
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initialRecipe?.ingredients || [createEmptyIngredient()]
  );
  const [expandedIngredient, setExpandedIngredient] = useState<string | null>(
    ingredients[0]?.id || null
  );

  const handleAddIngredient = () => {
    const newIng = createEmptyIngredient();
    setIngredients([...ingredients, newIng]);
    setExpandedIngredient(newIng.id);
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients(ingredients.filter((ing) => ing.id !== id));
  };

  const handleIngredientChange = (
    id: string,
    field: keyof Ingredient,
    value: string | number
  ) => {
    setIngredients(
      ingredients.map((ing) =>
        ing.id === id ? { ...ing, [field]: value } : ing
      )
    );
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    
    const validIngredients = ingredients.filter((ing) => ing.name.trim());
    if (validIngredients.length === 0) return;

    const recipe: Recipe = {
      id: initialRecipe?.id || generateId(),
      name: name.trim(),
      ingredients: validIngredients,
      instructions: instructions.trim(),
      createdAt: initialRecipe?.createdAt || Date.now(),
    };

    onSave(recipe);
  };

  const previewNutrition = calculateRecipeNutrition({
    id: '',
    name: '',
    ingredients: ingredients.filter((ing) => ing.name.trim()),
    instructions: '',
    createdAt: 0,
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <Input
        placeholder="Название рецепта"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="text-lg font-semibold h-12"
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Ингредиенты</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddIngredient}
            className="gap-1"
          >
            <Plus className="w-4 h-4" />
            Добавить
          </Button>
        </div>

        <div className="space-y-2">
          {ingredients.map((ing, index) => (
            <div
              key={ing.id}
              className="bg-secondary/50 rounded-lg overflow-hidden"
            >
              <div
                className="flex items-center gap-2 p-3 cursor-pointer"
                onClick={() =>
                  setExpandedIngredient(
                    expandedIngredient === ing.id ? null : ing.id
                  )
                }
              >
                <span className="text-sm font-medium text-muted-foreground w-6">
                  {index + 1}.
                </span>
                <Input
                  placeholder="Название ингредиента"
                  value={ing.name}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleIngredientChange(ing.id, 'name', e.target.value);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 h-9"
                />
                <Input
                  type="number"
                  placeholder="Вес"
                  value={ing.weight || ''}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleIngredientChange(ing.id, 'weight', Number(e.target.value));
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-20 h-9 text-center"
                />
                <span className="text-sm text-muted-foreground">г</span>
                {expandedIngredient === ing.id ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>

              {expandedIngredient === ing.id && (
                <div className="px-3 pb-3 space-y-2 animate-fade-in">
                  <div className="grid grid-cols-5 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Ккал/100г</label>
                      <Input
                        type="number"
                        value={ing.kcalPer100 || ''}
                        onChange={(e) =>
                          handleIngredientChange(ing.id, 'kcalPer100', Number(e.target.value))
                        }
                        className="h-9 text-center"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Белки</label>
                      <Input
                        type="number"
                        step="0.1"
                        value={ing.proteinPer100 || ''}
                        onChange={(e) =>
                          handleIngredientChange(ing.id, 'proteinPer100', Number(e.target.value))
                        }
                        className="h-9 text-center"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Жиры</label>
                      <Input
                        type="number"
                        step="0.1"
                        value={ing.fatPer100 || ''}
                        onChange={(e) =>
                          handleIngredientChange(ing.id, 'fatPer100', Number(e.target.value))
                        }
                        className="h-9 text-center"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Углев.</label>
                      <Input
                        type="number"
                        step="0.1"
                        value={ing.carbsPer100 || ''}
                        onChange={(e) =>
                          handleIngredientChange(ing.id, 'carbsPer100', Number(e.target.value))
                        }
                        className="h-9 text-center"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Клетч.</label>
                      <Input
                        type="number"
                        step="0.1"
                        value={ing.fiberPer100 || ''}
                        onChange={(e) =>
                          handleIngredientChange(ing.id, 'fiberPer100', Number(e.target.value))
                        }
                        className="h-9 text-center"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveIngredient(ing.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Удалить
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Textarea
        placeholder="Инструкции по приготовлению..."
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        className="min-h-[100px]"
      />

      {ingredients.some((ing) => ing.name.trim()) && (
        <div className="p-3 bg-primary/5 rounded-lg space-y-2">
          <h4 className="text-sm font-semibold text-foreground">ИТОГО по рецепту:</h4>
          <NutritionBadges nutrition={previewNutrition} showWeight />
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Отмена
        </Button>
        <Button
          onClick={handleSubmit}
          className="flex-1 gap-1"
          disabled={!name.trim() || !ingredients.some((ing) => ing.name.trim())}
        >
          <Save className="w-4 h-4" />
          Сохранить
        </Button>
      </div>
    </div>
  );
}
