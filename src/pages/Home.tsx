import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { CategoryFilter } from '../components/CategoryFilter';
import { MealCard } from '../components/MealCard';
import { Loader } from '../components/Loader';
import { useMeals } from '../hooks/useMeals';
import { useApp } from '../context/AppContext';
import { Star, Calendar, Sparkles, MoveRight, ReceiptText } from 'lucide-react';
import { motion } from 'motion/react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { categories, meals, loading, error, fetchFeaturedMeals } = useMeals();
  const { setFilters, setActiveCategory } = useApp();

  useEffect(() => {
    fetchFeaturedMeals(4); // Fills trending grid on home
  }, [fetchFeaturedMeals]);

  const handleSearch = (query: string, searchType: 'name' | 'ingredient') => {
    if (searchType === 'ingredient') {
      navigate(`/recipes?ingredient=${encodeURIComponent(query)}`);
    } else {
      navigate(`/recipes?search=${encodeURIComponent(query)}`);
    }
  };

  const handleSelectCategory = (category: string) => {
    setFilters(category, '');
    navigate(`/recipes?category=${encodeURIComponent(category)}`);
  };

  return (
    <div className="space-y-12 pb-16" id="home-page-container">
      {/* Visual Hero Showcase Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-zinc-950 dark:bg-zinc-950/80 text-white mt-4">
        {/* Decorative ambient blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

        <div className="relative max-w-4xl mx-auto px-6 py-16 sm:py-20 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simplify Your Kitchen Routing</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="font-heading font-extrabold text-3xl sm:text-5xl leading-tight tracking-tight max-w-2xl mx-auto"
          >
            Find curated recipes & plan your <span className="text-amber-500">weekly feast</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-zinc-300 text-sm sm:text-base max-w-lg mx-auto font-medium"
          >
            Explore over thousands of detailed master culinary guides. Toggle slots, customize calendar planners, and save favorites instantly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="max-w-xl mx-auto pt-2"
          >
            <SearchBar onSearch={handleSearch} placeholder="Search recipe details (e.g., Teriyaki Chicken, Lasagna)..." />
          </motion.div>
        </div>
      </section>

      {/* Quick Navigation Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6" id="quick-navigation-grid">
        <Link
          to="/Favourites"
          className="group relative bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 p-6 rounded-2xl flex items-start gap-4 hover:shadow-md transition duration-200 cursor-pointer"
        >
          <div className="p-3.5 bg-red-500/10 text-red-500 rounded-xl group-hover:scale-110 transition duration-150">
            <Star className="w-6 h-6 fill-red-500" />
          </div>
          <div className="space-y-1 pr-6 flex-1 min-w-0">
            <h3 className="font-heading font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-1.5">
              <span>My Favourites Collection</span>
              <MoveRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all duration-200" />
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Pick and review your saved list of delicious culinary guides stored in LocalStorage.
            </p>
          </div>
        </Link>

        <Link
          to="/meal-planner"
          className="group relative bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 p-6 rounded-2xl flex items-start gap-4 hover:shadow-md transition duration-200 cursor-pointer"
        >
          <div className="p-3.5 bg-amber-500/10 text-amber-500 rounded-xl group-hover:scale-110 transition duration-150">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="space-y-1 pr-6 flex-1 min-w-0">
            <h3 className="font-heading font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-1.5">
              <span>7-Day Meal Planner Grid</span>
              <MoveRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all duration-200" />
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Schedule Breakfast, Lunch, and Dinner. Export calendar views and organize your meals.
            </p>
          </div>
        </Link>
      </section>

      {/* Category Filter Horizontal Slider */}
      <section className="space-y-4" id="home-categories-filter">
        <div className="flex justify-between items-end border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div>
            <h2 className="font-heading font-extrabold text-lg sm:text-2xl text-zinc-850 dark:text-zinc-100">
              Quick Filter By Category
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Select key categories to filter list views instantly.
            </p>
          </div>
          <Link
            to="/recipes"
            className="text-xs font-bold text-amber-500 hover:text-amber-600 hover:underline inline-flex items-center gap-0.5"
          >
            All Recipes &rarr;
          </Link>
        </div>

        <CategoryFilter
          categories={categories}
          selectedCategory=""
          onSelectCategory={handleSelectCategory}
        />
      </section>

      {/* Trending / Featured meals grid */}
      <section className="space-y-4" id="home-trending-meals">
        <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <h2 className="font-heading font-extrabold text-lg sm:text-2xl text-zinc-850 dark:text-zinc-100">
            Curated Inspiration
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Top trending meals highly searched today by global kitchen masters.
          </p>
        </div>

        {error && (
          <p className="text-xs text-center text-red-500 dark:text-red-400 font-semibold py-4">
            {error}
          </p>
        )}

        {loading ? (
          <Loader type="card-grid" count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {meals.map((meal) => (
              <MealCard key={meal.idMeal} meal={meal} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
