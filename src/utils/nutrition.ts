import { BaseIngredient, Recipe, NutritionInfo, MealItem, DayPlan, RecipeIngredient } from '@/types/mealPlanner';

export function calculateIngredientNutrition(
  recipeIngredient: RecipeIngredient,
  ingredientBase: BaseIngredient[]
): NutritionInfo {
  const baseIng = ingredientBase.find((i) => i.id === recipeIngredient.ingredientId);
  if (!baseIng) {
    return emptyNutrition(recipeIngredient.weight);
  }
  
  const multiplier = recipeIngredient.weight / 100;
  return {
    kcal: Math.round(baseIng.kcalPer100 * multiplier),
    protein: Math.round(baseIng.proteinPer100 * multiplier * 10) / 10,
    fat: Math.round(baseIng.fatPer100 * multiplier * 10) / 10,
    carbs: Math.round(baseIng.carbsPer100 * multiplier * 10) / 10,
    fiber: Math.round(baseIng.fiberPer100 * multiplier * 10) / 10,
    mg: Math.round((baseIng.mgPer100 || 0) * multiplier * 10) / 10,
    fe: Math.round((baseIng.fePer100 || 0) * multiplier * 10) / 10,
    vitC: Math.round((baseIng.vitCPer100 || 0) * multiplier * 10) / 10,
    weight: recipeIngredient.weight,
  };
}

export function calculateRawIngredientNutrition(
  ingredientId: string,
  weight: number,
  ingredientBase: BaseIngredient[]
): NutritionInfo {
  return calculateIngredientNutrition({ ingredientId, weight }, ingredientBase);
}

export function calculateRecipeNutrition(
  recipe: Recipe,
  ingredientBase: BaseIngredient[]
): NutritionInfo {
  return recipe.ingredients.reduce(
    (acc, ing) => {
      const ingNutrition = calculateIngredientNutrition(ing, ingredientBase);
      return {
        kcal: acc.kcal + ingNutrition.kcal,
        protein: Math.round((acc.protein + ingNutrition.protein) * 10) / 10,
        fat: Math.round((acc.fat + ingNutrition.fat) * 10) / 10,
        carbs: Math.round((acc.carbs + ingNutrition.carbs) * 10) / 10,
        fiber: Math.round((acc.fiber + ingNutrition.fiber) * 10) / 10,
        mg: Math.round((acc.mg + ingNutrition.mg) * 10) / 10,
        fe: Math.round((acc.fe + ingNutrition.fe) * 10) / 10,
        vitC: Math.round((acc.vitC + ingNutrition.vitC) * 10) / 10,
        weight: acc.weight + ingNutrition.weight,
      };
    },
    emptyNutrition()
  );
}

export function calculatePortionNutrition(
  recipe: Recipe,
  portionWeight: number,
  ingredientBase: BaseIngredient[]
): NutritionInfo {
  const totalNutrition = calculateRecipeNutrition(recipe, ingredientBase);
  if (totalNutrition.weight === 0) {
    return emptyNutrition();
  }
  const ratio = portionWeight / totalNutrition.weight;
  
  return {
    kcal: Math.round(totalNutrition.kcal * ratio),
    protein: Math.round(totalNutrition.protein * ratio * 10) / 10,
    fat: Math.round(totalNutrition.fat * ratio * 10) / 10,
    carbs: Math.round(totalNutrition.carbs * ratio * 10) / 10,
    fiber: Math.round(totalNutrition.fiber * ratio * 10) / 10,
    mg: Math.round(totalNutrition.mg * ratio * 10) / 10,
    fe: Math.round(totalNutrition.fe * ratio * 10) / 10,
    vitC: Math.round(totalNutrition.vitC * ratio * 10) / 10,
    weight: portionWeight,
  };
}

export function calculateMealNutrition(
  mealItems: MealItem[],
  recipes: Recipe[],
  ingredientBase: BaseIngredient[]
): NutritionInfo {
  return mealItems.reduce(
    (acc, item) => {
      let itemNutrition: NutritionInfo;
      
      if (item.type === 'ingredient') {
        itemNutrition = calculateRawIngredientNutrition(item.recipeId, item.portionWeight, ingredientBase);
      } else {
        const recipe = recipes.find((r) => r.id === item.recipeId);
        if (!recipe) return acc;
        itemNutrition = calculatePortionNutrition(recipe, item.portionWeight, ingredientBase);
      }
      
      return {
        kcal: acc.kcal + itemNutrition.kcal,
        protein: Math.round((acc.protein + itemNutrition.protein) * 10) / 10,
        fat: Math.round((acc.fat + itemNutrition.fat) * 10) / 10,
        carbs: Math.round((acc.carbs + itemNutrition.carbs) * 10) / 10,
        fiber: Math.round((acc.fiber + itemNutrition.fiber) * 10) / 10,
        mg: Math.round((acc.mg + itemNutrition.mg) * 10) / 10,
        fe: Math.round((acc.fe + itemNutrition.fe) * 10) / 10,
        vitC: Math.round((acc.vitC + itemNutrition.vitC) * 10) / 10,
        weight: acc.weight + itemNutrition.weight,
      };
    },
    emptyNutrition()
  );
}

export function calculateDayNutrition(
  dayPlan: DayPlan,
  recipes: Recipe[],
  ingredientBase: BaseIngredient[]
): NutritionInfo {
  const meals = [
    ...dayPlan.breakfast,
    ...dayPlan.snack,
    ...dayPlan.lunch,
    ...dayPlan.dinner,
  ];
  return calculateMealNutrition(meals, recipes, ingredientBase);
}

export function emptyNutrition(weight: number = 0): NutritionInfo {
  return { kcal: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, mg: 0, fe: 0, vitC: 0, weight };
}

export function getIngredientName(ingredientId: string, ingredientBase: BaseIngredient[]): string {
  const ing = ingredientBase.find((i) => i.id === ingredientId);
  return ing?.name || 'Неизвестный ингредиент';
}
