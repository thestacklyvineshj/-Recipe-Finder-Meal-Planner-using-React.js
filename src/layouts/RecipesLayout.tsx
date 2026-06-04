import { Outlet } from 'react-router-dom';

/**
 * Nested layout for /recipes — renders child routes (listing index, :id detail).
 */
export function RecipesLayout() {
  return <Outlet />;
}
