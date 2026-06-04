import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, Meal, PlannedMeal, DayOfWeek, MealSlot, ThemeMode, WeeklyMealPlan } from '../types';
import { AppReducer, createEmptyMealPlan } from './AppReducer';
import { getStorageItem, setStorageItem } from '../utils/localStorage';

/**
 * Interface representing context API
 */
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

const INITIAL_STATE: AppState = {
  favourites: [],
  mealPlan: createEmptyMealPlan(),
  activeCategory: '',
  activeArea: '',
  theme: 'light'
};

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Initialize state with localStorage values
  const [state, dispatch] = useReducer(AppReducer, INITIAL_STATE, () => {
    const favourites = getStorageItem<Meal[]>('favourites', []);
    const mealPlan = getStorageItem<WeeklyMealPlan>('mealPlan', createEmptyMealPlan());
    
    // Theme initialization
    let initialTheme: ThemeMode = 'light';
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme') as ThemeMode | null;
      if (storedTheme === 'light' || storedTheme === 'dark') {
        initialTheme = storedTheme;
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        initialTheme = 'dark';
      }
    }

    return {
      favourites,
      mealPlan,
      activeCategory: '',
      activeArea: '',
      theme: initialTheme
    };
  });

  // Sync state to localStorage of favourites, mealPlan, and theme
  useEffect(() => {
    setStorageItem('favourites', state.favourites);
  }, [state.favourites]);

  useEffect(() => {
    setStorageItem('mealPlan', state.mealPlan);
  }, [state.mealPlan]);

  useEffect(() => {
    localStorage.setItem('theme', state.theme);
    
    // Apply styling class to html/documentElement
    const root = window.document.documentElement;
    if (state.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.theme]);

  // Actions
  const addFavourite = (meal: Meal) => {
    dispatch({ type: 'ADD_FAVOURITE', payload: meal });
  };

  const removeFavourite = (idMeal: string) => {
    dispatch({ type: 'REMOVE_FAVOURITE', payload: idMeal });
  };

  const toggleFavourite = (meal: Meal) => {
    const exists = state.favourites.some((item) => item.idMeal === meal.idMeal);
    if (exists) {
      removeFavourite(meal.idMeal);
    } else {
      addFavourite(meal);
    }
  };

  const isFavourite = (idMeal: string): boolean => {
    return state.favourites.some((item) => item.idMeal === idMeal);
  };

  const setMealPlan = (day: DayOfWeek, slot: MealSlot, meal: PlannedMeal | null) => {
    dispatch({ type: 'SET_MEAL_PLAN', payload: { day, slot, meal } });
  };

  const clearMealPlan = () => {
    dispatch({ type: 'CLEAR_MEAL_PLAN' });
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
    dispatch({ type: 'TOGGLE_THEME' });
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        addFavourite,
        removeFavourite,
        toggleFavourite,
        isFavourite,
        setMealPlan,
        clearMealPlan,
        setActiveCategory,
        setActiveArea,
        setFilters,
        toggleTheme
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom Hook to consume AppContext
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
