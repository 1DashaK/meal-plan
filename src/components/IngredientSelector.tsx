import { useState, useRef, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          ) : (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              {searchQuery ? (
                <p>Ингредиент не найден. Добавьте его во вкладке "Ингредиенты"</p>
              ) : (
                <p>Начните вводить название</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
