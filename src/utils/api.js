
const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

/**
 * Helper to fetch and validate JSON
 */
async function apiFetch(endpoint) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching from TheMealDB API at endpoint "${endpoint}":`, error);
    return null;
  }
}

/**
 * All API request utilities
 */
export const mealApi = {
  /**
   * Search for recipes by name
   */
  async searchMealsByName(name) {
    const raw = await apiFetch(`/search.php?s=${encodeURIComponent(name)}`);
    return raw?.meals || [];
  },

  /**
   * Search for recipes by single ingredient
   */
  async searchMealsByIngredient(ingredient) {
    const raw = await apiFetch(`/filter.php?i=${encodeURIComponent(ingredient)}`);
    return raw?.meals || [];
  },

  /**
   * Get list of all categories with images and descriptions
   */
  async getAllCategories() {
    const raw = await apiFetch('/categories.php');
    return raw?.categories || [];
  },

  /**
   * Get list of all cuisines/areas
   */
  async getAllAreas() {
    const raw = await apiFetch('/list.php?a=list');
    if (!raw || !raw.meals) return [];
    return raw.meals.map((item) => item.strArea).filter(Boolean);
  },

  /**
   * Filter recipes by category
   */
  async filterByCategory(category) {
    const raw = await apiFetch(`/filter.php?c=${encodeURIComponent(category)}`);
    return raw?.meals || [];
  },

  /**
   * Filter recipes by area
   */
  async filterByArea(area) {
    const raw = await apiFetch(`/filter.php?a=${encodeURIComponent(area)}`);
    return raw?.meals || [];
  },

  /**
   * Get full details of a specific meal by ID
   */
  async getMealDetails(id) {
    const raw = await apiFetch(`/lookup.php?i=${id}`);
    if (raw && raw.meals && raw.meals.length > 0) {
      return raw.meals[0];
    }
    return null;
  },

  /**
   * Fetch a random meal (excellent for "Featured Recipe" or empty/trending)
   */
  async getRandomMeal() {
    const raw = await apiFetch('/random.php');
    if (raw && raw.meals && raw.meals.length > 0) {
      return raw.meals[0];
    }
    return null;
  },

  /**
   * Fetch several random meals to populate landing cards
   */
  async getRandomMeals(count = 6) {
    const promises = Array.from({ length: count }, () => this.getRandomMeal());
    const meals = await Promise.all(promises);
    return meals.filter((meal) => meal !== null);
  },

  /**
   * Advanced multi-filter fallback helper
   * Fetches recipes for category and filters them locally or vice-versa
   */
  async getFilteredRecipes(category, area) {
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
