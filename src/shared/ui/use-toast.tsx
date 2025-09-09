// src/shared/ui/use-toast.tsx
'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

type ToastVariant = 'default' | 'success' | 'destructive';

export type ToastAction = {
  label: string;
  onClick: () => void | Promise<void>;
};

export type ToastOptions = {
  id?: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number; // ms
  action?: ToastAction;
};

type ToastInternal = Required<
  Pick<ToastOptions, 'id' | 'title' | 'description' | 'variant' | 'duration'>
> & {
  action?: ToastAction;
};

type ToastContextValue = {
  toasts: ToastInternal[];
  toast: (opts: ToastOptions) => string; // retorna id
  dismiss: (id: string) => void;
  clearAll: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastInternal[]>([]);
  // controla timers para limpar em dismiss/unmount
  const timersRef = useRef<Map<string, number>>(new Map());

  const dismiss = useCallback((id: string) => {
    const t = timersRef.current.get(id);
    if (t) {
      clearTimeout(t);
      timersRef.current.delete(id);
    }
    setToasts((curr) => curr.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (opts: ToastOptions) => {
      const id = opts.id ?? `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const item: ToastInternal = {
        id,
        title: opts.title ?? '',
        description: opts.description ?? '',
        variant: opts.variant ?? 'default',
        duration: Math.max(1500, opts.duration ?? 3500),
        action: opts.action,
      };
      setToasts((curr) => [...curr, item]);

      const t = window.setTimeout(() => dismiss(id), item.duration);
      timersRef.current.set(id, t);

      return id;
    },
    [dismiss],
  );

  const clearAll = useCallback(() => {
    for (const t of timersRef.current.values()) clearTimeout(t);
    timersRef.current.clear();
    setToasts([]);
  }, []);

  // limpa timers no unmount do provider
  useEffect(() => {
    return () => {
      for (const t of timersRef.current.values()) clearTimeout(t);
      timersRef.current.clear();
    };
  }, []);

  const value = useMemo(
    () => ({ toasts, toast, dismiss, clearAll }),
    [toasts, toast, dismiss, clearAll],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return {
    toast: ctx.toast,
    dismiss: ctx.dismiss,
    clearAll: ctx.clearAll,
    toasts: ctx.toasts,
  };
}

export function Toaster() {
  const { toasts, dismiss } = useToast();
  const [mounted, setMounted] = useState(false);
  const portalRef = useRef<HTMLDivElement | null>(null);
  const createdByMeRef = useRef(false);

  useIsomorphicLayoutEffect(() => {
    setMounted(true);

    // Reutiliza o nó se já existir
    let el = document.getElementById('toast-portal') as HTMLDivElement | null;
    if (!el) {
      el = document.createElement('div');
      el.setAttribute('id', 'toast-portal');
      document.body.appendChild(el);
      createdByMeRef.current = true;
    } else {
      createdByMeRef.current = false;
    }
    portalRef.current = el;

    return () => {
      const node = portalRef.current;
      // remove apenas se fomos nós que criamos e se ainda é filho do body
      if (node && createdByMeRef.current && node.parentNode === document.body) {
        try {
          document.body.removeChild(node);
        } catch {
          // ignora se já foi removido por outro fluxo/hot reload
        }
      }
      portalRef.current = null;
    };
  }, []);

  if (!mounted || !portalRef.current) return null;

  return createPortal(
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-0 z-[100] flex flex-col-reverse items-end gap-3 p-4 sm:items-end sm:p-6"
    >
      <div className="ml-auto flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onClose={() => dismiss(t.id)} />
        ))}
      </div>
    </div>,
    portalRef.current,
  );
}

function ToastCard({ toast, onClose }: { toast: ToastInternal; onClose: () => void }) {
  const base =
    'pointer-events-auto w-full overflow-hidden rounded-lg border shadow-lg transition-all data-[state=open]:animate-in data-[state=closed]:animate-out';
  const variants: Record<ToastVariant, string> = {
    default: 'bg-brand-gray-dark border-brand-gray-border text-brand-gray-light',
    success: 'bg-emerald-900/60 border-emerald-700 text-emerald-100',
    destructive: 'bg-red-900/60 border-red-700 text-red-100',
  };

  return (
    <div
      role="status"
      className={`${base} ${variants[toast.variant]} data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:fade-out`}
      data-state="open"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            {toast.title ? <p className="font-medium leading-none">{toast.title}</p> : null}
            {toast.description ? (
              <p className="mt-1 text-sm opacity-90 break-words">{toast.description}</p>
            ) : null}
          </div>

          <button
            onClick={onClose}
            aria-label="Fechar"
            className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-md border border-transparent hover:bg-white/10 focus:outline-none"
          >
            ✕
          </button>
        </div>

        {toast.action ? (
          <div className="mt-3">
            <button
              onClick={async () => {
                try {
                  await toast.action!.onClick();
                } finally {
                  onClose();
                }
              }}
              className="inline-flex items-center rounded-md border px-3 py-1 text-sm font-medium hover:bg-white/10"
            >
              {toast.action.label}
            </button>
          </div>
        ) : null}
      </div>

      <div className="h-1 w-full bg-black/20">
        <div className="h-full w-full origin-left animate-[toastbar_3.5s_linear] bg-white/30" />
      </div>

      <style jsx>{`
        @keyframes toastbar {
          from {
            transform: scaleX(1);
          }
          to {
            transform: scaleX(0);
          }
        }
      `}</style>
    </div>
  );
}
