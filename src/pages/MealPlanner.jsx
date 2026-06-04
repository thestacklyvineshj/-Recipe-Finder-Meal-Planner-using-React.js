import { useApp } from '../context/AppContext';
import { MealPlanGrid } from '../components/MealPlanGrid';
import { Calendar, Info, Sparkles } from 'lucide-react';

export const MealPlanner = () => {
  const { theme } = useApp();

  const handlePrint = () => {
    // Standard window.print triggers printable CSS layouts automatically
    window.print();
  };

  return (
    <div className="space-y-8 pb-16" id="meal-planner-page-container">
      {/* Title head banner */}
      <section className="space-y-2 border-b border-zinc-150 dark:border-zinc-805 pb-5 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
              <Calendar className="w-6 h-6 text-amber-500" />
              <span>Weekly Meal Planner</span>
            </h1>
            <p className="text-zinc-550 dark:text-zinc-400 text-sm max-w-xl">
              Organize your Breakfast, Lunch, and Dinner routines. Stay consistent with your diet goals.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 self-start sm:self-center px-3 py-1.5 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-xl border border-amber-100 dark:border-amber-900/40 shadow-sm whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Consistent Eating Habits</span>
          </div>
        </div>
      </section>

      {/* Main interactive planner calendar dashboard */}
      <section id="planner-calendar-view" className="print:block">
        {/* Printable Menu Header Only Visible in Print Format */}
        <div className="hidden print:block text-center pb-8 border-b-2 border-zinc-300 space-y-2">
          <h1 className="font-heading font-extrabold text-3xl text-zinc-900">
            DishCraft Weekly Meal Schedule
          </h1>
          <p className="text-zinc-500 font-medium">
            Curated meal planning schedule for healthy habits.
          </p>
        </div>

        <MealPlanGrid onPrint={handlePrint} />
      </section>

      {/* Culinary planner tip drawer */}
      <section className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/40 rounded-2xl p-4 flex gap-3 print:hidden">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-amber-850 dark:text-amber-300">
            Culinary Planning Insights
          </h4>
          <p className="text-xs text-amber-900/70 dark:text-amber-400/80 leading-relaxed">
            Structuring recipes for specific day slots significantly shortens grocery preparation times. Simply click any card's "Plan" dropdown or tap empty plus buttons below to build your schedule block.
          </p>
        </div>
      </section>
    </div>
  );
};
