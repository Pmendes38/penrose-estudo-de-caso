'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useEffect,
  useRef,
  Dispatch,
} from 'react';

const STORAGE_KEY = 'penroseCart';
const STORAGE_VERSION = 1;

export type CartItem = {
  productId: string;
  variantKey?: string | null;
  lineId: string;

  name: string;
  price: number;
  quantity: number;

  image?: string | null;
  images?: string[];

  meta?: Record<string, unknown>;
};

type CartState = {
  version: number;
  items: CartItem[];
};

type AddItemPayload = {
  productId: string;
  name: string;
  price: number;
  quantity?: number;
  image?: string | null;
  images?: string[];
  variantKey?: string | null;
  meta?: Record<string, unknown>;
};

type UpdateQuantityPayload = {
  lineId: string;
  quantity: number;
};

const initialState: CartState = { version: STORAGE_VERSION, items: [] };

function makeLineId(productId: string, variantKey?: string | null) {
  return `${productId}::${variantKey ?? ''}`;
}

function mergeItems(items: CartItem[]) {
  const map = new Map<string, CartItem>();
  for (const it of items) {
    const prev = map.get(it.lineId);
    if (prev) {
      map.set(it.lineId, { ...prev, quantity: prev.quantity + it.quantity });
    } else {
      map.set(it.lineId, it);
    }
  }
  return Array.from(map.values());
}

function isBrowser() {
  return typeof window !== 'undefined';
}

function safeReadStorage(): CartState {
  if (!isBrowser()) return initialState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as CartState | { items: any[] };
    // migração simples se não houver version
    if ((parsed as any).version !== STORAGE_VERSION) {
      const items = (parsed as any).items ?? [];
      return { version: STORAGE_VERSION, items };
    }
    return parsed as CartState;
  } catch {
    return initialState;
  }
}

function safeWriteStorage(state: CartState) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage cheio, modo privado, etc. Não quebra a UI.
  }
}

function useDebouncedEffect(effect: () => void, deps: any[], delay = 150) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(effect, delay);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, deps);
}

const enum ActionType {
  ADD_ITEM = 'ADD_ITEM',
  UPDATE_QUANTITY = 'UPDATE_QUANTITY',
  REMOVE_LINE = 'REMOVE_LINE',
  CLEAR = 'CLEAR',
  HYDRATE = 'HYDRATE',
}

type Action =
  | { type: ActionType.ADD_ITEM; payload: AddItemPayload }
  | { type: ActionType.UPDATE_QUANTITY; payload: UpdateQuantityPayload }
  | { type: ActionType.REMOVE_LINE; payload: { lineId: string } }
  | { type: ActionType.CLEAR }
  | { type: ActionType.HYDRATE; payload: CartState };

function cartReducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case ActionType.HYDRATE: {
      return {
        version: STORAGE_VERSION,
        items: mergeItems(action.payload.items ?? []),
      };
    }

    case ActionType.ADD_ITEM: {
      const {
        productId,
        name,
        price,
        quantity = 1,
        image,
        images,
        variantKey,
        meta,
      } = action.payload;

      const lineId = makeLineId(productId, variantKey);
      const existing = state.items.find((it) => it.lineId === lineId);

      if (existing) {
        const items = state.items.map((it) =>
          it.lineId === lineId ? { ...it, quantity: it.quantity + quantity } : it
        );
        return { ...state, items };
      }

      const newItem: CartItem = {
        productId,
        variantKey: variantKey ?? null,
        lineId,
        name,
        price,
        quantity,
        image: image ?? images?.[0] ?? null,
        images,
        meta,
      };
      return { ...state, items: [...state.items, newItem] };
    }

    case ActionType.UPDATE_QUANTITY: {
      const { lineId, quantity } = action.payload;
      if (quantity <= 0) {
        return { ...state, items: state.items.filter((it) => it.lineId !== lineId) };
      }
      return {
        ...state,
        items: state.items.map((it) =>
          it.lineId === lineId ? { ...it, quantity } : it
        ),
      };
    }

    case ActionType.REMOVE_LINE: {
      return { ...state, items: state.items.filter((it) => it.lineId !== action.payload.lineId) };
    }

    case ActionType.CLEAR: {
      return { version: STORAGE_VERSION, items: [] };
    }

    default:
      return state;
  }
}

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  total: number;

  addItem: (payload: AddItemPayload) => void;
  removeLine: (lineId: string) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  clear: () => void;

  hasLine: (lineId: string) => boolean;
  getLineId: (productId: string, variantKey?: string | null) => string;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  // lazy init do estado a partir do localStorage
  const [state, dispatch] = useReducer(cartReducer, initialState, () => safeReadStorage());

  useDebouncedEffect(() => {
    safeWriteStorage(state);
  }, [state]);

  useEffect(() => {
    if (!isBrowser()) return;
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const next = safeReadStorage();
      dispatch({ type: ActionType.HYDRATE, payload: next });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const itemCount = useMemo(
    () => state.items.reduce((acc, it) => acc + it.quantity, 0),
    [state.items]
  );
  const total = useMemo(
    () => state.items.reduce((acc, it) => acc + it.price * it.quantity, 0),
    [state.items]
  );

  const addItem = (payload: AddItemPayload) => dispatch({ type: ActionType.ADD_ITEM, payload });
  const removeLine = (lineId: string) => dispatch({ type: ActionType.REMOVE_LINE, payload: { lineId } });
  const setQuantity = (lineId: string, quantity: number) =>
    dispatch({ type: ActionType.UPDATE_QUANTITY, payload: { lineId, quantity } });
  const clear = () => dispatch({ type: ActionType.CLEAR });

  const hasLine = (lineId: string) => state.items.some((it) => it.lineId === lineId);
  const getLineId = (productId: string, variantKey?: string | null) => makeLineId(productId, variantKey);

  const value: CartContextValue = useMemo(
    () => ({
      items: state.items,
      itemCount,
      total,
      addItem,
      removeLine,
      setQuantity,
      clear,
      hasLine,
      getLineId,
    }),
    [state.items, itemCount, total]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart deve ser usado dentro de um <CartProvider>');
  return ctx;
}
