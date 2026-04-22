import React from "react";

export default function Loading() {
  return (
    <article className="min-h-screen">
      {/* Skeleton Header Zone */}
      <header className="content-grid pt-8 pb-16 md:pt-12 md:pb-20">
        <div className="animate-pulse">
          {/* Breadcrumb skeleton */}
          <div className="h-4 w-48 bg-zinc-100 dark:bg-zinc-900 rounded-md" />
          
          {/* Title skeleton */}
          <div className="mt-10 h-14 md:h-20 w-3/4 bg-zinc-100 dark:bg-zinc-900 rounded-xl" />
          
          {/* Meta skeleton */}
          <div className="mt-8 flex items-center gap-4">
             <div className="h-3 w-20 bg-zinc-100 dark:bg-zinc-900 rounded" />
             <div className="h-1 w-1 rounded-full bg-zinc-800" />
             <div className="h-3 w-32 bg-zinc-100 dark:bg-zinc-900 rounded" />
          </div>

          <div className="mt-12 h-px w-full bg-zinc-100 dark:bg-zinc-900" />
        </div>
      </header>

      {/* Skeleton Content Zone */}
      <div className="content-grid prose-custom animate-pulse">
        <div className="space-y-6 pb-24">
          <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-900 rounded" />
          <div className="h-4 w-5/6 bg-zinc-100 dark:bg-zinc-900 rounded" />
          <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-900 rounded" />
          <div className="h-4 w-4/6 bg-zinc-100 dark:bg-zinc-900 rounded" />
          
          <div className="my-10 h-64 w-full bg-zinc-100 dark:bg-zinc-900 rounded-xl" />
          
          <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-900 rounded" />
          <div className="h-4 w-3/4 bg-zinc-100 dark:bg-zinc-900 rounded" />
        </div>
      </div>
    </article>
  );
}
