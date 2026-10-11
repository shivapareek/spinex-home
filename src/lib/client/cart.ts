"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = { productId: number; slug: string; name: string; price: number; image: string | null; quantity: number; stock: number };

type CartState = {
  items: CartItem[];
  open: boolean;
  coupon: string | null;
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  setQty: (productId: number, qty: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
  setCoupon: (code: string | null) => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      open: false,
      coupon: null,
      add: (item, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.productId === item.productId);
          const items = existing
            ? s.items.map((i) => (i.productId === item.productId ? { ...i, ...item, quantity: Math.min(i.quantity + qty, item.stock || 99) } : i))
            : [...s.items, { ...item, quantity: Math.min(qty, item.stock || 99) }];
          return { items, open: true };
        }),
      setQty: (id, qty) => set((s) => ({ items: s.items.map((i) => (i.productId === id ? { ...i, quantity: Math.max(1, Math.min(qty, i.stock || 99)) } : i)) })),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.productId !== id) })),
      clear: () => set({ items: [], coupon: null }),
      setOpen: (open) => set({ open }),
      setCoupon: (coupon) => set({ coupon }),
    }),
    { name: "spx-cart", partialize: (s) => ({ items: s.items, coupon: s.coupon }) },
  ),
);

export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.quantity, 0);
export const cartSubtotal = (items: CartItem[]) => items.reduce((n, i) => n + i.price * i.quantity, 0);

type WishState = { ids: number[]; toggle: (id: number) => void; has: (id: number) => boolean };
export const useWishlist = create<WishState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => set((s) => ({ ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id] })),
      has: (id) => get().ids.includes(id),
    }),
    { name: "spx-wishlist" },
  ),
);

/** Avoid hydration mismatch for persisted stores */
import { useEffect, useState } from "react";
export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}
