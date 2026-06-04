import { useState, useEffect, useCallback } from 'react';
import { Meal, CategoriesResponse } from '../types';
import { mealApi } from '../utils/api';

export function useMeals() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [categories, setCategories] = useState<CategoriesResponse['categories']>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load basic filters like Categories and Areas on mount
  useEffect(() => {
    let active = true;
    const loadFilters = async () => {
      try {
        const [cats, ars] = await Promise.all([
          mealApi.getAllCategories(),
          mealApi.getAllAreas()
        ]);
        if (active) {
          setCategories(cats);
          setAreas(ars);
        }
      } catch (err) {
        console.error('Failed to load categories/areas:', err);
      }
    };
    loadFilters();
    return () => {
      active = false;
    };
  }, []);

  /**
   * Search meals by search term
   */
  const searchMeals = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const results = await mealApi.searchMealsByName(query);
      setMeals(results);
    } catch (err) {
      setError('Failed to search recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Search meals by single ingredient
   */
  const searchMealsByIngredient = useCallback(async (ingredient: string) => {
    setLoading(true);
    setError(null);
    try {
      const results = await mealApi.searchMealsByIngredient(ingredient);
      setMeals(results);
    } catch (err) {
      setError('Failed to search by ingredient. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch structured combined multi-filter categories/area recipes
   */
  const fetchFilteredMeals = useCallback(async (category: string, area: string) => {
    setLoading(true);
    setError(null);
    try {
      const results = await mealApi.getFilteredRecipes(category, area);
      setMeals(results);
    } catch (err) {
      setError('Failed to fetch recipes. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load some random meals for featured grid
   */
  const fetchFeaturedMeals = useCallback(async (count = 6) => {
    setLoading(true);
    setError(null);
    try {
      // Sometimes standard queries return a fuller set of instructions, so let's try getting some common meals,
      // fallback to random if needed
      const randoms = await mealApi.getRandomMeals(count);
      setMeals(randoms);
    } catch (err) {
      setError('Failed to load featured recipes.');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    meals,
    setMeals,
    categories,
    areas,
    loading,
    error,
    searchMeals,
    searchMealsByIngredient,
    fetchFilteredMeals,
    fetchFeaturedMeals
  };
}
