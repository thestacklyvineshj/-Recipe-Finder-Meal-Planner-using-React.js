import { Meal } from '../types';

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

/**
 * Helper to fetch and validate JSON
 */
async function apiFetch<T>(endpoint: string): Promise<T | null> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error(`Error fetching from TheMealDB API at endpoint "${endpoint}":`, error);
    return null;
  }
}

export interface CategoriesResponse {
  categories: {
    idCategory: string;
    strCategory: string;
    strCategoryThumb: string;
    strCategoryDescription: string;
  }[];
}

export interface AreasResponse {
  meals: {
    strArea: string;
  }[];
}

export interface MealsResponse {
  meals: Meal[] | null;
}

/**
 * All API request utilities
 */
export const mealApi = {
  /**
   * Search for recipes by name
   */
  async searchMealsByName(name: string): Promise<Meal[]> {
    const raw = await apiFetch<MealsResponse>(`/search.php?s=${encodeURIComponent(name)}`);
    return raw?.meals || [];
  },

  /**
   * Search for recipes by single ingredient
   */
  async searchMealsByIngredient(ingredient: string): Promise<Meal[]> {
    const raw = await apiFetch<MealsResponse>(`/filter.php?i=${encodeURIComponent(ingredient)}`);
    return raw?.meals || [];
  },

  /**
   * Get list of all categories with images and descriptions
   */
  async getAllCategories(): Promise<CategoriesResponse['categories']> {
    const raw = await apiFetch<CategoriesResponse>('/categories.php');
    return raw?.categories || [];
  },

  /**
   * Get list of all cuisines/areas
   */
  async getAllAreas(): Promise<string[]> {
    const raw = await apiFetch<AreasResponse>('/list.php?a=list');
    if (!raw || !raw.meals) return [];
    return raw.meals.map((item) => item.strArea).filter(Boolean);
  },

  /**
   * Filter recipes by category
   */
  async filterByCategory(category: string): Promise<Meal[]> {
    const raw = await apiFetch<MealsResponse>(`/filter.php?c=${encodeURIComponent(category)}`);
    return raw?.meals || [];
  },

  /**
   * Filter recipes by area
   */
  async filterByArea(area: string): Promise<Meal[]> {
    const raw = await apiFetch<MealsResponse>(`/filter.php?a=${encodeURIComponent(area)}`);
    return raw?.meals || [];
  },

  /**
   * Get full details of a specific meal by ID
   */
  async getMealDetails(id: string): Promise<Meal | null> {
    const raw = await apiFetch<MealsResponse>(`/lookup.php?i=${id}`);
    if (raw && raw.meals && raw.meals.length > 0) {
      return raw.meals[0];
    }
    return null;
  },

  /**
   * Fetch a random meal (excellent for "Featured Recipe" or empty/trending)
   */
  async getRandomMeal(): Promise<Meal | null> {
    const raw = await apiFetch<MealsResponse>('/random.php');
    if (raw && raw.meals && raw.meals.length > 0) {
      return raw.meals[0];
    }
    return null;
  },

  /**
   * Fetch several random meals to populate landing cards
   */
  async getRandomMeals(count = 6): Promise<Meal[]> {
    const promises = Array.from({ length: count }, () => this.getRandomMeal());
    const meals = await Promise.all(promises);
    return meals.filter((meal): meal is Meal => meal !== null);
  },

  /**
   * Advanced multi-filter fallback helper
   * Fetches recipes for category and filters them locally or vice-versa
   */
  async getFilteredRecipes(category: string, area: string): Promise<Meal[]> {
    if (!category && !area) {
      // Default to a search of an empty space or common item to get some meals, e.g. "a"
      return this.searchMealsByName('a');
    }

    if (category && !area) {
      return this.filterByCategory(category);
    }

    if (!category && area) {
      return this.filterByArea(area);
    }

    // Both active: TheMealDB doesn't support category & area multi-filter directly in one call.
    // Fetch both and find intersection.
    const [catMeals, areaMeals] = await Promise.all([
      this.filterByCategory(category),
      this.filterByArea(area)
    ]);

    const areaIds = new Set(areaMeals.map((m) => m.idMeal));
    return catMeals.filter((m) => areaIds.has(m.idMeal));
  }
};
