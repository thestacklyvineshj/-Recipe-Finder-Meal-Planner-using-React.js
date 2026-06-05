import { useState, useEffect } from 'react';
import { Search, X, ChefHat } from 'lucide-react';

export const SearchBar = ({
  onSearch,
  onSearchTypeChange,
  initialValue = '',
  initialSearchType = 'name',
  placeholder = 'Search recipes by name...'
}) => {
  const [query, setQuery] = useState(initialValue);
  const [searchType, setSearchType] = useState(initialSearchType);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query.trim(), searchType);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('', searchType);
  };

  useEffect(() => {
    setQuery(initialValue);
    setSearchType(initialSearchType);
  }, [initialValue, initialSearchType]);

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col sm:flex-row gap-3" id="search-bar-form">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchType === 'name' ? placeholder : 'Search by individual ingredient (e.g. egg, chicken)...'}
          className="w-full pl-11 pr-10 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-sm transition duration-150 text-sm"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex gap-2">
        {/* Toggle option for Search Type */}
        <div className="bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl flex border border-zinc-200/50 dark:border-zinc-700/50">
          <button
            type="button"
            onClick={() => {
              setSearchType('name');
              onSearchTypeChange?.('name');
            }}
            className={`px-3 py-2 text-xs font-semibold rounded-xl transition duration-150 ${
              searchType === 'name'
                ? 'bg-white dark:bg-zinc-700 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            Name
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchType('ingredient');
              onSearchTypeChange?.('ingredient');
            }}
            className={`px-3 py-2 text-xs font-semibold rounded-xl transition duration-150 ${
              searchType === 'ingredient'
                ? 'bg-white dark:bg-zinc-700 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            By Ingredient
          </button>
        </div>

        <button
          type="submit"
          className="px-6 py-3.5 bg-amber-500 hover:bg-amber-600 active:translate-y-px text-white font-medium text-sm rounded-2xl shadow-sm hover:shadow-md transition duration-150 inline-flex items-center gap-1.5 justify-center"
        >
          <ChefHat className="w-4 h-4" />
          Search
        </button>
      </div>
    </form>
  );
};
