'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type Props = {
  defaultValue?: string;
  className?: string;
  placeholder?: string;
  name?: string; // default: "search"
  debounceMs?: number; // default: 400
};

export default function CatalogSearch({
  defaultValue = '',
  className = '',
  placeholder = 'Buscar por nome, tag…',
  name = 'search',
  debounceMs = 400,
}: Props) {
  const [value, setValue] = React.useState(defaultValue);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const timeoutRef = React.useRef<number | null>(null);
  const schedulePush = React.useCallback(
    (next: string) => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => {
        const params = new URLSearchParams(searchParams?.toString() ?? '');
        if (next) params.set(name, next);
        else params.delete(name);

        params.set('page', '1');

        const qs = params.toString();
        router.replace(`${pathname}${qs ? `?${qs}` : ''}`);
      }, debounceMs) as unknown as number;
    },
    [debounceMs, name, pathname, router, searchParams],
  );

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    setValue(next);
    schedulePush(next.trim());
  }

  function onClear() {
    setValue('');
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    params.delete(name);
    params.set('page', '1');
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    if (value.trim()) params.set(name, value.trim());
    else params.delete(name);
    params.set('page', '1');
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`);
  }

  return (
    <form onSubmit={onSubmit} className={`relative ${className}`}>
      <input
        type="search"
        inputMode="search"
        aria-label="Buscar produtos"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light placeholder-brand-gray
                   focus:outline-none focus:border-brand-blue rounded-lg py-2 pl-10 pr-10"
      />
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray">🔎</span>
      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Limpar busca"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-gray-light hover:text-white"
        >
          ✕
        </button>
      )}
    </form>
  );
}
