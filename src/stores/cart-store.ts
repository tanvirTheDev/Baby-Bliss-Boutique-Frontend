import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, ProductSize, ProductColor, Product } from "@/types";
import { FREE_SHIPPING_THRESHOLD, TAX_RATE } from "@/config/constants";

export interface AppliedCoupon {
  code: string;
  discountAmount: number;
}

interface CartState {
  items: CartItem[];
  appliedCoupon: AppliedCoupon | null;
  setAppliedCoupon: (coupon: AppliedCoupon | null) => void;
  addItem: (
    product: Product,
    size: ProductSize,
    color: ProductColor,
    quantity?: number
  ) => void;
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
  getCouponDiscount: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,

      setAppliedCoupon: (coupon) => set({ appliedCoupon: coupon }),

      addItem: (product, size, color, quantity = 1) => {
        const qty = Math.max(1, Math.floor(quantity));
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
              quantity: updated[existingIndex].quantity + qty,
            };
            return { items: updated, appliedCoupon: null };
          }

          return {
            items: [...state.items, { product, quantity: qty, size, color }],
            appliedCoupon: null,
          };
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
          appliedCoupon: null,
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
          appliedCoupon: null,
        }));
      },

      clearCart: () => set({ items: [], appliedCoupon: null }),

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

      getCouponDiscount: () => get().appliedCoupon?.discountAmount ?? 0,

      getTotal: () => {
        const gross = get().getSubtotal() + get().getShipping() + get().getTax();
        const discount = get().getCouponDiscount();
        return Math.max(0, gross - discount);
      },
    }),
    { name: "baby-bliss-cart" }
  )
);
