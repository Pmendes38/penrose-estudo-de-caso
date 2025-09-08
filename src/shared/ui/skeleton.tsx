import * as React from 'react';

type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  forceVisible?: boolean;
};

export function Skeleton({ className = '', forceVisible = true, ...props }: SkeletonProps) {
  if (!forceVisible) return null;
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={
        `animate-pulse rounded-md bg-brand-gray-border/60 ${className}`
      }
      {...props}
    />
  );
}

export default Skeleton;
