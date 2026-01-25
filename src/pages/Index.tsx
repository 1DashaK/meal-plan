import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, UtensilsCrossed, CalendarDays, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Recipe, DayPlan, MealType, MealItem, WeekPlan, DAY_NAMES } from '@/types/mealPlanner';
import { RecipeForm } from '@/components/RecipeForm';
import { RecipeCard } from '@/components/RecipeCard';
import { DayCard } from '@/components/DayCard';
import { ShoppingList } from '@/components/ShoppingList';
import { NutritionBadges } from '@/components/NutritionBadges';
import { getCurrentWeekKey, getWeekRange, navigateWeek } from '@/utils/weekUtils';
import { calculateDayNutrition, emptyNutrition } from '@/utils/nutrition';

type TabType = 'recipes' | 'plan' | 'shopping';

const emptyDayPlan: DayPlan = {
  breakfast: [],
  snack: [],
  lunch: [],
  dinner: [],
};

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('plan');
  const [recipes, setRecipes] = useLocalStorage<Recipe[]>('meal-planner-recipes', []);
  const [weekPlans, setWeekPlans] = useLocalStorage<WeekPlan>('meal-planner-week-plans', {});
  const [currentWeekKey, setCurrentWeekKey] = useState(getCurrentWeekKey());
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  const currentWeekPlan = weekPlans[currentWeekKey] || {};

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

  // Calculate week totals
  const weekTotals = DAY_NAMES.reduce(
    (acc, _, dayIndex) => {
      const dayPlan = currentWeekPlan[dayIndex];
      if (!dayPlan) return acc;
      const dayNutrition = calculateDayNutrition(dayPlan, recipes);
      return {
        kcal: acc.kcal + dayNutrition.kcal,
        protein: Math.round((acc.protein + dayNutrition.protein) * 10) / 10,
        fat: Math.round((acc.fat + dayNutrition.fat) * 10) / 10,
        carbs: Math.round((acc.carbs + dayNutrition.carbs) * 10) / 10,
        fiber: Math.round((acc.fiber + dayNutrition.fiber) * 10) / 10,
        weight: acc.weight + dayNutrition.weight,
      };
    },
    emptyNutrition()
  );

  const tabs = [
    { key: 'recipes' as TabType, label: 'Рецепты', icon: UtensilsCrossed },
    { key: 'plan' as TabType, label: 'План', icon: CalendarDays },
    { key: 'shopping' as TabType, label: 'Покупки', icon: ShoppingCart },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container py-3">
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="text-2xl">🥗</span> Планировщик питания
          </h1>
        </div>
      </header>

      {/* Tab Content */}
      <main className="container py-4">
        {/* Recipes Tab */}
        {activeTab === 'recipes' && (
          <div className="space-y-4 animate-fade-in">
            {showRecipeForm ? (
              <RecipeForm
                onSave={handleSaveRecipe}
                onCancel={() => {
                  setShowRecipeForm(false);
                  setEditingRecipe(null);
                }}
                initialRecipe={editingRecipe || undefined}
              />
            ) : (
              <>
                <Button
                  onClick={() => setShowRecipeForm(true)}
                  className="w-full h-12 gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Добавить рецепт
                </Button>

                {recipes.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-lg">Нет рецептов</p>
                    <p className="text-sm">Добавьте свой первый рецепт</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recipes.map((recipe) => (
                      <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        onEdit={() => handleEditRecipe(recipe)}
                        onDelete={() => handleDeleteRecipe(recipe.id)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Plan Tab */}
        {activeTab === 'plan' && (
          <div className="space-y-4 animate-fade-in">
            {/* Week Navigation */}
            <div className="flex items-center justify-between bg-card rounded-xl p-3 shadow-sm border border-border/50">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentWeekKey(navigateWeek(currentWeekKey, 'prev'))}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Текущая неделя</p>
                <p className="font-semibold">{getWeekRange(currentWeekKey)}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentWeekKey(navigateWeek(currentWeekKey, 'next'))}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Days Grid */}
            <div className="space-y-4">
              {DAY_NAMES.map((_, dayIndex) => (
                <DayCard
                  key={dayIndex}
                  dayIndex={dayIndex}
                  dayPlan={currentWeekPlan[dayIndex] || emptyDayPlan}
                  recipes={recipes}
                  onUpdateMeal={(mealType, items) =>
                    handleUpdateMeal(dayIndex, mealType, items)
                  }
                  onCopyMeal={(mealType, targetDayIndex) =>
                    handleCopyMeal(dayIndex, mealType, targetDayIndex)
                  }
                  allDayPlans={currentWeekPlan}
                />
              ))}
            </div>

            {/* Week Totals */}
            <div className="bg-primary/10 rounded-xl p-4 space-y-2">
              <h3 className="font-bold text-foreground">Итого за неделю:</h3>
              <NutritionBadges nutrition={weekTotals} showWeight />
            </div>
          </div>
        )}

        {/* Shopping Tab */}
        {activeTab === 'shopping' && (
          <div className="animate-fade-in">
            <ShoppingList weekPlan={currentWeekPlan} recipes={recipes} />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg">
        <div className="container">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
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
