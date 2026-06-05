import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { appReducer, createEmptyMealPlan, initialAppState } from './AppReducer';
import { getStorageItem, setStorageItem } from '../utils/localStorage';

const AppContext = createContext(undefined);

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  try {
    const parsed = JSON.parse(stored);
    if (parsed === 'light' || parsed === 'dark') return parsed;
  } catch {
    /* plain string handled above */
  }
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

function loadInitialState() {
  return {
    ...initialAppState,
    favourites: getStorageItem('favourites', []),
    mealPlan: getStorageItem('mealPlan', createEmptyMealPlan()),
    theme: getInitialTheme()
  };
}

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, undefined, loadInitialState);

  useEffect(() => {
    setStorageItem('favourites', state.favourites);
  }, [state.favourites]);

  useEffect(() => {
    setStorageItem('mealPlan', state.mealPlan);
  }, [state.mealPlan]);

  useEffect(() => {
    setStorageItem('theme', state.theme);
    const root = window.document.documentElement;
    if (state.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.theme]);

  const addFavourite = useCallback(
    (meal) => dispatch({ type: 'ADD_FAVOURITE', payload: meal }),
    []
  );

  const removeFavourite = useCallback(
    (idMeal) => dispatch({ type: 'REMOVE_FAVOURITE', payload: idMeal }),
    []
  );

  const toggleFavourite = useCallback(
    (meal) => {
      if (state.favourites.some((m) => m.idMeal === meal.idMeal)) {
        dispatch({ type: 'REMOVE_FAVOURITE', payload: meal.idMeal });
      } else {
        dispatch({ type: 'ADD_FAVOURITE', payload: meal });
      }
    },
    [state.favourites]
  );

  const isFavourite = useCallback(
    (idMeal) => state.favourites.some((m) => m.idMeal === idMeal),
    [state.favourites]
  );

  const addMeal = useCallback(
    (day, slot, meal) => dispatch({ type: 'ADD_MEAL', payload: { day, slot, meal } }),
    []
  );

  const replaceMeal = useCallback(
    (day, slot, meal) => dispatch({ type: 'REPLACE_MEAL', payload: { day, slot, meal } }),
    []
  );

  const removeMeal = useCallback(
    (day, slot) => dispatch({ type: 'REMOVE_MEAL', payload: { day, slot } }),
    []
  );

  const setMealPlan = useCallback(
    (day, slot, meal) => {
      if (meal === null) {
        dispatch({ type: 'REMOVE_MEAL', payload: { day, slot } });
        return;
      }
      const existing = state.mealPlan[day]?.[slot];
      if (existing) {
        dispatch({ type: 'REPLACE_MEAL', payload: { day, slot, meal } });
      } else {
        dispatch({ type: 'ADD_MEAL', payload: { day, slot, meal } });
      }
    },
    [state.mealPlan]
  );

  const clearMealPlan = useCallback(() => dispatch({ type: 'CLEAR_MEAL_PLAN' }), []);

  const setSelectedCategory = useCallback(
    (category) => dispatch({ type: 'SET_CATEGORY', payload: category }),
    []
  );

  const setSelectedArea = useCallback(
    (area) => dispatch({ type: 'SET_AREA', payload: area }),
    []
  );

  const setFilters = useCallback(
    (category, area) => dispatch({ type: 'SET_FILTERS', payload: { category, area } }),
    []
  );

  const toggleTheme = useCallback(() => dispatch({ type: 'TOGGLE_THEME' }), []);

  const setTheme = useCallback(
    (mode) => dispatch({ type: 'SET_THEME', payload: mode }),
    []
  );

  return (
    <AppContext.Provider
      value={{
        ...state,
        addFavourite,
        removeFavourite,
        toggleFavourite,
        isFavourite,
        addMeal,
        removeMeal,
        replaceMeal,
        setMealPlan,
        clearMealPlan,
        setSelectedCategory,
        setSelectedArea,
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
