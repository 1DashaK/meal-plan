import { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Recipe, BaseIngredient } from '@/types/mealPlanner';
import { useToast } from '@/hooks/use-toast';

interface ImportExportProps {
  recipes: Recipe[];
  ingredientBase: BaseIngredient[];
  onImport: (data: { recipes?: Recipe[]; ingredientBase?: BaseIngredient[] }) => void;
}

export function ImportExport({ recipes, ingredientBase, onImport }: ImportExportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleExport = () => {
    const data = { recipes, ingredientBase, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meal-planner-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Экспорт завершён', description: 'Файл сохранён на устройство' });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        const imported: { recipes?: Recipe[]; ingredientBase?: BaseIngredient[] } = {};
        if (Array.isArray(data.recipes)) imported.recipes = data.recipes;
        if (Array.isArray(data.ingredientBase)) imported.ingredientBase = data.ingredientBase;
        if (!imported.recipes && !imported.ingredientBase) {
          toast({ title: 'Ошибка', description: 'Файл не содержит данных для импорта', variant: 'destructive' });
          return;
        }
        onImport(imported);
        toast({
          title: 'Импорт завершён',
          description: `Импортировано: ${imported.recipes?.length || 0} рецептов, ${imported.ingredientBase?.length || 0} ингредиентов`,
        });
      } catch {
        toast({ title: 'Ошибка', description: 'Не удалось прочитать файл', variant: 'destructive' });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}>
        <Download className="w-4 h-4" /> Экспорт
      </Button>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => fileInputRef.current?.click()}>
        <Upload className="w-4 h-4" /> Импорт
      </Button>
      <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
    </div>
  );
}
