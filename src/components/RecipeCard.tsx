import { ChefHat, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Recipe, BaseIngredient } from '@/types/mealPlanner';
import { NutritionBadges } from '@/components/NutritionBadges';
import { calculateRecipeNutrition } from '@/utils/nutrition';

interface RecipeCardProps {
  recipe: Recipe;
  ingredientBase: BaseIngredient[];
  onEdit: () => void;
  onDelete: () => void;
}

export function RecipeCard({ recipe, ingredientBase, onEdit, onDelete }: RecipeCardProps) {
  const nutrition = calculateRecipeNutrition(recipe, ingredientBase);

  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border border-border/50 space-y-3 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{recipe.name}</h3>
            <p className="text-xs text-muted-foreground">
              {recipe.ingredients.length} ингр. • {nutrition.weight}г
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="h-8 w-8"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {recipe.tags && recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {recipe.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <NutritionBadges nutrition={nutrition} />

      {recipe.instructions && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {recipe.instructions}
        </p>
      )}
    </div>
  );
}
