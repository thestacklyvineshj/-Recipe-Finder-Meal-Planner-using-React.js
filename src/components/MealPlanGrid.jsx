import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Trash2, Plus, X, Search, Check, UtensilsCrossed, Printer, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { DAYS_OF_WEEK, MEAL_SLOTS } from '../utils/constants';
import { mealApi } from '../utils/api';

export const MealPlanGrid = ({ onPrint }) => {
  const { mealPlan, setMealPlan, clearMealPlan, favourites } = useApp();
  const [activeDayTab, setActiveDayTab] = useState('Monday');
  
  // Modal Selector State
  const [selectorTarget, setSelectorTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleOpenSelector = (day, slot) => {
    setSelectorTarget({ day, slot });
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleCloseSelector = () => {
    setSelectorTarget(null);
  };

  const handleSearchMeals = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const results = await mealApi.searchMealsByName(searchQuery.trim());
      setSearchResults(results);
    } catch (err) {
      console.error('Error searching meals for planner:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectMeal = (meal) => {
    if (!selectorTarget) return;
    const { day, slot } = selectorTarget;
    setMealPlan(day, slot, meal);
    handleCloseSelector();
  };

  const handleRemoveMeal = (day, slot, e) => {
    e.preventDefault();
    e.stopPropagation();
    setMealPlan(day, slot, null);
  };

  return (
    <div className="space-y-6" id="meal-plan-grid">
      {/* Planner Header Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-zinc-50 dark:bg-zinc-900/30 p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/80">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Create, export, or print your custom 7-day culinary agenda.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onPrint && (
            <button
              onClick={onPrint}
              className="px-4 py-2 text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print Agenda
            </button>
          )}
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear your entire weekly plan?')) {
                clearMealPlan();
              }
            }}
            className="px-4 py-2 text-xs font-semibold bg-red-500 hover:bg-red-600 active:translate-y-px text-white rounded-xl shadow-sm inline-flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Week
          </button>
        </div>
      </div>

      {/* MOBILE LAYOUT: Day Tabs Selection row (hidden when printing) */}
      <div className="block lg:hidden print:hidden">
        <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none snap-x -mx-4 px-4">
          {DAYS_OF_WEEK.map((day) => {
            const plannedSlotsCount = MEAL_SLOTS.filter(s => mealPlan[day][s] !== null).length;
            const isSelected = activeDayTab === day;
            return (
              <button
                key={day}
                onClick={() => setActiveDayTab(day)}
                className={`flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl border snap-start min-w-[76px] transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 border-amber-500 text-white font-semibold'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <span className="text-xs uppercase font-extrabold tracking-wider">{day.slice(0, 3)}</span>
                {plannedSlotsCount > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-white text-amber-600' : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                  }`}>
                    {plannedSlotsCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Day View for Mobile */}
        <div className="mt-4 bg-white dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800 rounded-3xl p-5 space-y-4">
          <h3 className="font-heading font-bold text-zinc-800 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
            <span>{activeDayTab} Meals</span>
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
              Daily View
            </span>
          </h3>

          <div className="space-y-4">
            {MEAL_SLOTS.map((slot) => {
              const meal = mealPlan[activeDayTab][slot];
              return (
                <div key={slot} className="space-y-1.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    {slot}
                  </div>
                  <SlotCard
                    meal={meal}
                    onPlan={() => handleOpenSelector(activeDayTab, slot)}
                    onRemove={(e) => handleRemoveMeal(activeDayTab, slot, e)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* DESKTOP LAYOUT: 7 Column Grid View (always shown when printing) */}
      <div className="hidden lg:grid lg:grid-cols-7 gap-4 print:grid print:grid-cols-7">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="flex flex-col bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/40 dark:border-zinc-800/80 rounded-2xl p-3 h-full min-h-[480px]"
          >
            {/* Column Day Headline */}
            <div className="text-center pb-2.5 mb-3 border-b border-zinc-200/60 dark:border-zinc-850">
              <h4 className="font-heading font-extrabold text-zinc-900 dark:text-zinc-100 text-sm tracking-wide">
                {day}
              </h4>
            </div>

            {/* Individual slots columns */}
            <div className="flex-1 flex flex-col gap-4">
              {MEAL_SLOTS.map((slot) => {
                const meal = mealPlan[day][slot];
                return (
                  <div key={slot} className="flex-1 flex flex-col min-h-[110px]">
                    <div className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pl-1 mb-1">
                      {slot}
                    </div>
                    <div className="flex-1">
                      <SlotCard
                        meal={meal}
                        onPlan={() => handleOpenSelector(day, slot)}
                        onRemove={(e) => handleRemoveMeal(day, slot, e)}
                        compact
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* POPUP SELECTOR MODAL overlay */}
      <AnimatePresence>
        {selectorTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Head */}
              <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900">
                <div>
                  <h3 className="font-heading font-medium text-lg text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <UtensilsCrossed className="w-5 h-5 text-amber-500" />
                    <span>Plan {selectorTarget.slot}</span>
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Assigning a meal for {selectorTarget.day}
                  </p>
                </div>
                <button
                  onClick={handleCloseSelector}
                  className="p-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Selector Body tabs / sections */}
              <div className="p-5 overflow-y-auto space-y-5 flex-1">
                {/* 1. Select from favourites */}
                <div>
                  <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>Quick Add Favourites ({favourites.length})</span>
                  </h4>

                  {favourites.length === 0 ? (
                    <div className="text-center py-4 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800 border-dashed rounded-2xl">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">No favourites saved yet.</p>
                      <Link
                        to="/recipes"
                        onClick={handleCloseSelector}
                        className="text-xs font-bold text-amber-500 hover:underline mt-1 inline-block"
                      >
                        Browse Recipes &rarr;
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[180px] overflow-y-auto">
                      {favourites.map((fav) => (
                        <button
                          key={fav.idMeal}
                          onClick={() => handleSelectMeal({
                            idMeal: fav.idMeal,
                            strMeal: fav.strMeal,
                            strMealThumb: fav.strMealThumb,
                            strCategory: fav.strCategory,
                            strArea: fav.strArea
                          })}
                          className="flex items-center gap-3 p-2 bg-zinc-50 hover:bg-amber-50 border border-zinc-200/50 hover:border-amber-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 dark:border-zinc-750 rounded-xl transition text-left cursor-pointer"
                        >
                          <img
                            src={fav.strMealThumb}
                            alt={fav.strMeal}
                            className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="truncate flex-1">
                            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                              {fav.strMeal}
                            </p>
                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wide">
                              {fav.strCategory}
                            </p>
                          </div>
                          <Check className="w-4 h-4 text-emerald-500 ml-auto shrink-0 opacity-0 hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Global search section */}
                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3">
                  <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                    <Search className="w-3.5 h-3.5 text-amber-500" />
                    <span>Search Public database</span>
                  </h4>

                  <form onSubmit={handleSearchMeals} className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Type a meal recipe name (e.g., Pizza, Soup)..."
                      className="flex-1 px-3.5 py-2 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:translate-y-px text-white text-xs font-semibold rounded-xl shadow-sm transition"
                    >
                      Search
                    </button>
                  </form>

                  {/* Search results list in modal */}
                  {searching ? (
                    <div className="flex justify-center py-4">
                      <div className="w-6 h-6 border-2 border-amber-500/25 border-t-amber-500 rounded-full animate-spin"></div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[180px] overflow-y-auto">
                      {searchResults.map((meal) => (
                        <button
                          key={meal.idMeal}
                          onClick={() => handleSelectMeal({
                            idMeal: meal.idMeal,
                            strMeal: meal.strMeal,
                            strMealThumb: meal.strMealThumb,
                            strCategory: meal.strCategory,
                            strArea: meal.strArea
                          })}
                          className="flex items-center gap-3 p-2 bg-zinc-50 hover:bg-amber-50 border border-zinc-200/50 hover:border-amber-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 dark:border-zinc-750 rounded-xl transition text-left cursor-pointer"
                        >
                          <img
                            src={meal.strMealThumb}
                            alt={meal.strMeal}
                            className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="truncate flex-1">
                            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                              {meal.strMeal}
                            </p>
                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wide">
                              {meal.strCategory || 'Recipe'}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : searchQuery && (
                    <p className="text-xs text-center text-zinc-500 dark:text-zinc-400 py-3">
                      No matching results found.
                    </p>
                  )}
                </div>
              </div>

              {/* Modal Foot */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800/80 flex justify-end">
                <button
                  type="button"
                  onClick={handleCloseSelector}
                  className="px-4 py-2 text-xs font-semibold bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-300 rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* Individual Cell Card component for the meal planner */
const SlotCard = ({ meal, onPlan, onRemove, compact = false }) => {
  if (!meal) {
    return (
      <button
        onClick={onPlan}
        className="group/btn w-full h-full min-h-[76px] flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-amber-400/60 dark:hover:border-amber-500/40 rounded-xl bg-white dark:bg-zinc-900/25 text-zinc-400 hover:text-amber-500 dark:text-zinc-600 transition-all cursor-pointer p-2 text-center"
      >
        <Plus className="w-5 h-5 group-hover/btn:scale-110 transition-transform mb-1 opacity-70" />
        <span className="text-[11px] font-semibold">Plan slot</span>
      </button>
    );
  }

  return (
    <div className="group/card relative bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-805/80 rounded-xl p-2 shadow-sm overflow-hidden flex items-start gap-2.5 h-full min-h-[76px]">
      {/* Delete trigger */}
      <button
        onClick={onRemove}
        className="absolute top-1.5 right-1.5 p-1 bg-white/95 dark:bg-zinc-950/95 text-red-500 rounded-md shadow-sm border border-zinc-200/50 dark:border-zinc-800 scale-90 md:opacity-0 group-hover/card:opacity-100 transition duration-150 cursor-pointer z-10"
        title="Remove Planned Slot"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      {/* Picture */}
      <Link to={`/recipes/${meal.idMeal}`} className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-100 dark:bg-zinc-850">
        <img
          src={meal.strMealThumb}
          alt={meal.strMeal}
          className="w-full h-full object-cover group-hover/card:scale-105 transition-transform"
          referrerPolicy="no-referrer"
        />
      </Link>

      {/* Name / Info */}
      <div className="flex-1 min-w-0 pr-4 mt-0.5">
        <Link to={`/recipes/${meal.idMeal}`} className="block">
          <p className="text-[11px] font-bold text-zinc-850 dark:text-zinc-100 line-clamp-2 leading-tight group-hover/card:text-amber-500 transition-colors">
            {meal.strMeal}
          </p>
        </Link>
        {meal.strCategory && (
          <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5 line-clamp-1">
            {meal.strCategory}
          </p>
        )}
      </div>
    </div>
  );
};
