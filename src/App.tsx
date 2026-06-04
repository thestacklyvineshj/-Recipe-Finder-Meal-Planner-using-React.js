import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Recipes } from './pages/Recipes';
import { RecipeDetail } from './pages/RecipeDetail';
import { Favourites } from './pages/Favourites';
import { MealPlanner } from './pages/MealPlanner';

function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-150">
      <Navbar />
      {/* Scrollable contents flow */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <Outlet />
      </main>
      
      {/* Global Brand Footer */}
      <footer className="py-6 border-t border-zinc-200/50 dark:border-zinc-900/80 bg-white/50 dark:bg-zinc-900/30 text-center text-[11px] font-semibold uppercase tracking-wider text-zinc-400 print:hidden">
        <p>© 2026 DishCraft Recipe Finder & Meal Planner. Styled with Tailwind CSS.</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="recipes" element={<Recipes />} />
            <Route path="recipes/:id" element={<RecipeDetail />} />
            <Route path="favourites" element={<Favourites />} />
            <Route path="meal-planner" element={<MealPlanner />} />
            {/* Fallback route to redirect users */}
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
