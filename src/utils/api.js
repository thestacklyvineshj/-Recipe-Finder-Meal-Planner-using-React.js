const BASE_URL =
  import.meta.env.VITE_MEALDB_URL || 'https://www.themealdb.com/api/json/v1/1';
const REQUEST_TIMEOUT_MS = 10000;

const DEFAULT_BROWSE_CATEGORIES = ['Chicken', 'Beef', 'Dessert'];

export class ApiError extends Error {
  constructor(message, { status, endpoint, cause } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.endpoint = endpoint;
    this.cause = cause;
  }
}

function isAbortError(error) {
  return error?.name === 'AbortError';
}

/**
 * Fetch JSON from TheMealDB with timeout and optional abort support.
 */
async function apiFetch(endpoint, { signal } = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const onExternalAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) {
      clearTimeout(timeoutId);
      throw new ApiError('Request was cancelled', { endpoint });
    }
    signal.addEventListener('abort', onExternalAbort, { once: true });
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      signal: controller.signal
    });

    if (!response.ok) {
      throw new ApiError(`API Error: ${response.status} ${response.statusText}`, {
        status: response.status,
        endpoint
      });
    }

    return await response.json();
  } catch (error) {
    if (isAbortError(error)) {
      throw new ApiError('Request timed out or was cancelled', { endpoint, cause: error });
    }
    if (error instanceof ApiError) throw error;
    throw new ApiError('Failed to reach TheMealDB API. Check your connection.', {
      endpoint,
      cause: error
    });
  } finally {
    clearTimeout(timeoutId);
    if (signal) signal.removeEventListener('abort', onExternalAbort);
  }
}

/**
 * All API request utilities
 */
export const mealApi = {
  /**
   * Search for recipes by name
   */
  async searchMealsByName(name, { signal } = {}) {
    const raw = await apiFetch(`/search.php?s=${encodeURIComponent(name)}`, { signal });
    return raw?.meals || [];
  },

  /**
   * Search for recipes by single ingredient
   */
  async searchMealsByIngredient(ingredient, { signal } = {}) {
    const raw = await apiFetch(`/filter.php?i=${encodeURIComponent(ingredient)}`, { signal });
    return raw?.meals || [];
  },

  /**
   * Get list of all categories with images and descriptions
   */
  async getAllCategories({ signal } = {}) {
    const raw = await apiFetch('/categories.php', { signal });
    return raw?.categories || [];
  },

  /**
   * Get list of all cuisines/areas
   */
  async getAllAreas({ signal } = {}) {
    const raw = await apiFetch('/list.php?a=list', { signal });
    if (!raw?.meals) return [];
    return raw.meals.map((item) => item.strArea).filter(Boolean);
  },

  /**
   * Filter recipes by category
   */
  async filterByCategory(category, { signal } = {}) {
    const raw = await apiFetch(`/filter.php?c=${encodeURIComponent(category)}`, { signal });
    return raw?.meals || [];
  },

  /**
   * Filter recipes by area
   */
  async filterByArea(area, { signal } = {}) {
    const raw = await apiFetch(`/filter.php?a=${encodeURIComponent(area)}`, { signal });
    return raw?.meals || [];
  },

  /**
   * Get full details of a specific meal by ID
   */
  async getMealDetails(id, { signal } = {}) {
    const raw = await apiFetch(`/lookup.php?i=${id}`, { signal });
    if (raw?.meals?.length > 0) {
      return raw.meals[0];
    }
    return null;
  },

  /**
   * Fetch a random meal (excellent for "Featured Recipe" or empty/trending)
   */
  async getRandomMeal({ signal } = {}) {
    const raw = await apiFetch('/random.php', { signal });
    if (raw?.meals?.length > 0) {
      return raw.meals[0];
    }
    return null;
  },

  /**
   * Default browse list when no filters are active
   */
  async getDefaultBrowseRecipes({ signal } = {}) {
    const results = await Promise.all(
      DEFAULT_BROWSE_CATEGORIES.map((category) =>
        this.filterByCategory(category, { signal })
      )
    );

    const seen = new Set();
    return results.flat().filter((meal) => {
      if (seen.has(meal.idMeal)) return false;
      seen.add(meal.idMeal);
      return true;
    });
  },

  /**
   * Fetch several random meals sequentially to avoid rate limits
   */
  async getRandomMeals(count = 6, { signal } = {}) {
    const meals = [];
    const seen = new Set();

    for (let i = 0; i < count; i++) {
      const meal = await this.getRandomMeal({ signal });
      if (meal && !seen.has(meal.idMeal)) {
        seen.add(meal.idMeal);
        meals.push(meal);
      }
    }

    return meals;
  },

  /**
   * Advanced multi-filter fallback helper
   * Fetches recipes for category and filters them locally or vice-versa
   */
  async getFilteredRecipes(category, area, { signal } = {}) {
    if (!category && !area) {
      return this.getDefaultBrowseRecipes({ signal });
    }

    if (category && !area) {
      return this.filterByCategory(category, { signal });
    }

    if (!category && area) {
      return this.filterByArea(area, { signal });
    }

    const [catMeals, areaMeals] = await Promise.all([
      this.filterByCategory(category, { signal }),
      this.filterByArea(area, { signal })
    ]);

    const areaIds = new Set(areaMeals.map((m) => m.idMeal));
    return catMeals.filter((m) => areaIds.has(m.idMeal));
  }
};
