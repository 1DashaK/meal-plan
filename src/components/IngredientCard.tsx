import { Edit2, Trash2, Apple } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BaseIngredient } from '@/types/mealPlanner';

interface IngredientCardProps {
  ingredient: BaseIngredient;
  onEdit: () => void;
  onDelete: () => void;
}

export function IngredientCard({ ingredient, onEdit, onDelete }: IngredientCardProps) {
  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border border-border/50 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
            <Apple className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{ingredient.name}</h3>
            <p className="text-xs text-muted-foreground">
              {ingredient.kcalPer100} ккал • Б:{ingredient.proteinPer100} Ж:{ingredient.fatPer100} У:{ingredient.carbsPer100}
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
    </div>
  );
}
