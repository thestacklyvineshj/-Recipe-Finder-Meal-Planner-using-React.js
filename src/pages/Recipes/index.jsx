import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMeals } from '../../hooks/useMeals';
import { useApp } from '../../context/AppContext';
import { SearchBar } from '../../components/SearchBar';
import { CategoryFilter } from '../../components/CategoryFilter';
import { MealCard } from '../../components/MealCard';
import { Loader } from '../../components/Loader';
import { EmptyState } from '../../components/EmptyState';
import { Pagination } from '../../components/Pagination';
import { Filter, SlidersHorizontal } from 'lucide-react';

export const Recipes = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedCategory, selectedArea, setFilters } = useApp();

  const urlSearch = searchParams.get('search') || '';
  const urlCategory = searchParams.get('category') || '';
  const urlArea = searchParams.get('area') || '';
  const urlIngredient = searchParams.get('ingredient') || '';

  const {
    meals,
    categories,
    areas,
    loading,
    error,
    searchMeals,
    searchMealsByIngredient,
    fetchFilteredMeals
  } = useMeals();

  const [localSearch, setLocalSearch] = useState(urlSearch || urlIngredient);
  const [searchType, setSearchType] = useState(
    urlIngredient ? 'ingredient' : 'name'
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Sync URL params → Context filters
  useEffect(() => {
    setFilters(urlCategory, urlArea);
    if (urlIngredient) {
      setLocalSearch(urlIngredient);
      setSearchType('ingredient');
    } else {
      setLocalSearch(urlSearch);
      setSearchType('name');
    }
    setCurrentPage(1);
  }, [urlCategory, urlArea, urlSearch, urlIngredient, setFilters]);

  // Main data fetch coordinator
  useEffect(() => {
    const fetchRecipes = async () => {
      if (searchType === 'ingredient' && localSearch) {
        await searchMealsByIngredient(localSearch);
        return;
      }
      if (localSearch && searchType === 'name') {
        await searchMeals(localSearch);
        return;
      }
      await fetchFilteredMeals(selectedCategory, selectedArea);
    };

    fetchRecipes();
  }, [
    localSearch,
    searchType,
    selectedCategory,
    selectedArea,
    searchMeals,
    searchMealsByIngredient,
    fetchFilteredMeals
  ]);

  const updateUrlParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
  };

  const handleSearchBarSubmit = (q, type) => {
    setCurrentPage(1);
    setLocalSearch(q);
    setSearchType(type);

    if (q) {
      if (type === 'ingredient') {
        updateUrlParams({ ingredient: q, search: null });
      } else {
        updateUrlParams({ search: q, ingredient: null });
      }
    } else {
      updateUrlParams({ search: null, ingredient: null });
    }
  };

  const handleCategoryChoice = (cat) => {
    setCurrentPage(1);
    setFilters(cat, selectedArea);
    updateUrlParams({ category: cat || null });
  };

  const handleAreaChoice = (area) => {
    setCurrentPage(1);
    setFilters(selectedCategory, area);
    updateUrlParams({ area: area || null });
  };

  const handleResetAll = () => {
    setLocalSearch('');
    setFilters('', '');
    setSearchParams({});
    setCurrentPage(1);
  };

  const paginatedMeals = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return meals.slice(start, start + itemsPerPage);
  }, [meals, currentPage]);

  return (
    <div className="space-y-8 pb-16" id="recipes-listing-page">
      <section className="space-y-2 border-b border-zinc-150 dark:border-zinc-800 pb-5">
        <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
          <Filter className="w-6 h-6 text-amber-500" />
          <span>Browse Public Recipe Archives</span>
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-xl">
          Search with simple ingredients, browse traditional country culinary cuisines, or choose clean categories.
        </p>
      </section>

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
          initialSearchType={searchType}
          placeholder="Filter recipes by custom titles..."
        />

        {searchType === 'name' && (
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategoryChoice}
            areas={areas}
            selectedArea={selectedArea}
            onSelectArea={handleAreaChoice}
            showAreaFilter
          />
        )}
      </section>

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

        {error && !loading && (
          <p className="text-center text-xs text-red-500 dark:text-red-400 font-semibold py-6">
            {error}
          </p>
        )}

        {loading ? (
          <Loader type="card-grid" count={itemsPerPage} />
        ) : error ? null : meals.length === 0 ? (
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
                window.scrollTo({ top: 320, behavior: 'smooth' });
              }}
            />
          </>
        )}
      </section>
    </div>
  );
};
