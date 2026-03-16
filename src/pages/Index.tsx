import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, UtensilsCrossed, CalendarDays, ShoppingCart, Apple } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Recipe, DayPlan, MealType, MealItem, WeekPlan, DAY_NAMES, BaseIngredient } from '@/types/mealPlanner';
import { RecipeForm } from '@/components/RecipeForm';
import { RecipeCard } from '@/components/RecipeCard';
import { DayCard } from '@/components/DayCard';
import { ShoppingList } from '@/components/ShoppingList';
import { NutritionBadges } from '@/components/NutritionBadges';
import { IngredientForm } from '@/components/IngredientForm';
import { IngredientCard } from '@/components/IngredientCard';
import { TagFilter } from '@/components/TagFilter';
import { ImportExport } from '@/components/ImportExport';
import { getCurrentWeekKey, getWeekRange, navigateWeek } from '@/utils/weekUtils';
import { calculateDayNutrition, emptyNutrition } from '@/utils/nutrition';

type TabType = 'ingredients' | 'recipes' | 'plan' | 'shopping';

const emptyDayPlan: DayPlan = {
  breakfast: [],
  snack: [],
  lunch: [],
  dinner: [],
};

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('plan');
  const [ingredientBase, setIngredientBase] = useLocalStorage<BaseIngredient[]>('meal-planner-ingredient-base', []);
  const [recipes, setRecipes] = useLocalStorage<Recipe[]>('meal-planner-recipes', []);
  const [recipeTags, setRecipeTags] = useLocalStorage<string[]>('meal-planner-recipe-tags', []);
  const [weekPlans, setWeekPlans] = useLocalStorage<WeekPlan>('meal-planner-week-plans', {});
  const [currentWeekKey, setCurrentWeekKey] = useState(getCurrentWeekKey());
  
  const [showIngredientForm, setShowIngredientForm] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<BaseIngredient | null>(null);
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const currentWeekPlan = weekPlans[currentWeekKey] || {};

  // Ingredient handlers
  const handleSaveIngredient = (ingredient: BaseIngredient) => {
    if (editingIngredient) {
      setIngredientBase(ingredientBase.map((i) => (i.id === ingredient.id ? ingredient : i)));
    } else {
      setIngredientBase([...ingredientBase, ingredient]);
    }
    setShowIngredientForm(false);
    setEditingIngredient(null);
  };

  const handleEditIngredient = (ingredient: BaseIngredient) => {
    setEditingIngredient(ingredient);
    setShowIngredientForm(true);
  };

  const handleDeleteIngredient = (ingredientId: string) => {
    setIngredientBase(ingredientBase.filter((i) => i.id !== ingredientId));
  };

  // Recipe handlers
  const handleSaveRecipe = (recipe: Recipe) => {
    if (editingRecipe) {
      setRecipes(recipes.map((r) => (r.id === recipe.id ? recipe : r)));
    } else {
      setRecipes([...recipes, recipe]);
    }
    setShowRecipeForm(false);
    setEditingRecipe(null);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setShowRecipeForm(true);
  };

  const handleDeleteRecipe = (recipeId: string) => {
    setRecipes(recipes.filter((r) => r.id !== recipeId));
  };

  const handleNewTag = (tag: string) => {
    if (!recipeTags.includes(tag)) {
      setRecipeTags([...recipeTags, tag]);
    }
  };

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const filteredRecipes = selectedTags.length > 0
    ? recipes.filter((recipe) => selectedTags.every((tag) => recipe.tags?.includes(tag)))
    : recipes;

  // Import handler
  const handleImport = (data: { recipes?: Recipe[]; ingredientBase?: BaseIngredient[] }) => {
    if (data.ingredientBase) {
      const existingIds = new Set(ingredientBase.map((i) => i.id));
      const newItems = data.ingredientBase.filter((i) => !existingIds.has(i.id));
      setIngredientBase([...ingredientBase, ...newItems]);
    }
    if (data.recipes) {
      const existingIds = new Set(recipes.map((r) => r.id));
      const newItems = data.recipes.filter((r) => !existingIds.has(r.id));
      setRecipes([...recipes, ...newItems]);
      // Also import tags
      const newTags = new Set(recipeTags);
      data.recipes.forEach((r) => r.tags?.forEach((t) => newTags.add(t)));
      setRecipeTags(Array.from(newTags));
    }
  };

  // Week plan handlers
  const handleUpdateMeal = (dayIndex: number, mealType: MealType, items: MealItem[]) => {
    setWeekPlans((prev) => ({
      ...prev,
      [currentWeekKey]: {
        ...prev[currentWeekKey],
        [dayIndex]: {
          ...(prev[currentWeekKey]?.[dayIndex] || emptyDayPlan),
          [mealType]: items,
        },
      },
    }));
  };

  const handleCopyMeal = (sourceDayIndex: number, mealType: MealType, targetDayIndex: number) => {
    const sourceMeal = currentWeekPlan[sourceDayIndex]?.[mealType] || [];
    handleUpdateMeal(targetDayIndex, mealType, [...sourceMeal]);
  };

  const weekTotals = DAY_NAMES.reduce(
    (acc, _, dayIndex) => {
      const dayPlan = currentWeekPlan[dayIndex];
      if (!dayPlan) return acc;
      const dayNutrition = calculateDayNutrition(dayPlan, recipes, ingredientBase);
      return {
        kcal: acc.kcal + dayNutrition.kcal,
        protein: Math.round((acc.protein + dayNutrition.protein) * 10) / 10,
        fat: Math.round((acc.fat + dayNutrition.fat) * 10) / 10,
        carbs: Math.round((acc.carbs + dayNutrition.carbs) * 10) / 10,
        fiber: Math.round((acc.fiber + dayNutrition.fiber) * 10) / 10,
        mg: Math.round((acc.mg + dayNutrition.mg) * 10) / 10,
        fe: Math.round((acc.fe + dayNutrition.fe) * 10) / 10,
        vitC: Math.round((acc.vitC + dayNutrition.vitC) * 10) / 10,
        weight: acc.weight + dayNutrition.weight,
      };
    },
    emptyNutrition()
  );

  const tabs = [
    { key: 'ingredients' as TabType, label: 'Ингр.', icon: Apple },
    { key: 'recipes' as TabType, label: 'Рецепты', icon: UtensilsCrossed },
    { key: 'plan' as TabType, label: 'План', icon: CalendarDays },
    { key: 'shopping' as TabType, label: 'Покупки', icon: ShoppingCart },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 w-full" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}>
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b w-full">
        <div className="container py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="text-2xl">🥗</span> Планировщик питания
          </h1>
          <ImportExport recipes={recipes} ingredientBase={ingredientBase} onImport={handleImport} />
        </div>
      </header>

      <main className="container py-4">
        {activeTab === 'ingredients' && (
          <div className="space-y-4 animate-fade-in">
            {showIngredientForm ? (
              <IngredientForm
                onSave={handleSaveIngredient}
                onCancel={() => { setShowIngredientForm(false); setEditingIngredient(null); }}
                initialIngredient={editingIngredient || undefined}
              />
            ) : (
              <>
                <Button onClick={() => setShowIngredientForm(true)} className="w-full h-12 gap-2">
                  <Plus className="w-5 h-5" /> Добавить ингредиент
                </Button>
                {ingredientBase.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-lg">Нет ингредиентов</p>
                    <p className="text-sm">Добавьте свой первый ингредиент</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ingredientBase.map((ingredient) => (
                      <IngredientCard key={ingredient.id} ingredient={ingredient}
                        onEdit={() => handleEditIngredient(ingredient)}
                        onDelete={() => handleDeleteIngredient(ingredient.id)} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'recipes' && (
          <div className="space-y-4 animate-fade-in">
            {showRecipeForm ? (
              <RecipeForm onSave={handleSaveRecipe}
                onCancel={() => { setShowRecipeForm(false); setEditingRecipe(null); }}
                initialRecipe={editingRecipe || undefined}
                ingredientBase={ingredientBase} availableTags={recipeTags} onNewTag={handleNewTag} />
            ) : (
              <>
                <Button onClick={() => setShowRecipeForm(true)} className="w-full h-12 gap-2">
                  <Plus className="w-5 h-5" /> Добавить рецепт
                </Button>
                <TagFilter allTags={recipeTags} selectedTags={selectedTags}
                  onTagToggle={handleTagToggle} onReset={() => setSelectedTags([])} />
                {filteredRecipes.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-lg">{recipes.length === 0 ? 'Нет рецептов' : 'Нет рецептов с выбранными метками'}</p>
                    <p className="text-sm">{recipes.length === 0 ? 'Добавьте свой первый рецепт' : 'Попробуйте сбросить фильтры'}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredRecipes.map((recipe) => (
                      <RecipeCard key={recipe.id} recipe={recipe} ingredientBase={ingredientBase}
                        onEdit={() => handleEditRecipe(recipe)} onDelete={() => handleDeleteRecipe(recipe.id)} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'plan' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between bg-card rounded-xl p-3 shadow-sm border border-border/50">
              <Button variant="ghost" size="icon" onClick={() => setCurrentWeekKey(navigateWeek(currentWeekKey, 'prev'))}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Текущая неделя</p>
                <p className="font-semibold">{getWeekRange(currentWeekKey)}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setCurrentWeekKey(navigateWeek(currentWeekKey, 'next'))}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              {DAY_NAMES.map((_, dayIndex) => (
                <DayCard key={dayIndex} dayIndex={dayIndex}
                  dayPlan={currentWeekPlan[dayIndex] || emptyDayPlan}
                  recipes={recipes} ingredientBase={ingredientBase}
                  onUpdateMeal={(mealType, items) => handleUpdateMeal(dayIndex, mealType, items)}
                  onCopyMeal={(mealType, targetDayIndex) => handleCopyMeal(dayIndex, mealType, targetDayIndex)}
                  allDayPlans={currentWeekPlan}
                  allTags={recipeTags} />
              ))}
            </div>

            <div className="bg-primary/10 rounded-xl p-4 space-y-2">
              <h3 className="font-bold text-foreground">Итого за неделю:</h3>
              <NutritionBadges nutrition={weekTotals} showWeight />
            </div>
          </div>
        )}

        {activeTab === 'shopping' && (
          <div className="animate-fade-in">
            <ShoppingList weekPlan={currentWeekPlan} recipes={recipes} ingredientBase={ingredientBase} />
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg w-full" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="container">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                  <span className="text-xs font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Index;
