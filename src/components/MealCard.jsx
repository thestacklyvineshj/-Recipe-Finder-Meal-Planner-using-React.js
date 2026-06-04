import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Calendar, Plus, ChevronDown, CheckCheck, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { useFavourites } from '../hooks/useFavourites';
import { DAYS_OF_WEEK, MEAL_SLOTS } from '../utils/constants';

export const MealCard = ({
  meal,
  showRemoveFavouriteOnly = false
}) => {
  const { idMeal, strMeal, strMealThumb, strCategory, strArea } = meal;
  const { isFavourite, toggleFavourite, removeFavourite } = useFavourites();
  const { setMealPlan } = useApp();
  const [isPlanning, setIsPlanning] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedSlot, setSelectedSlot] = useState('Breakfast');
  const [justPlanned, setJustPlanned] = useState(false);

  const favorited = isFavourite(idMeal);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavourite(meal);
  };

  const handleRemoveFavouriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    removeFavourite(idMeal);
  };

  const handlePlannerToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPlanning(!isPlanning);
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setMealPlan(selectedDay, selectedSlot, {
      idMeal,
      strMeal,
      strMealThumb,
      strCategory,
      strArea
    });

    setJustPlanned(true);
    setIsPlanning(false);

    setTimeout(() => {
      setJustPlanned(false);
    }, 2000);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="group relative bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col h-full"
      id={`meal-card-${idMeal}`}
    >
      {/* Absolute Badges / Icons */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        {showRemoveFavouriteOnly ? (
          <button
            onClick={handleRemoveFavouriteClick}
            aria-label="Remove from Favourites"
            className="p-2.5 bg-white/95 dark:bg-zinc-900/95 text-red-500 hover:text-red-700 hover:bg-white dark:hover:bg-zinc-800 rounded-full shadow-sm shadow-black/10 transition-colors backdrop-blur-sm cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleFavoriteClick}
            aria-label={favorited ? 'Remove from Favourites' : 'Add to Favourites'}
            className="p-2.5 bg-white/95 dark:bg-zinc-900/95 text-zinc-400 hover:text-red-500 rounded-full shadow-sm shadow-black/10 transition-colors backdrop-blur-sm cursor-pointer"
          >
            <Heart className={`w-4 h-4 transition-transform group-hover:scale-105 ${favorited ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        )}
      </div>

      {/* Card Image */}
      <Link to={`/recipes/${idMeal}`} className="block relative overflow-hidden aspect-[4/3] bg-zinc-100 dark:bg-zinc-800">
        <img
          src={strMealThumb}
          alt={strMeal}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        {/* Dynamic decorative visual overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/20 to-transparent h-12"></div>
      </Link>

      {/* Main content body */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          {/* Categories tag rows */}
          <div className="flex flex-wrap gap-1.5 text-[10px] font-bold tracking-wide uppercase text-zinc-400">
            {strCategory && (
              <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-md text-zinc-600 dark:text-zinc-300">
                {strCategory}
              </span>
            )}
            {strArea && (
              <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-md text-zinc-600 dark:text-zinc-300">
                {strArea}
              </span>
            )}
          </div>

          <Link to={`/recipes/${idMeal}`} className="block">
            <h3 className="font-heading font-semibold text-zinc-850 dark:text-zinc-100 text-sm md:text-base leading-snug group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
              {strMeal}
            </h3>
          </Link>
        </div>

        {/* Footer: Details link + Quick scheduling button */}
        <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/80 pt-3 relative">
          <Link
            to={`/recipes/${idMeal}`}
            className="text-xs font-semibold text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 flex items-center"
          >
            Full Recipe &rarr;
          </Link>

          {!justPlanned ? (
            <button
              onClick={handlePlannerToggle}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                isPlanning
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200'
                  : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Plan</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isPlanning ? 'rotate-180' : ''}`} />
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-bold py-1 px-2 bg-green-50 dark:bg-green-950/25 rounded-lg border border-green-200 dark:border-green-800">
              <CheckCheck className="w-3.5 h-3.5" /> Planned!
            </span>
          )}

          {/* Quick inline planner popup menu */}
          <AnimatePresence>
            {isPlanning && (
              <>
                <div
                  className="fixed inset-0 z-20 cursor-default"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPlanning(false);
                  }}
                ></div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  className="absolute right-0 bottom-full mb-2 z-30 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 shadow-xl w-60 max-w-xs space-y-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1 border-b border-zinc-100 dark:border-zinc-800 pb-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    <span>Schedule into Planner</span>
                  </div>

                  <form onSubmit={handleScheduleSubmit} className="space-y-2.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Day</label>
                      <select
                        value={selectedDay}
                        onChange={(e) => setSelectedDay(e.target.value)}
                        className="w-full text-xs p-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-zinc-800 dark:text-zinc-200"
                      >
                        {DAYS_OF_WEEK.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Slot</label>
                      <select
                        value={selectedSlot}
                        onChange={(e) => setSelectedSlot(e.target.value)}
                        className="w-full text-xs p-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-zinc-800 dark:text-zinc-200"
                      >
                        {MEAL_SLOTS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsPlanning(false)}
                        className="flex-1 text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 py-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 text-[10px] font-bold bg-amber-500 text-white py-1.5 rounded-md hover:bg-amber-600 shadow-sm flex items-center justify-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Save
                      </button>
                    </div>
                  </form>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
