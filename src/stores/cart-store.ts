import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, ProductSize, ProductColor, Product } from "@/types";
import { FREE_SHIPPING_THRESHOLD, TAX_RATE } from "@/config/constants";

interface CartState {
  items: CartItem[];
  addItem: (product: Product, size: ProductSize, color: ProductColor) => void;
  removeItem: (productId: string, size: ProductSize, colorName: string) => void;
  updateQuantity: (
    productId: string,
    size: ProductSize,
    colorName: string,
    quantity: number
  ) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getShipping: () => number;
  getTax: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, size, color) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) =>
              item.product.id === product.id &&
              item.size === size &&
              item.color.name === color.name
          );

          if (existingIndex > -1) {
            const updated = [...state.items];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + 1,
            };
            return { items: updated };
          }

          return { items: [...state.items, { product, quantity: 1, size, color }] };
        });
      },

      removeItem: (productId, size, colorName) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(
                item.product.id === productId &&
                item.size === size &&
                item.color.name === colorName
              )
          ),
        }));
      },

      updateQuantity: (productId, size, colorName, quantity) => {
        if (quantity < 1) return;
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId &&
            item.size === size &&
            item.color.name === colorName
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getItemCount: () => get().items.reduce((acc, item) => acc + item.quantity, 0),

      getSubtotal: () =>
        get().items.reduce(
          (acc, item) =>
            acc + (item.product.salePrice ?? item.product.price) * item.quantity,
          0
        ),

      getShipping: () => {
        const subtotal = get().getSubtotal();
        return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 5.99;
      },

      getTax: () => get().getSubtotal() * TAX_RATE,

      getTotal: () => get().getSubtotal() + get().getShipping() + get().getTax(),
    }),
    { name: "baby-bliss-cart" }
  )
);
