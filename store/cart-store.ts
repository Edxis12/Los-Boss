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

// "userKey" es el  id del usuario logueado, o "guest" si no hay sesion.
// Todo el carrito se guarda separado por userKey dentro del mismo storage.

type CartsByUser = Record<string, CartItem[]>;

type CartStore = {
    cartsByUser: CartsByUser;
    addItem: (
        userKey: string,
        item: Omit<CartItem, "quantity">,
        quantity?: number
    ) => void;
    removeItem: (userKey: string, variantId: string) => void;
    updateQuantity: (
        userKey: string,
        variantId: string,
        quantity: number,
    ) => void;
    clearCart: (userKey: string) => void;
    getItems: (userKey: string) => CartItem[];
    getTotalItems: (userKey: string) => number;
    getTotalPrice: (userKey: string) => number;
};

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            cartsByUser: {},

            addItem: (userKey, item, quantity = 1) => {
                const carritoActual = get().cartsByUser[userKey] ?? [];
                const existente = carritoActual.find(
                    (i) => i.variantId === item.variantId
                );

                const nuevoCarrito = existente
                    ? carritoActual.map((i) =>
                        i.variantId === item.variantId
                            ? { ...i, quantity: i.quantity + quantity }
                            : i
                    )
                    : [...carritoActual, { ...item, quantity }];

                set({
                    cartsByUser: { ...get().cartsByUser, [userKey]: nuevoCarrito },
                });
            },

            removeItem: (userKey, variantId) => {
                const carritoActual = get().cartsByUser[userKey] ?? [];
                set({
                    cartsByUser: {
                        ...get().cartsByUser,
                        [userKey]: carritoActual.filter(
                            (i) => i.variantId !== variantId
                        ),
                    },
                });
            },

            updateQuantity: (userKey, variantId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(userKey, variantId);
                    return;
                }
                const carritoActual = get().cartsByUser[userKey] ?? [];
                set({
                    cartsByUser: {
                        ...get().cartsByUser,
                        [userKey]: carritoActual.map((i) =>
                            i.variantId === variantId ? { ...i, quantity } : i
                        ),
                    },
                });
            },

            clearCart: (userKey) => {
                set({
                    cartsByUser: { ...get().cartsByUser, [userKey]: [] },
                });
            },

            getItems: (userKey) => get().cartsByUser[userKey] ?? [],

            getTotalItems: (userKey) =>
                (get().cartsByUser[userKey] ?? []).reduce(
                    (acc, item) => acc + item.quantity,
                    0
                ),

            getTotalPrice: (userKey) =>
                (get().cartsByUser[userKey] ?? []).reduce(
                    (acc, item) => acc + item.price * item.quantity,
                    0
                ),
        }),
        {
            name: "los-boss-cart", // una sola clave en localStorage, separada internamente por userKey
        }
    )
);

// Helper para usar siempre la misma clave: el id del usuario, p "guest"
export function useCartUserKey(sessionUserId: string | undefined | null) {
    return sessionUserId ?? "guest";
}