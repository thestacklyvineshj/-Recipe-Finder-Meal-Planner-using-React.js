import { createContext, useContext, useReducer, useEffect,  } from 'react';
import { filterReducer, createEmptyMealPlan } from './AppReducer';
import { useLocalStorage } from '../hooks/useLocalStorage';

const AppContext = createContext(undefined);

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

export const AppProvider = ({ children }) => {
  const [favourites, setFavourites] = useLocalStorage('favourites', []);
  const [mealPlan, setMealPlan] = useLocalStorage(
    'mealPlan',
    createEmptyMealPlan()
  );
  const [theme, setTheme] = useLocalStorage('theme', getInitialTheme());
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

  const addFavourite = (meal) => {
    setFavourites((prev) => {
      if (prev.some((item) => item.idMeal === meal.idMeal)) return prev;
      return [...prev, meal];
    });
  };

  const removeFavourite = (idMeal) => {
    setFavourites((prev) => prev.filter((item) => item.idMeal !== idMeal));
  };

  const toggleFavourite = (meal) => {
    const exists = favourites.some((item) => item.idMeal === meal.idMeal);
    if (exists) {
      removeFavourite(meal.idMeal);
    } else {
      addFavourite(meal);
    }
  };

  const isFavourite = (idMeal) => {
    return favourites.some((item) => item.idMeal === idMeal);
  };

  const setMealPlanSlot = (day, slot, meal) => {
    setMealPlan((prev) => ({
      ...prev,
      [day]: { ...prev[day], [slot]: meal }
    }));
  };

  const clearMealPlan = () => {
    setMealPlan(createEmptyMealPlan());
  };

  const setActiveCategory = (category) => {
    dispatch({ type: 'SET_CATEGORY', payload: category });
  };

  const setActiveArea = (area) => {
    dispatch({ type: 'SET_AREA', payload: area });
  };

  const setFilters = (category, area) => {
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
