import React from 'react';

interface LoaderProps {
  type?: 'spinner' | 'card-grid' | 'detail';
  count?: number;
}

export const Loader: React.FC<LoaderProps> = ({ type = 'spinner', count = 6 }) => {
  if (type === 'spinner') {
    return (
      <div className="flex flex-col items-center justify-center py-12" id="spinner-loader">
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">Fetching delicious recipes...</p>
      </div>
    );
  }

  if (type === 'card-grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse" id="skeleton-grid">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
            <div className="aspect-[4/3] bg-zinc-200 dark:bg-zinc-850"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3"></div>
              <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
              <div className="flex justify-between items-center pt-2">
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4"></div>
                <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-10"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Recipe detail skeleton
  return (
    <div className="space-y-6 animate-pulse p-4" id="detail-skeleton">
      <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3"></div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 aspect-video sm:aspect-[4/3] bg-zinc-200 dark:bg-zinc-800 rounded-3xl"></div>
        <div className="lg:col-span-7 space-y-4">
          <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4"></div>
          <div className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
          <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
};
