import { AppState, AppAction, WeeklyMealPlan, DayOfWeek, MealSlot, PlannedMeal } from '../types';
import { DAYS_OF_WEEK, MEAL_SLOTS } from '../utils/constants';

export const createEmptyMealPlan = (): WeeklyMealPlan => {
  const plan = {} as WeeklyMealPlan;
  DAYS_OF_WEEK.forEach((day) => {
    plan[day] = {
      Breakfast: null,
      Lunch: null,
      Dinner: null
    };
  });
  return plan;
};

export const AppReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'ADD_FAVOURITE': {
      // Avoid duplicates
      const exists = state.favourites.some((meal) => meal.idMeal === action.payload.idMeal);
      if (exists) return state;
      return {
        ...state,
        favourites: [...state.favourites, action.payload]
      };
    }

    case 'REMOVE_FAVOURITE': {
      return {
        ...state,
        favourites: state.favourites.filter((meal) => meal.idMeal !== action.payload)
      };
    }

    case 'SET_MEAL_PLAN': {
      const { day, slot, meal } = action.payload;
      return {
        ...state,
        mealPlan: {
          ...state.mealPlan,
          [day]: {
            ...state.mealPlan[day],
            [slot]: meal
          }
        }
      };
    }

    case 'CLEAR_MEAL_PLAN': {
      return {
        ...state,
        mealPlan: createEmptyMealPlan()
      };
    }

    case 'SET_FILTERS': {
      return {
        ...state,
        activeCategory: action.payload.category,
        activeArea: action.payload.area
      };
    }

    case 'SET_CATEGORY': {
      return {
        ...state,
        activeCategory: action.payload
      };
    }

    case 'SET_AREA': {
      return {
        ...state,
        activeArea: action.payload
      };
    }

    case 'TOGGLE_THEME': {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      return {
        ...state,
        theme: newTheme
      };
    }

    case 'SET_THEME': {
      return {
        ...state,
        theme: action.payload
      };
    }

    default:
      return state;
  }
};
