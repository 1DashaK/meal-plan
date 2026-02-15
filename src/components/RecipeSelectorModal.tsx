import { useState, useMemo } from 'react';
import { X, Check, Plus, Minus, Search, Filter, Apple, ChefHat, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Recipe, MealItem, MealType, BaseIngredient } from '@/types/mealPlanner';
import { NutritionBadges } from '@/components/NutritionBadges';
import { calculateRecipeNutrition, calculatePortionNutrition, calculateRawIngredientNutrition, getIngredientName } from '@/utils/nutrition';

interface RecipeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (items: MealItem[]) => void;
  recipes: Recipe[];
  ingredientBase: BaseIngredient[];
  currentItems: MealItem[];
  mealType: MealType;
  allTags: string[];
}

const mealLabels: Record<MealType, string> = {
  breakfast: 'Завтрак',
  snack: 'Перекус',
  lunch: 'Обед',
  dinner: 'Ужин',
};

type FilterMode = 'and' | 'or';
type ViewStep = 'select' | 'confirm';

interface IngredientForConfirmation {
  ingredientId: string;
  name: string;
  totalWeight: number;
  checked: boolean;
}

export function RecipeSelectorModal({
  isOpen,
  onClose,
  onSave,
  recipes,
  ingredientBase,
  currentItems,
  mealType,
  allTags,
}: RecipeSelectorModalProps) {
  const [selectedItems, setSelectedItems] = useState<MealItem[]>(currentItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [filterMode, setFilterMode] = useState<FilterMode>('and');
  const [viewStep, setViewStep] = useState<ViewStep>('select');
  const [confirmIngredients, setConfirmIngredients] = useState<IngredientForConfirmation[]>([]);

  const filteredRecipes = useMemo(() => {
    let result = recipes;
    if (searchQuery) {
      result = result.filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (filterTags.length > 0) {
      result = result.filter((r) => {
        if (filterMode === 'and') {
          return filterTags.every((tag) => r.tags?.includes(tag));
        } else {
          return filterTags.some((tag) => r.tags?.includes(tag));
        }
      });
    }
    return result;
  }, [recipes, searchQuery, filterTags, filterMode]);

  const filteredIngredients = useMemo(() => {
    if (!searchQuery) return ingredientBase;
    return ingredientBase.filter((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [ingredientBase, searchQuery]);

  if (!isOpen) return null;

  const handleToggleRecipe = (recipe: Recipe) => {
    const existing = selectedItems.find((item) => item.recipeId === recipe.id && item.type !== 'ingredient');
    if (existing) {
      setSelectedItems(selectedItems.filter((item) => !(item.recipeId === recipe.id && item.type !== 'ingredient')));
    } else {
      const totalWeight = calculateRecipeNutrition(recipe, ingredientBase).weight;
      setSelectedItems([...selectedItems, {
        recipeId: recipe.id,
        recipeName: recipe.name,
        portionWeight: totalWeight,
        type: 'recipe',
      }]);
    }
  };

  const handleToggleIngredient = (ingredient: BaseIngredient) => {
    const existing = selectedItems.find((item) => item.recipeId === ingredient.id && item.type === 'ingredient');
    if (existing) {
      setSelectedItems(selectedItems.filter((item) => !(item.recipeId === ingredient.id && item.type === 'ingredient')));
    } else {
      setSelectedItems([...selectedItems, {
        recipeId: ingredient.id,
        recipeName: ingredient.name,
        portionWeight: 100,
        type: 'ingredient',
      }]);
    }
  };

  const handlePortionChange = (id: string, type: string, weight: number) => {
    setSelectedItems(
      selectedItems.map((item) =>
        item.recipeId === id && (item.type || 'recipe') === type
          ? { ...item, portionWeight: Math.max(1, weight) }
          : item
      )
    );
  };

  const handleTagToggle = (tag: string) => {
    setFilterTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const handleProceedToConfirm = () => {
    // Build ingredient list from all selected items
    const ingredientMap = new Map<string, { name: string; weight: number }>();

    selectedItems.forEach((item) => {
      if (item.type === 'ingredient') {
        const ing = ingredientBase.find((i) => i.id === item.recipeId);
        if (ing) {
          const key = ing.id;
          const existing = ingredientMap.get(key);
          ingredientMap.set(key, {
            name: ing.name,
            weight: (existing?.weight || 0) + item.portionWeight,
          });
        }
      } else {
        const recipe = recipes.find((r) => r.id === item.recipeId);
        if (!recipe) return;
        const totalWeight = calculateRecipeNutrition(recipe, ingredientBase).weight;
        const ratio = totalWeight > 0 ? item.portionWeight / totalWeight : 0;

        recipe.ingredients.forEach((ri) => {
          const key = ri.ingredientId;
          const existing = ingredientMap.get(key);
          const name = getIngredientName(ri.ingredientId, ingredientBase);
          ingredientMap.set(key, {
            name,
            weight: (existing?.weight || 0) + Math.round(ri.weight * ratio),
          });
        });
      }
    });

    setConfirmIngredients(
      Array.from(ingredientMap.entries()).map(([id, { name, weight }]) => ({
        ingredientId: id,
        name,
        totalWeight: weight,
        checked: true,
      }))
    );
    setViewStep('confirm');
  };

  const handleConfirmSave = () => {
    const uncheckedIds = confirmIngredients.filter((i) => !i.checked).map((i) => i.ingredientId);
    const itemsWithExclusions = selectedItems.map((item) => ({
      ...item,
      type: item.type || 'recipe' as const,
      excludedIngredientIds: uncheckedIds,
    }));
    onSave(itemsWithExclusions);
    setViewStep('select');
    onClose();
  };

  const handleBack = () => {
    setViewStep('select');
  };

  // Confirmation view
  if (viewStep === 'confirm') {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 animate-fade-in">
        <div className="bg-background w-full max-w-lg rounded-t-2xl max-h-[85vh] flex flex-col animate-slide-up">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-lg font-bold">Ингредиенты для приготовления</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <p className="text-sm text-muted-foreground mb-3">
              Снимите галочку с ингредиентов, которые не нужно добавлять в список покупок:
            </p>
            {confirmIngredients.map((item) => (
              <div
                key={item.ingredientId}
                className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/50"
              >
                <Checkbox
                  checked={item.checked}
                  onCheckedChange={() =>
                    setConfirmIngredients((prev) =>
                      prev.map((i) =>
                        i.ingredientId === item.ingredientId
                          ? { ...i, checked: !i.checked }
                          : i
                      )
                    )
                  }
                  className="h-5 w-5"
                />
                <span className="flex-1 font-medium text-sm">{item.name}</span>
                <span className="text-sm text-muted-foreground">{item.totalWeight}г</span>
              </div>
            ))}
          </div>

          <div className="p-4 border-t flex gap-2">
            <Button variant="outline" onClick={handleBack} className="flex-1">
              Назад
            </Button>
            <Button onClick={handleConfirmSave} className="flex-1 gap-1">
              <Check className="w-4 h-4" />
              Подтвердить и добавить
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Selection view
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 animate-fade-in">
      <div className="bg-background w-full max-w-lg rounded-t-2xl max-h-[85vh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">{mealLabels[mealType]}: выбор блюд</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search + Filter */}
        <div className="px-4 pt-3 space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
            <Button
              variant={showFilter ? 'default' : 'outline'}
              size="icon"
              className="h-10 w-10"
              onClick={() => setShowFilter(!showFilter)}
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {showFilter && allTags.length > 0 && (
            <div className="bg-card rounded-lg p-3 border border-border/50 space-y-2 animate-fade-in">
              <div className="flex items-center gap-3 text-xs">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="filterMode"
                    checked={filterMode === 'and'}
                    onChange={() => setFilterMode('and')}
                    className="accent-primary"
                  />
                  Пересечение (И)
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="filterMode"
                    checked={filterMode === 'or'}
                    onChange={() => setFilterMode('or')}
                    className="accent-primary"
                  />
                  Объединение (ИЛИ)
                </label>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      filterTags.includes(tag)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card text-foreground border-border hover:bg-accent'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setFilterTags([])}
                >
                  Сбросить
                </Button>
                <Button
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setShowFilter(false)}
                >
                  Применить
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Recipes section */}
          {filteredRecipes.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                <ChefHat className="w-4 h-4" /> Рецепты
              </h3>
              {filteredRecipes.map((recipe) => {
                const isSelected = selectedItems.some((item) => item.recipeId === recipe.id && item.type !== 'ingredient');
                const selectedItem = selectedItems.find((item) => item.recipeId === recipe.id && item.type !== 'ingredient');
                const nutrition = calculateRecipeNutrition(recipe, ingredientBase);
                const portionNutrition = selectedItem
                  ? calculatePortionNutrition(recipe, selectedItem.portionWeight, ingredientBase)
                  : null;

                return (
                  <div
                    key={recipe.id}
                    className={`rounded-xl p-3 border-2 transition-all ${
                      isSelected ? 'border-primary bg-primary/5' : 'border-transparent bg-secondary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleToggleRecipe(recipe)}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                        isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                      }`}>
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
                            <Button variant="outline" size="icon" className="h-8 w-8"
                              onClick={() => handlePortionChange(recipe.id, 'recipe', selectedItem.portionWeight - 50)}>
                              <Minus className="w-4 h-4" />
                            </Button>
                            <Input type="number" value={selectedItem.portionWeight}
                              onChange={(e) => handlePortionChange(recipe.id, 'recipe', Number(e.target.value))}
                              className="w-20 h-8 text-center" />
                            <span className="text-sm text-muted-foreground">г</span>
                            <Button variant="outline" size="icon" className="h-8 w-8"
                              onClick={() => handlePortionChange(recipe.id, 'recipe', selectedItem.portionWeight + 50)}>
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {portionNutrition && <NutritionBadges nutrition={portionNutrition} compact />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Ingredients section */}
          {filteredIngredients.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                <Apple className="w-4 h-4" /> Ингредиенты
              </h3>
              {filteredIngredients.map((ingredient) => {
                const isSelected = selectedItems.some((item) => item.recipeId === ingredient.id && item.type === 'ingredient');
                const selectedItem = selectedItems.find((item) => item.recipeId === ingredient.id && item.type === 'ingredient');
                const portionNutrition = selectedItem
                  ? calculateRawIngredientNutrition(ingredient.id, selectedItem.portionWeight, ingredientBase)
                  : null;

                return (
                  <div
                    key={ingredient.id}
                    className={`rounded-xl p-3 border-2 transition-all ${
                      isSelected ? 'border-primary bg-primary/5' : 'border-transparent bg-secondary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleToggleIngredient(ingredient)}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                        isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                      }`}>
                        {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{ingredient.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {ingredient.kcalPer100} ккал/100г
                        </p>
                      </div>
                    </div>

                    {isSelected && selectedItem && (
                      <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Вес:</span>
                          <div className="flex items-center gap-1">
                            <Button variant="outline" size="icon" className="h-8 w-8"
                              onClick={() => handlePortionChange(ingredient.id, 'ingredient', selectedItem.portionWeight - 50)}>
                              <Minus className="w-4 h-4" />
                            </Button>
                            <Input type="number" value={selectedItem.portionWeight}
                              onChange={(e) => handlePortionChange(ingredient.id, 'ingredient', Number(e.target.value))}
                              className="w-20 h-8 text-center" />
                            <span className="text-sm text-muted-foreground">г</span>
                            <Button variant="outline" size="icon" className="h-8 w-8"
                              onClick={() => handlePortionChange(ingredient.id, 'ingredient', selectedItem.portionWeight + 50)}>
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {portionNutrition && <NutritionBadges nutrition={portionNutrition} compact />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {filteredRecipes.length === 0 && filteredIngredients.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Ничего не найдено</p>
              <p className="text-sm">Попробуйте изменить поиск или фильтры</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t">
          <Button
            onClick={selectedItems.length > 0 ? handleProceedToConfirm : undefined}
            disabled={selectedItems.length === 0}
            className="w-full h-12"
          >
            <Check className="w-5 h-5 mr-2" />
            Сохранить ({selectedItems.length})
          </Button>
        </div>
      </div>
    </div>
  );
}
