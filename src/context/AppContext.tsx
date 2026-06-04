import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
  AppState,
  Meal,
  PlannedMeal,
  DayOfWeek,
  MealSlot,
  ThemeMode,
  WeeklyMealPlan
} from '../types';
import { filterReducer, createEmptyMealPlan } from './AppReducer';
import { useLocalStorage } from '../hooks/useLocalStorage';

export interface AppContextType extends AppState {
  addFavourite: (meal: Meal) => void;
  removeFavourite: (idMeal: string) => void;
  toggleFavourite: (meal: Meal) => void;
  isFavourite: (idMeal: string) => boolean;
  setMealPlan: (day: DayOfWeek, slot: MealSlot, meal: PlannedMeal | null) => void;
  clearMealPlan: () => void;
  setActiveCategory: (category: string) => void;
  setActiveArea: (area: string) => void;
  setFilters: (category: string, area: string) => void;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('theme') as ThemeMode | null;
  if (stored === 'light' || stored === 'dark') return stored;
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [favourites, setFavourites] = useLocalStorage<Meal[]>('favourites', []);
  const [mealPlan, setMealPlan] = useLocalStorage<WeeklyMealPlan>(
    'mealPlan',
    createEmptyMealPlan()
  );
  const [theme, setTheme] = useLocalStorage<ThemeMode>('theme', getInitialTheme());
  const [filterState, dispatch] = useReducer(filterReducer, {
    activeCategory: '',
    activeArea: ''
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const addFavourite = (meal: Meal) => {
    setFavourites((prev) => {
      if (prev.some((item) => item.idMeal === meal.idMeal)) return prev;
      return [...prev, meal];
    });
  };

  const removeFavourite = (idMeal: string) => {
    setFavourites((prev) => prev.filter((item) => item.idMeal !== idMeal));
  };

  const toggleFavourite = (meal: Meal) => {
    const exists = favourites.some((item) => item.idMeal === meal.idMeal);
    if (exists) {
      removeFavourite(meal.idMeal);
    } else {
      addFavourite(meal);
    }
  };

  const isFavourite = (idMeal: string): boolean => {
    return favourites.some((item) => item.idMeal === idMeal);
  };

  const setMealPlanSlot = (day: DayOfWeek, slot: MealSlot, meal: PlannedMeal | null) => {
    setMealPlan((prev) => ({
      ...prev,
      [day]: { ...prev[day], [slot]: meal }
    }));
  };

  const clearMealPlan = () => {
    setMealPlan(createEmptyMealPlan());
  };

  const setActiveCategory = (category: string) => {
    dispatch({ type: 'SET_CATEGORY', payload: category });
  };

  const setActiveArea = (area: string) => {
    dispatch({ type: 'SET_AREA', payload: area });
  };

  const setFilters = (category: string, area: string) => {
    dispatch({ type: 'SET_FILTERS', payload: { category, area } });
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <AppContext.Provider
      value={{
        favourites,
        mealPlan,
        theme,
        activeCategory: filterState.activeCategory,
        activeArea: filterState.activeArea,
        addFavourite,
        removeFavourite,
        toggleFavourite,
        isFavourite,
        setMealPlan: setMealPlanSlot,
        clearMealPlan,
        setActiveCategory,
        setActiveArea,
        setFilters,
        toggleTheme,
        setTheme
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
