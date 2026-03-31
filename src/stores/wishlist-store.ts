import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WishlistItem } from "@/types";

interface WishlistState {
  items: WishlistItem[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  getCount: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (productId) => {
        set((state) => {
          if (state.items.some((item) => item.productId === productId)) {
            return state;
          }
          return {
            items: [...state.items, { productId, addedAt: new Date().toISOString() }],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      toggleItem: (productId) => {
        const isWishlisted = get().isWishlisted(productId);
        if (isWishlisted) {
          get().removeItem(productId);
        } else {
          get().addItem(productId);
        }
      },

      isWishlisted: (productId) =>
        get().items.some((item) => item.productId === productId),

      getCount: () => get().items.length,
    }),
    { name: "baby-bliss-wishlist" }
  )
);
