import { useState, useRef, useEffect } from 'react';
import { Search, Plus, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BaseIngredient } from '@/types/mealPlanner';

interface IngredientSelectorProps {
  ingredientBase: BaseIngredient[];
  onSelect: (ingredient: BaseIngredient) => void;
  excludeIds?: string[];
}

export function IngredientSelector({ ingredientBase, onSelect, excludeIds = [] }: IngredientSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const availableIngredients = ingredientBase.filter(
    (ing) => !excludeIds.includes(ing.id)
  );

  const filteredIngredients = availableIngredients
    .filter((ing) =>
      ing.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 8);

  const handleSelect = (ingredient: BaseIngredient) => {
    onSelect(ingredient);
    setSearchQuery('');
    setShowResults(false);
  };

  const handleSearchOnline = (site: 'fitaudit' | 'healthdiet') => {
    const query = encodeURIComponent(searchQuery.trim());
    const url = site === 'fitaudit'
      ? `https://fitaudit.ru/food?search=${query}`
      : `https://health-diet.ru/table_calorie/?search=${query}`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const noLocalResults = searchQuery.trim() && filteredIngredients.length === 0;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Поиск ингредиента..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          className="pl-9 h-10"
        />
      </div>

      {showResults && (searchQuery || filteredIngredients.length > 0) && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredIngredients.length > 0 ? (
            filteredIngredients.map((ing) => (
              <button
                key={ing.id}
                type="button"
                onClick={() => handleSelect(ing)}
                className="w-full px-3 py-2 text-left hover:bg-accent transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-sm">{ing.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {ing.kcalPer100} ккал • Б:{ing.proteinPer100} Ж:{ing.fatPer100} У:{ing.carbsPer100}
                  </div>
                </div>
                <Plus className="w-4 h-4 text-primary" />
              </button>
            ))
          ) : null}
          {noLocalResults && (
            <div className="px-3 py-3 space-y-2">
              <p className="text-sm text-muted-foreground text-center">Ингредиент не найден.</p>
              <p className="text-xs text-muted-foreground text-center">Посмотреть онлайн?</p>
              <div className="flex flex-col gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5 text-xs"
                  onClick={() => handleSearchOnline('fitaudit')}
                >
                  <ExternalLink className="w-3.5 h-3.5" /> FitAudit.ru
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5 text-xs"
                  onClick={() => handleSearchOnline('healthdiet')}
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Health-Diet.ru
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
