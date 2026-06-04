import { DAYS_OF_WEEK, MEAL_SLOTS } from '../utils/constants';

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

export const filterReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FILTERS':
      return {
        activeCategory: action.payload.category,
        activeArea: action.payload.area
      };
    case 'SET_CATEGORY':
      return { ...state, activeCategory: action.payload };
    case 'SET_AREA':
      return { ...state, activeArea: action.payload };
    default:
      return state;
  }
};
