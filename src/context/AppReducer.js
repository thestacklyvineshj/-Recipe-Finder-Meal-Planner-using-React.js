import { DAYS_OF_WEEK } from '../utils/constants';

export const createEmptyMealPlan = () => {
  const plan = {};
  DAYS_OF_WEEK.forEach((day) => {
    plan[day] = {
      Breakfast: null,
      Lunch: null,
      Dinner: null
    };
  });
  return plan;
};

export const initialAppState = {
  favourites: [],
  mealPlan: createEmptyMealPlan(),
  selectedCategory: '',
  selectedArea: '',
  theme: 'light'
};

/**
 * Single global reducer — assignment-required action types.
 */
export const appReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_FAVOURITE': {
      const exists = state.favourites.some((m) => m.idMeal === action.payload.idMeal);
      if (exists) return state;
      return { ...state, favourites: [...state.favourites, action.payload] };
    }

    case 'REMOVE_FAVOURITE':
      return {
        ...state,
        favourites: state.favourites.filter((m) => m.idMeal !== action.payload)
      };

    case 'ADD_MEAL':
    case 'REPLACE_MEAL': {
      const { day, slot, meal } = action.payload;
      return {
        ...state,
        mealPlan: {
          ...state.mealPlan,
          [day]: { ...state.mealPlan[day], [slot]: meal }
        }
      };
    }

    case 'REMOVE_MEAL': {
      const { day, slot } = action.payload;
      return {
        ...state,
        mealPlan: {
          ...state.mealPlan,
          [day]: { ...state.mealPlan[day], [slot]: null }
        }
      };
    }

    case 'CLEAR_MEAL_PLAN':
      return { ...state, mealPlan: createEmptyMealPlan() };

    case 'SET_CATEGORY':
      return { ...state, selectedCategory: action.payload };

    case 'SET_AREA':
      return { ...state, selectedArea: action.payload };

    case 'SET_FILTERS':
      return {
        ...state,
        selectedCategory: action.payload.category,
        selectedArea: action.payload.area
      };

    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' };

    case 'SET_THEME':
      return { ...state, theme: action.payload };

    case 'HYDRATE':
      return { ...state, ...action.payload };

    default:
      return state;
  }
};
