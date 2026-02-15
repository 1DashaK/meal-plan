// База ингредиентов (хранится отдельно в localStorage)
export interface BaseIngredient {
  id: string;
  name: string;
  kcalPer100: number;
  proteinPer100: number;
  fatPer100: number;
  carbsPer100: number;
  fiberPer100: number;
  mgPer100: number;
  fePer100: number;
  vitCPer100: number;
}

// Ингредиент в рецепте (ссылка на базу + вес)
export interface RecipeIngredient {
  ingredientId: string;
  weight: number;
}

// Legacy формат для обратной совместимости
export interface Ingredient {
  id: string;
  name: string;
  weight: number;
  kcalPer100: number;
  proteinPer100: number;
  fatPer100: number;
  carbsPer100: number;
  fiberPer100: number;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
  instructions: string;
  tags: string[];
  createdAt: number;
}

export interface NutritionInfo {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  weight: number;
  mg: number;
  fe: number;
  vitC: number;
}

export interface MealItem {
  recipeId: string;
  recipeName: string;
  portionWeight: number;
  type?: 'recipe' | 'ingredient';
  excludedIngredientIds?: string[];
}

export type MealType = 'breakfast' | 'snack' | 'lunch' | 'dinner';

export interface DayPlan {
  breakfast: MealItem[];
  snack: MealItem[];
  lunch: MealItem[];
  dinner: MealItem[];
}

export interface WeekPlan {
  [weekKey: string]: {
    [dayIndex: number]: DayPlan;
  };
}

export const MEAL_TYPES: { key: MealType; label: string }[] = [
  { key: 'breakfast', label: 'Завтрак' },
  { key: 'snack', label: 'Перекус' },
  { key: 'lunch', label: 'Обед' },
  { key: 'dinner', label: 'Ужин' },
];

export const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
