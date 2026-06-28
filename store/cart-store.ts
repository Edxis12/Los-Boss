import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
    productId: string;
    variantId: string;
    slug: string;
    name: string;
    price: number;
    imageUrl?: string;
    size?: string | null;
    color?: string | null;
    quantity: number;
};

type CartStore = {
    items: CartItem[];
    addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
    removeItem: (variantId: string) => void;
    updateQuantity: (variantId: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: () => number;
    totalPrice: () => number;
};

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (item, quantity = 1) => {
                const items = get().items;
                const existente = items.find((i) => i.variantId === item.variantId);

                if (existente) {
                    set({
                        items: items.map((i) =>
                            i.variantId === item.variantId
                                ? { ...i, quantity: i.quantity + quantity }
                                : i
                        ),
                    });
                } else {
                    set({ items: [...items, { ...item, quantity }] });
                }
            },

            removeItem: (variantId) => {
                set({ items: get().items.filter((i) => i.variantId !== variantId) });
            },

            updateQuantity: (variantId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(variantId);
                    return;
                }
                set({
                    items: get().items.map((i) =>
                        i.variantId === variantId ? { ...i, quantity } : i
                    ),
                });
            },

            clearCart: () => set({ items: [] }),

            totalItems: () =>
                get().items.reduce((acc, item) => acc + item.quantity, 0),

            totalPrice: () =>
                get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
        }),
        {
            name: "los-boss-cart", // clave en localStorage
        }
    )
);