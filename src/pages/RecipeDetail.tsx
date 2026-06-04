import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, Calendar, CheckSquare, Youtube, Clock, ArrowLeft, Plus, BookmarkCheck, Utensils, RefreshCw, ChefHat } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { mealApi } from '../utils/api';
import { Meal, DayOfWeek, MealSlot } from '../types';
import { DAYS_OF_WEEK, MEAL_SLOTS } from '../utils/constants';
import { Loader } from '../components/Loader';

export const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isFavourite, toggleFavourite, setMealPlan } = useApp();

  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selector state for Inline Planner Scheduler
  const [isPlanning, setIsPlanning] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  const [selectedSlot, setSelectedSlot] = useState<MealSlot>('Breakfast');
  const [plannedSuccess, setPlannedSuccess] = useState(false);

  // Checked ingredients tracker to assist the chef
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const details = await mealApi.getMealDetails(id);
        if (details) {
          setMeal(details);
        } else {
          setError('Recipe detail guide not found.');
        }
      } catch (err) {
        setError('Failed to fetch recipe detail.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  // Extract ingredients list
  const ingredients = React.useMemo(() => {
    if (!meal) return [];
    const list: { name: string; measure: string; id: string }[] = [];
    for (let i = 1; i <= 20; i++) {
      const ing = meal[`strIngredient${i}`];
      const meas = meal[`strMeasure${i}`];
      if (ing && ing.trim()) {
        list.push({
          name: ing.trim(),
          measure: meas ? meas.trim() : '',
          id: `ing-${i}-${ing}`
        });
      }
    }
    return list;
  }, [meal]);

  // Parse Youtube video ID for embed
  const ytEmbedUrl = React.useMemo(() => {
    if (!meal || !meal.strYoutube) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = meal.strYoutube.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return null;
  }, [meal]);

  // Parse instructions into individual paragraphs
  const instructions = React.useMemo(() => {
    if (!meal || !meal.strInstructions) return [];
    return meal.strInstructions
      .split(/\r?\n/)
      .map((step) => step.trim())
      .filter((step) => step.length > 8); // ignore empty strings or random line numbering
  }, [meal]);

  const favorited = meal ? isFavourite(meal.idMeal) : false;

  const handleFavoriteToggle = () => {
    if (meal) toggleFavourite(meal);
  };

  const handlePlanningSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meal) return;
    
    setMealPlan(selectedDay, selectedSlot, {
      idMeal: meal.idMeal,
      strMeal: meal.strMeal,
      strMealThumb: meal.strMealThumb,
      strCategory: meal.strCategory,
      strArea: meal.strArea
    });

    setPlannedSuccess(true);
    setIsPlanning(false);

    setTimeout(() => {
      setPlannedSuccess(false);
    }, 2500);
  };

  const toggleIngredientChecked = (ingId: string) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [ingId]: !prev[ingId]
    }));
  };

  if (loading) {
    return (
      <div className="py-12" id="recipe-detail-loading">
        <Loader type="detail" />
      </div>
    );
  }

  if (error || !meal) {
    return (
      <div className="py-12 text-center" id="recipe-detail-error">
        <p className="text-red-500 font-semibold mb-4">{error || 'Recipe not found'}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 bg-amber-500 text-white rounded-xl shadow font-semibold inline-flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16" id="recipe-detail-container">
      {/* Back button and page head */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-xs font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-350 hover:bg-zinc-50 rounded-xl transition duration-150 shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Recipes
        </button>

        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Recipe detail card
        </span>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Visual Media (Image, Fav / Plan Buttons, YT Tutorial) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="relative text-white rounded-3xl overflow-hidden aspect-[4/3] shadow-md border border-zinc-150 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-850">
            <img
              src={meal.strMealThumb}
              alt={meal.strMeal}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
          </div>

          {/* Core Scheduling Options Panel */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/80 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleFavoriteToggle}
                className={`flex-1 min-w-[140px] py-3.5 px-4 rounded-xl text-xs font-bold leading-none shadow-sm transition-all duration-150 inline-flex items-center justify-center gap-2 cursor-pointer ${
                  favorited
                    ? 'bg-red-500 text-white hover:bg-red-650'
                    : 'bg-white hover:bg-zinc-50 border border-zinc-200 dark:bg-zinc-805 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <Heart className={`w-4 h-4 ${favorited ? 'fill-white' : ''}`} />
                {favorited ? 'In Favourites' : 'Add Favourites'}
              </button>

              {!plannedSuccess ? (
                <button
                  onClick={() => setIsPlanning(!isPlanning)}
                  className={`flex-1 min-w-[140px] py-3.5 px-4 rounded-xl text-xs font-bold leading-none shadow-sm transition-all duration-150 inline-flex items-center justify-center gap-2 cursor-pointer ${
                    isPlanning
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200'
                      : 'bg-amber-500 hover:bg-amber-600 text-white'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>{isPlanning ? 'Close Plan' : 'Plan Weekly Meal'}</span>
                </button>
              ) : (
                <span className="flex-1 min-w-[140px] py-3.5 px-4 rounded-xl text-xs font-bold leading-none text-green-700 bg-green-50 border border-green-250 dark:bg-green-950/20 dark:border-green-800 inline-flex items-center justify-center gap-1.5 shadow-sm">
                  <BookmarkCheck className="w-4 h-4" /> Schedule saved!
                </span>
              )}
            </div>

            {/* Inline Scheduler Panel */}
            <AnimatePresence>
              {isPlanning && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <form onSubmit={handlePlanningSubmit} className="pt-3 border-t border-zinc-150 dark:border-zinc-800 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                          Day
                        </label>
                        <select
                          value={selectedDay}
                          onChange={(e) => setSelectedDay(e.target.value as DayOfWeek)}
                          className="w-full text-xs p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-505 text-zinc-850 dark:text-zinc-200"
                        >
                          {DAYS_OF_WEEK.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                          Meal Slot
                        </label>
                        <select
                          value={selectedSlot}
                          onChange={(e) => setSelectedSlot(e.target.value as MealSlot)}
                          className="w-full text-xs p-2.5 bg-zinc-50 dark:bg-zinc-805 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-505 text-zinc-850 dark:text-zinc-200"
                        >
                          {MEAL_SLOTS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 active:translate-y-px text-white text-xs font-bold rounded-xl shadow-sm transition inline-flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Save to Slate
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* YouTube Video Embed Tutorial If Available */}
          {ytEmbedUrl && (
            <div className="bg-zinc-50 dark:bg-zinc-950/40 p-4 border border-zinc-200/55 dark:border-zinc-800 rounded-3xl space-y-3">
              <h3 className="font-heading font-extrabold text-sm text-zinc-850 dark:text-zinc-150 flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-500" />
                <span>Video Cooking Walkthrough</span>
              </h3>
              <div className="relative overflow-hidden rounded-2xl aspect-video border border-zinc-200/40 dark:border-zinc-800">
                <iframe
                  src={ytEmbedUrl}
                  title={`${meal.strMeal} Tutorial video`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full"
                ></iframe>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Metadata details, Ingredients List, Method Instructions */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            {/* Category / Area tags */}
            <div className="flex flex-wrap gap-2 text-xs font-bold tracking-wider uppercase text-zinc-400">
              {meal.strCategory && (
                <span className="px-3 py-1 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 rounded-full border border-amber-100 dark:border-amber-900/40">
                  {meal.strCategory}
                </span>
              )}
              {meal.strArea && (
                <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-350 rounded-full">
                  {meal.strArea} Cuisine
                </span>
              )}
            </div>

            <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-zinc-900 dark:text-white leading-tight">
              {meal.strMeal}
            </h1>

            {meal.strTags && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {meal.strTags.split(',').map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] bg-zinc-50 dark:bg-zinc-900 text-zinc-455 dark:text-zinc-450 border border-zinc-200 dark:border-zinc-800 font-extrabold rounded-md px-2 py-0.5"
                  >
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Splitting side contents: Ingredients Checklist */}
          <div className="border-t border-zinc-150 dark:border-zinc-800 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-zinc-850 dark:text-zinc-100 flex items-center gap-1.5">
                <Utensils className="w-5 h-5 text-amber-500" />
                <span>Ingredients checklist</span>
              </h3>
              <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">
                {ingredients.length} items
              </p>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed -mt-1.5">
              Check off ingredients as you prepare them in your kitchen.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-zinc-50 dark:bg-zinc-900/30 p-5 border border-zinc-150 dark:border-zinc-850 rounded-2xl">
              {ingredients.map((item) => {
                const isChecked = !!checkedIngredients[item.id];
                return (
                  <label
                    key={item.id}
                    className={`flex items-center gap-3 text-xs p-1.5 rounded-lg select-none cursor-pointer transition ${
                      isChecked
                        ? 'opacity-60 line-through text-zinc-400 dark:text-zinc-550'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleIngredientChecked(item.id)}
                      className="w-4 h-4 text-amber-550 focus:ring-amber-505 border-zinc-300 rounded cursor-pointer accent-amber-505"
                    />
                    <div className="flex-1 flex justify-between pr-2 min-w-0">
                      <span className="font-semibold truncate">{item.name}</span>
                      <span className="font-mono text-zinc-400 dark:text-zinc-500 text-[10px] tracking-tight shrink-0 ml-1">
                        {item.measure}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Cooking Instructions Step Cards */}
          <div className="border-t border-zinc-150 dark:border-zinc-800/85 pt-6 space-y-4">
            <h3 className="font-heading font-bold text-lg text-zinc-850 dark:text-zinc-100 flex items-center gap-1.5">
              <ChefHat className="w-5 h-5 text-amber-500" />
              <span>Step-by-Step Instructions</span>
            </h3>

            {instructions.length === 0 ? (
              <p className="text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed bg-zinc-50 dark:bg-zinc-900/30 p-4 rounded-xl border border-dashed border-zinc-250 dark:border-zinc-800">
                {meal.strInstructions}
              </p>
            ) : (
              <div className="space-y-4">
                {instructions.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 p-4 border border-zinc-200/50 dark:border-zinc-805 bg-white dark:bg-zinc-900 rounded-xl hover:shadow-sm transition"
                  >
                    <div className="w-7 h-7 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold rounded-full text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <div className="text-xs text-zinc-650 dark:text-zinc-300 leading-relaxed pt-0.5">
                      {step}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
