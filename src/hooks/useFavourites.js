import { useApp } from '../context/AppContext';

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
