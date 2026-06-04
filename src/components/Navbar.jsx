import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ChefHat, Heart, Calendar, Menu, X, Library, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { MEAL_SLOTS, DAYS_OF_WEEK } from '../utils/constants';

export const Navbar = () => {
  const { favourites, mealPlan, theme, toggleTheme } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Count planned slot meals
  const totalPlannedMeals = DAYS_OF_WEEK.reduce((total, day) => {
    const plannedForDay = MEAL_SLOTS.filter((s) => mealPlan[day]?.[s] != null).length;
    return total + plannedForDay;
  }, 0);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Classes for NavLinks
  const navLinkClasses = ({ isActive }) =>
    `relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150 border border-transparent ${
      isActive
        ? 'bg-amber-50 hover:bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200/40 dark:border-amber-900/40'
        : 'text-zinc-650 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/60 dark:hover:text-white'
    }`;

  const mobileNavLinkClasses = ({ isActive }) =>
    `flex items-center gap-2.5 px-4 py-3 rounded-2xl text-base font-bold tracking-wide transition-all ${
      isActive
        ? 'bg-amber-500 text-white shadow-md'
        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-zinc-900/95 border-b border-zinc-200/50 dark:border-zinc-800/60 backdrop-blur-md shadow-sm" id="main-navigation-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Brand Title */}
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex items-center gap-2.5 select-none group" onClick={closeMobileMenu}>
              <div className="p-2 bg-amber-500 text-white rounded-2xl shadow-md group-hover:rotate-6 transition-transform duration-200">
                <ChefHat className="w-5 h-5" />
              </div>
              <span className="font-heading font-extrabold tracking-tight text-lg text-zinc-900 dark:text-white group-hover:text-amber-500 transition-colors">
                DishCraft
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Link Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" end className={navLinkClasses}>
              Home
            </NavLink>
            <NavLink to="/recipes" className={navLinkClasses}>
              <Library className="w-4 h-4" />
              Recipes
            </NavLink>
            <NavLink to="/favourites" className={navLinkClasses}>
              <Heart className="w-4 h-4" />
              Favourites
              {favourites.length > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ring-2 ring-white dark:ring-zinc-900 animate-pulse">
                  {favourites.length}
                </span>
              )}
            </NavLink>
            <NavLink to="/meal-planner" className={navLinkClasses}>
              <Calendar className="w-4 h-4" />
              Planner
              {totalPlannedMeals > 0 && (
                <span className="bg-amber-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ring-2 ring-white dark:ring-zinc-900">
                  {totalPlannedMeals}
                </span>
              )}
            </NavLink>
          </nav>

          {/* Theme toggle + mobile menu */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-650 hover:text-amber-500 dark:text-zinc-300 dark:hover:text-amber-300 shadow-sm transition cursor-pointer"
              aria-label="Toggle dark or light mode"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <button
              onClick={toggleMobileMenu}
              className="p-2.5 md:hidden rounded-xl border border-zinc-200/50 dark:border-zinc-850 bg-white dark:bg-zinc-900 text-zinc-650 hover:text-amber-500 dark:text-zinc-300 shadow-sm transition cursor-pointer"
              aria-label="Open toggle menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE EXPANSED SLIDER BLOCK */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-zinc-200/50 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              <NavLink to="/" end onClick={closeMobileMenu} className={mobileNavLinkClasses}>
                Home
              </NavLink>

              <NavLink to="/recipes" onClick={closeMobileMenu} className={mobileNavLinkClasses}>
                <Library className="w-5 h-5 shrink-0" />
                Recipes Listing
              </NavLink>

              <NavLink to="/favourites" onClick={closeMobileMenu} className={mobileNavLinkClasses}>
                <Heart className="w-5 h-5 shrink-0" />
                <span className="flex-1">Saved Favourites</span>
                {favourites.length > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {favourites.length}
                  </span>
                )}
              </NavLink>

              <NavLink to="/meal-planner" onClick={closeMobileMenu} className={mobileNavLinkClasses}>
                <Calendar className="w-5 h-5 shrink-0" />
                <span className="flex-1">Weekly Meal Planner</span>
                {totalPlannedMeals > 0 && (
                  <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {totalPlannedMeals}
                  </span>
                )}
              </NavLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
