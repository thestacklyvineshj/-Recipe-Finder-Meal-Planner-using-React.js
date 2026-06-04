import { useApp } from '../context/AppContext';
import { Meal } from '../types';

export function useFavourites() {
  const { favourites, addFavourite, removeFavourite, toggleFavourite, isFavourite } = useApp();

  return {
    favourites,
    addFavourite,
    removeFavourite,
    toggleFavourite,
    isFavourite
  };
}
