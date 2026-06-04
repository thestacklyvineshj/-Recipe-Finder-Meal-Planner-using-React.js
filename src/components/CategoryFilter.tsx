import React from 'react';
import { Globe, RefreshCw, Layers } from 'lucide-react';
import { CategoriesResponse } from '../types';

interface CategoryFilterProps {
  categories: CategoriesResponse['categories'];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  areas?: string[];
  selectedArea?: string;
  onSelectArea?: (area: string) => void;
  showAreaFilter?: boolean;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  areas = [],
  selectedArea = '',
  onSelectArea,
  showAreaFilter = false
}) => {
  return (
    <div className="space-y-4" id="category-filter-panel">
      {/* Category Horizontal Row */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-amber-500" />
            Categories
          </label>
          {(selectedCategory || selectedArea) && (
            <button
              onClick={() => {
                onSelectCategory('');
                if (onSelectArea) onSelectArea('');
              }}
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Reset Filters
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => onSelectCategory('')}
            className={`px-4 py-2 text-xs font-medium rounded-full shadow-sm snap-start whitespace-nowrap transition-all duration-150 border cursor-pointer ${
              selectedCategory === ''
                ? 'bg-amber-500 border-amber-500 text-white font-semibold'
                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-705'
            }`}
          >
            All Categories
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.strCategory;
            return (
              <button
                key={cat.idCategory}
                onClick={() => onSelectCategory(cat.strCategory)}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-full shadow-sm snap-start whitespace-nowrap transition-all duration-150 border cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 border-amber-500 text-white font-semibold ring-2 ring-amber-500/10'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-705'
                }`}
              >
                {cat.strCategoryThumb && (
                  <img
                    src={cat.strCategoryThumb}
                    alt={cat.strCategory}
                    className="w-5 h-5 object-contain"
                    referrerPolicy="no-referrer"
                  />
                )}
                <span>{cat.strCategory}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Area Dropdown/Pills if requested */}
      {showAreaFilter && onSelectArea && areas.length > 0 && (
        <div className="pt-2">
          <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-10.5 mb-3">
            <Globe className="w-4 h-4 text-amber-500" />
            Cuisine / Country Area
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onSelectArea('')}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all duration-150 cursor-pointer ${
                selectedArea === ''
                  ? 'bg-amber-100 dark:bg-amber-950/45 border-amber-300 text-amber-700 dark:text-amber-300 font-semibold'
                  : 'bg-zinc-100 dark:bg-zinc-850 border-transparent text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              All Cuisines
            </button>
            {areas.slice(0, 16).map((area) => {
              const isSelected = selectedArea === area;
              return (
                <button
                  key={area}
                  onClick={() => onSelectArea(area)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-100 dark:bg-amber-950/45 border-amber-300 text-amber-700 dark:text-amber-300 font-semibold'
                      : 'bg-zinc-100 dark:bg-zinc-850 border-transparent text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                  }`}
                >
                  {area}
                </button>
              );
            })}
            {areas.length > 16 && (
              <select
                value={POPULAR_AREAS_SELECT_VALUE(selectedArea, areas)}
                onChange={(e) => onSelectArea(e.target.value)}
                className="px-3 py-1.5 text-xs font-medium rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="">More Cuisines...</option>
                {areas.slice(16).map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Simple helper to match dropdown state
function POPULAR_AREAS_SELECT_VALUE(selected: string, list: string[]): string {
  const index = list.indexOf(selected);
  if (index >= 16) return selected;
  return '';
}
