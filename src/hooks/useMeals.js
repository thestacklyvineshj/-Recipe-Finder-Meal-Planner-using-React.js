import { useState, useEffect, useCallback, useRef } from 'react';
import { mealApi, ApiError } from '../utils/api';

function getErrorMessage(err, fallback) {
  if (err instanceof ApiError) {
    if (err.message.includes('timed out') || err.message.includes('cancelled')) {
      return 'Request timed out. Please try again.';
    }
    return err.message;
  }
  return fallback;
}

export function useMeals() {
  const [meals, setMeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtersError, setFiltersError] = useState(null);
  const fetchAbortRef = useRef(null);

  const runFetch = useCallback(async (fetcher, fallbackMessage) => {
    fetchAbortRef.current?.abort();
    const controller = new AbortController();
    fetchAbortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const results = await fetcher(controller.signal);
      if (!controller.signal.aborted) {
        setMeals(results);
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(getErrorMessage(err, fallbackMessage));
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadFilters = async () => {
      try {
        const [cats, ars] = await Promise.all([
          mealApi.getAllCategories({ signal: controller.signal }),
          mealApi.getAllAreas({ signal: controller.signal })
        ]);
        if (!controller.signal.aborted) {
          setCategories(cats);
          setAreas(ars);
          setFiltersError(null);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setFiltersError(getErrorMessage(err, 'Failed to load filters.'));
        }
      }
    };

    loadFilters();
    return () => {
      controller.abort();
      fetchAbortRef.current?.abort();
    };
  }, []);

  const searchMeals = useCallback(
    (query) =>
      runFetch(
        (signal) => mealApi.searchMealsByName(query, { signal }),
        'Failed to search recipes. Please try again.'
      ),
    [runFetch]
  );

  const searchMealsByIngredient = useCallback(
    (ingredient) =>
      runFetch(
        (signal) => mealApi.searchMealsByIngredient(ingredient, { signal }),
        'Failed to search by ingredient. Please try again.'
      ),
    [runFetch]
  );

  const fetchFilteredMeals = useCallback(
    (category, area) =>
      runFetch(
        (signal) => mealApi.getFilteredRecipes(category, area, { signal }),
        'Failed to fetch recipes. Please check your internet connection.'
      ),
    [runFetch]
  );

  const fetchFeaturedMeals = useCallback(
    (count = 6) =>
      runFetch(
        (signal) => mealApi.getRandomMeals(count, { signal }),
        'Failed to load featured recipes.'
      ),
    [runFetch]
  );

  return {
    meals,
    setMeals,
    categories,
    areas,
    loading,
    error,
    filtersError,
    searchMeals,
    searchMealsByIngredient,
    fetchFilteredMeals,
    fetchFeaturedMeals
  };
}
