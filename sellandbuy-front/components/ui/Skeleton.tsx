import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`bg-neutral-200/60 animate-pulse rounded-xl ${className}`}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="w-full aspect-[4/5] rounded-3xl" />
      <div className="px-1 flex flex-col gap-2">
        <Skeleton className="h-5 w-3/4 rounded-md" />
        <Skeleton className="h-6 w-1/3 rounded-md" />
        <Skeleton className="h-4 w-1/2 rounded-md mt-1" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </>
  );
}
