import { useState } from 'react';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Recipe, RecipeIngredient, BaseIngredient } from '@/types/mealPlanner';
import { NutritionBadges } from '@/components/NutritionBadges';
import { IngredientSelector } from '@/components/IngredientSelector';
import { TagInput } from '@/components/TagInput';
import { calculateRecipeNutrition, getIngredientName } from '@/utils/nutrition';

interface RecipeFormProps {
  onSave: (recipe: Recipe) => void;
  onCancel: () => void;
  initialRecipe?: Recipe;
  ingredientBase: BaseIngredient[];
  availableTags: string[];
  onNewTag: (tag: string) => void;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

interface RecipeIngredientWithWeight extends RecipeIngredient {
  weight: number;
}

export function RecipeForm({ 
  onSave, 
  onCancel, 
  initialRecipe, 
  ingredientBase, 
  availableTags,
  onNewTag 
}: RecipeFormProps) {
  const [name, setName] = useState(initialRecipe?.name || '');
  const [instructions, setInstructions] = useState(initialRecipe?.instructions || '');
  const [ingredients, setIngredients] = useState<RecipeIngredientWithWeight[]>(
    initialRecipe?.ingredients.map((i) => ({ ...i })) || []
  );
  const [tags, setTags] = useState<string[]>(initialRecipe?.tags || []);

  const handleSelectIngredient = (baseIngredient: BaseIngredient) => {
    const newIng: RecipeIngredientWithWeight = {
      ingredientId: baseIngredient.id,
      weight: 100,
    };
    setIngredients([...ingredients, newIng]);
  };

  const handleRemoveIngredient = (ingredientId: string) => {
    setIngredients(ingredients.filter((ing) => ing.ingredientId !== ingredientId));
  };

  const handleWeightChange = (ingredientId: string, weight: number) => {
    setIngredients(
      ingredients.map((ing) =>
        ing.ingredientId === ingredientId ? { ...ing, weight } : ing
      )
    );
  };

  const handleSubmit = () => {
    if (!name.trim() || ingredients.length === 0) return;

    const recipe: Recipe = {
      id: initialRecipe?.id || generateId(),
      name: name.trim(),
      ingredients: ingredients.map((ing) => ({
        ingredientId: ing.ingredientId,
        weight: ing.weight,
      })),
      instructions: instructions.trim(),
      tags,
      createdAt: initialRecipe?.createdAt || Date.now(),
    };

    onSave(recipe);
  };

  const previewNutrition = calculateRecipeNutrition(
    {
      id: '',
      name: '',
      ingredients,
      instructions: '',
      tags: [],
      createdAt: 0,
    },
    ingredientBase
  );

  const usedIngredientIds = ingredients.map((ing) => ing.ingredientId);

  return (
    <div className="space-y-4 animate-fade-in">
      <Input
        placeholder="Название рецепта"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="text-lg font-semibold h-12"
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Ингредиенты</h3>
        </div>

        <IngredientSelector
          ingredientBase={ingredientBase}
          onSelect={handleSelectIngredient}
          excludeIds={usedIngredientIds}
        />

        {ingredients.length > 0 && (
          <div className="space-y-2">
            {ingredients.map((ing) => {
              const baseIng = ingredientBase.find((b) => b.id === ing.ingredientId);
              return (
                <div
                  key={ing.ingredientId}
                  className="bg-secondary/50 rounded-lg p-3 flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {getIngredientName(ing.ingredientId, ingredientBase)}
                    </p>
                    {baseIng && (
                      <p className="text-xs text-muted-foreground">
                        {Math.round(baseIng.kcalPer100 * ing.weight / 100)} ккал
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={ing.weight || ''}
                      onChange={(e) => handleWeightChange(ing.ingredientId, Number(e.target.value))}
                      className="w-20 h-9 text-center"
                    />
                    <span className="text-sm text-muted-foreground">г</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveIngredient(ing.ingredientId)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {ingredientBase.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Сначала добавьте ингредиенты во вкладке "Ингредиенты"
          </p>
        )}
      </div>

      <Textarea
        placeholder="Инструкции по приготовлению..."
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        className="min-h-[100px]"
      />

      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">Метки (теги)</h3>
        <TagInput
          tags={tags}
          availableTags={availableTags}
          onChange={setTags}
          onNewTag={onNewTag}
        />
      </div>

      {ingredients.length > 0 && (
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
          disabled={!name.trim() || ingredients.length === 0}
        >
          <Save className="w-4 h-4" />
          Сохранить
        </Button>
      </div>
    </div>
  );
}
