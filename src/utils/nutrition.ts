import { Ingredient, Recipe, NutritionInfo, MealItem, DayPlan } from '@/types/mealPlanner';

export function calculateIngredientNutrition(ingredient: Ingredient): NutritionInfo {
  const multiplier = ingredient.weight / 100;
  return {
    kcal: Math.round(ingredient.kcalPer100 * multiplier),
    protein: Math.round(ingredient.proteinPer100 * multiplier * 10) / 10,
    fat: Math.round(ingredient.fatPer100 * multiplier * 10) / 10,
    carbs: Math.round(ingredient.carbsPer100 * multiplier * 10) / 10,
    fiber: Math.round(ingredient.fiberPer100 * multiplier * 10) / 10,
    weight: ingredient.weight,
  };
}

export function calculateRecipeNutrition(recipe: Recipe): NutritionInfo {
  return recipe.ingredients.reduce(
    (acc, ing) => {
      const ingNutrition = calculateIngredientNutrition(ing);
      return {
        kcal: acc.kcal + ingNutrition.kcal,
        protein: Math.round((acc.protein + ingNutrition.protein) * 10) / 10,
        fat: Math.round((acc.fat + ingNutrition.fat) * 10) / 10,
        carbs: Math.round((acc.carbs + ingNutrition.carbs) * 10) / 10,
        fiber: Math.round((acc.fiber + ingNutrition.fiber) * 10) / 10,
        weight: acc.weight + ingNutrition.weight,
      };
    },
    { kcal: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, weight: 0 }
  );
}

export function calculatePortionNutrition(
  recipe: Recipe,
  portionWeight: number
): NutritionInfo {
  const totalNutrition = calculateRecipeNutrition(recipe);
  const ratio = portionWeight / totalNutrition.weight;
  
  return {
    kcal: Math.round(totalNutrition.kcal * ratio),
    protein: Math.round(totalNutrition.protein * ratio * 10) / 10,
    fat: Math.round(totalNutrition.fat * ratio * 10) / 10,
    carbs: Math.round(totalNutrition.carbs * ratio * 10) / 10,
    fiber: Math.round(totalNutrition.fiber * ratio * 10) / 10,
    weight: portionWeight,
  };
}

export function calculateMealNutrition(
  mealItems: MealItem[],
  recipes: Recipe[]
): NutritionInfo {
  return mealItems.reduce(
    (acc, item) => {
      const recipe = recipes.find((r) => r.id === item.recipeId);
      if (!recipe) return acc;
      
      const portionNutrition = calculatePortionNutrition(recipe, item.portionWeight);
      return {
        kcal: acc.kcal + portionNutrition.kcal,
        protein: Math.round((acc.protein + portionNutrition.protein) * 10) / 10,
        fat: Math.round((acc.fat + portionNutrition.fat) * 10) / 10,
        carbs: Math.round((acc.carbs + portionNutrition.carbs) * 10) / 10,
        fiber: Math.round((acc.fiber + portionNutrition.fiber) * 10) / 10,
        weight: acc.weight + portionNutrition.weight,
      };
    },
    { kcal: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, weight: 0 }
  );
}

export function calculateDayNutrition(
  dayPlan: DayPlan,
  recipes: Recipe[]
): NutritionInfo {
  const meals = [
    ...dayPlan.breakfast,
    ...dayPlan.snack,
    ...dayPlan.lunch,
    ...dayPlan.dinner,
  ];
  return calculateMealNutrition(meals, recipes);
}

export function emptyNutrition(): NutritionInfo {
  return { kcal: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, weight: 0 };
}
