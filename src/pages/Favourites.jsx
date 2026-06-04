import { Link, useNavigate } from 'react-router-dom';
import { useFavourites } from '../hooks/useFavourites';
import { MealCard } from '../components/MealCard';
import { EmptyState } from '../components/EmptyState';
import { Heart, Search, ListFilter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Favourites = () => {
  const { favourites } = useFavourites();
  const navigate = useNavigate();

  return (
    <div className="space-y-8 pb-16" id="favourites-page-container">
      {/* Title section head */}
      <section className="space-y-2 border-b border-zinc-150 dark:border-zinc-800 pb-5">
        <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
          <Heart className="w-6 h-6 text-red-500 fill-red-500" />
          <span>My Saved Favourites</span>
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-xl">
          A personal cookbook of saved recipes. Meals are automatically persisted in client storage.
        </p>
      </section>

      {/* Grid rendering favorites */}
      <section id="favorites-board">
        {favourites.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Your collection is empty"
            description="Browse through thousands of curated recipes. Click the heart button on any card to add it here!"
            actionText="Find Recipes Now"
            onAction={() => navigate('/recipes')}
          />
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {favourites.map((meal) => (
                <MealCard key={meal.idMeal} meal={meal} showRemoveFavouriteOnly />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </div>
  );
};
