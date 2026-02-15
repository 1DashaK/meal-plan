import { useState } from 'react';
import { Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BaseIngredient } from '@/types/mealPlanner';

interface IngredientFormProps {
  onSave: (ingredient: BaseIngredient) => void;
  onCancel: () => void;
  initialIngredient?: BaseIngredient;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function IngredientForm({ onSave, onCancel, initialIngredient }: IngredientFormProps) {
  const [name, setName] = useState(initialIngredient?.name || '');
  const [kcal, setKcal] = useState(initialIngredient?.kcalPer100?.toString() || '');
  const [protein, setProtein] = useState(initialIngredient?.proteinPer100?.toString() || '');
  const [fat, setFat] = useState(initialIngredient?.fatPer100?.toString() || '');
  const [carbs, setCarbs] = useState(initialIngredient?.carbsPer100?.toString() || '');
  const [fiber, setFiber] = useState(initialIngredient?.fiberPer100?.toString() || '');
  const [mg, setMg] = useState(initialIngredient?.mgPer100?.toString() || '');
  const [fe, setFe] = useState(initialIngredient?.fePer100?.toString() || '');
  const [vitC, setVitC] = useState(initialIngredient?.vitCPer100?.toString() || '');

  const handleSubmit = () => {
    if (!name.trim()) return;
    
    const ingredient: BaseIngredient = {
      id: initialIngredient?.id || generateId(),
      name: name.trim(),
      kcalPer100: Number(kcal) || 0,
      proteinPer100: Number(protein) || 0,
      fatPer100: Number(fat) || 0,
      carbsPer100: Number(carbs) || 0,
      fiberPer100: Number(fiber) || 0,
      mgPer100: Number(mg) || 0,
      fePer100: Number(fe) || 0,
      vitCPer100: Number(vitC) || 0,
    };

    onSave(ingredient);
  };

  const isValid = name.trim().length > 0;

  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border border-border/50 space-y-4 animate-fade-in">
      <h3 className="font-semibold text-foreground">
        {initialIngredient ? 'Редактировать ингредиент' : 'Новый ингредиент'}
      </h3>

      <Input
        placeholder="Название ингредиента *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-12"
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Ккал/100г</label>
          <Input type="number" placeholder="0" value={kcal} onChange={(e) => setKcal(e.target.value)} className="h-10" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Белки/100г</label>
          <Input type="number" step="0.1" placeholder="0" value={protein} onChange={(e) => setProtein(e.target.value)} className="h-10" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Жиры/100г</label>
          <Input type="number" step="0.1" placeholder="0" value={fat} onChange={(e) => setFat(e.target.value)} className="h-10" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Углеводы/100г</label>
          <Input type="number" step="0.1" placeholder="0" value={carbs} onChange={(e) => setCarbs(e.target.value)} className="h-10" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Клетчатка/100г</label>
          <Input type="number" step="0.1" placeholder="0" value={fiber} onChange={(e) => setFiber(e.target.value)} className="h-10" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Mg/100г (мг)</label>
          <Input type="number" step="0.1" placeholder="0" value={mg} onChange={(e) => setMg(e.target.value)} className="h-10" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Fe/100г (мг)</label>
          <Input type="number" step="0.1" placeholder="0" value={fe} onChange={(e) => setFe(e.target.value)} className="h-10" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Вит. C/100г (мг)</label>
          <Input type="number" step="0.1" placeholder="0" value={vitC} onChange={(e) => setVitC(e.target.value)} className="h-10" />
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel} className="flex-1 gap-1">
          <X className="w-4 h-4" />
          Отмена
        </Button>
        <Button onClick={handleSubmit} disabled={!isValid} className="flex-1 gap-1">
          <Save className="w-4 h-4" />
          Сохранить
        </Button>
      </div>
    </div>
  );
}
