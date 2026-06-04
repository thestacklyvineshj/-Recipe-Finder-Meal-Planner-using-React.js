export interface CategoriesResponse {
  categories: {
    idCategory: string;
    strCategory: string;
    strCategoryThumb: string;
    strCategoryDescription: string;
  }[];
}

export interface Meal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory?: string;
  strArea?: string;
  strInstructions?: string;
  strTags?: string;
  strYoutube?: string;
  [key: string]: string | undefined; // To handle dynamic list of ingredients e.g., strIngredient1
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export type MealSlot = 'Breakfast' | 'Lunch' | 'Dinner';

export interface PlannedMeal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory?: string;
  strArea?: string;
}

export type WeeklyMealPlan = Record<DayOfWeek, Record<MealSlot, PlannedMeal | null>>;

export type ThemeMode = 'light' | 'dark';

export interface AppState {
  favourites: Meal[];
  mealPlan: WeeklyMealPlan;
  activeCategory: string;
  activeArea: string;
  theme: ThemeMode;
}

export type AppAction =
  | { type: 'ADD_FAVOURITE'; payload: Meal }
  | { type: 'REMOVE_FAVOURITE'; payload: string }
  | { type: 'SET_MEAL_PLAN'; payload: { day: DayOfWeek; slot: MealSlot; meal: PlannedMeal | null } }
  | { type: 'CLEAR_MEAL_PLAN' }
  | { type: 'SET_FILTERS'; payload: { category: string; area: string } }
  | { type: 'SET_CATEGORY'; payload: string }
  | { type: 'SET_AREA'; payload: string }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_THEME'; payload: ThemeMode };
