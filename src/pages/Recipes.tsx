import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMeals } from '../hooks/useMeals';
import { useApp } from '../context/AppContext';
import { SearchBar } from '../components/SearchBar';
import { CategoryFilter } from '../components/CategoryFilter';
import { MealCard } from '../components/MealCard';
import { Loader } from '../components/Loader';
import { EmptyState } from '../components/EmptyState';
import { Pagination } from '../components/Pagination';
import { Filter, SlidersHorizontal, Layers, Orbit } from 'lucide-react';
import { mealApi } from '../utils/api';

export const Recipes: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { theme } = useApp();

  const urlSearch = searchParams.get('search') || '';
  const urlCategory = searchParams.get('category') || '';
  const urlArea = searchParams.get('area') || '';
  const urlIngredient = searchParams.get('ingredient') || '';

  // Hooks & States
  const {
    meals,
    setMeals,
    categories,
    areas,
    loading,
    error,
    searchMeals,
    fetchFilteredMeals
  } = useMeals();

  const [localSearch, setLocalSearch] = useState(urlSearch);
  const [searchType, setSearchType] = useState<'name' | 'ingredient'>(urlIngredient ? 'ingredient' : 'name');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Track filter search inputs
  const [selectedCat, setSelectedCat] = useState(urlCategory);
  const [selectedArea, setSelectedArea] = useState(urlArea);

  // Sync state from query parameters on mount or when url changes
  useEffect(() => {
    setSelectedCat(urlCategory);
    setSelectedArea(urlArea);
    if (urlIngredient) {
      setLocalSearch(urlIngredient);
      setSearchType('ingredient');
    } else {
      setLocalSearch(urlSearch);
      setSearchType('name');
    }
    setCurrentPage(1);
  }, [urlCategory, urlArea, urlSearch, urlIngredient]);

  // Main data fetch coordinator
  useEffect(() => {
    const fetchRecipes = async () => {
      // 1. If ingredient search is active
      if (searchType === 'ingredient' && localSearch) {
        try {
          const res = await mealApi.searchMealsByIngredient(localSearch);
          setMeals(res);
        } catch (err) {
          console.error(err);
        }
        return;
      }

      // 2. If name search query is active
      if (localSearch) {
        searchMeals(localSearch);
        return;
      }

      // 3. Otherwise fetch by Category + Area filters
      fetchFilteredMeals(selectedCat, selectedArea);
    };

    fetchRecipes();
  }, [localSearch, searchType, selectedCat, selectedArea, searchMeals, fetchFilteredMeals, setMeals]);

  // Set Search Query
  const handleSearchBarSubmit = (q: string, type: 'name' | 'ingredient') => {
    setCurrentPage(1);
    setLocalSearch(q);
    setSearchType(type);

    const newParams = new URLSearchParams(searchParams);
    if (q) {
      if (type === 'ingredient') {
        newParams.set('ingredient', q);
        newParams.delete('search');
      } else {
        newParams.set('search', q);
        newParams.delete('ingredient');
      }
    } else {
      newParams.delete('search');
      newParams.delete('ingredient');
    }
    setSearchParams(newParams);
  };

  // Set Category from subfilter row
  const handleCategoryChoice = (cat: string) => {
    setCurrentPage(1);
    setSelectedCat(cat);
    
    const newParams = new URLSearchParams(searchParams);
    if (cat) {
      newParams.set('category', cat);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  // Set Cuisine/Area choice
  const handleAreaChoice = (area: string) => {
    setCurrentPage(1);
    setSelectedArea(area);

    const newParams = new URLSearchParams(searchParams);
    if (area) {
      newParams.set('area', area);
    } else {
      newParams.delete('area');
    }
    setSearchParams(newParams);
  };

  const handleResetAll = () => {
    setLocalSearch('');
    setSelectedCat('');
    setSelectedArea('');
    setSearchParams({});
    setCurrentPage(1);
  };

  // Client side pagination calculations
  const paginatedMeals = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return meals.slice(start, start + itemsPerPage);
  }, [meals, currentPage]);

  return (
    <div className="space-y-8 pb-16" id="recipes-listing-page">
      {/* Title block banner */}
      <section className="space-y-2 border-b border-zinc-150 dark:border-zinc-800 pb-5">
        <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
          <Filter className="w-6 h-6 text-amber-500" />
          <span>Browse Public Recipe Archives</span>
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-xl">
          Search with simple ingredients, browse traditional country culinary cuisines, or choose clean categories.
        </p>
      </section>

      {/* Main Search Row Panel */}
      <section className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200/50 dark:border-zinc-800 rounded-3xl p-5 md:p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-zinc-200/50 dark:border-zinc-805/60 pb-3">
          <SlidersHorizontal className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-650 dark:text-zinc-350">
            Advanced Cooking Filters
          </span>
        </div>

        <SearchBar
          onSearch={handleSearchBarSubmit}
          initialValue={localSearch}
          placeholder="Filter recipes by custom titles..."
        />

        {searchType === 'name' && (
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCat}
            onSelectCategory={handleCategoryChoice}
            areas={areas}
            selectedArea={selectedArea}
            onSelectArea={handleAreaChoice}
            showAreaFilter
          />
        )}
      </section>

      {/* Results Section */}
      <section className="space-y-6" id="meals-results-section">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-zinc-450 dark:text-zinc-500 uppercase tracking-widest">
            {meals.length > 0 ? (
              <span>Found {meals.length} Match{meals.length === 1 ? '' : 'es'}</span>
            ) : (
              <span>Results</span>
            )}
          </h2>
        </div>

        {error && (
          <p className="text-center text-xs text-red-500 dark:text-red-400 font-semibold py-6">
            {error}
          </p>
        )}

        {loading ? (
          <Loader type="card-grid" count={itemsPerPage} />
        ) : meals.length === 0 ? (
          <EmptyState
            title="Unable to Find Recipes"
            description="We couldn't get any culinary formulas matches your exact filter query terms. Let's start fresh!"
            actionText="Clear All Filters"
            onAction={handleResetAll}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {paginatedMeals.map((meal) => (
                <MealCard key={meal.idMeal} meal={meal} />
              ))}
            </div>

            <Pagination
              totalItems={meals.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={(page) => {
                setCurrentPage(page);
                // Scroll to top of listing smoothly on page turn
                window.scrollTo({ top: 320, behavior: 'smooth' });
              }}
            />
          </>
        )}
      </section>
    </div>
  );
};
