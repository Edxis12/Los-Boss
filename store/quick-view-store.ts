import { create } from "zustand";
import type { QuickViewProduct } from "@/lib/actions/product-actions";

type QuickViewStore = {
    isOpen: boolean;
    productSlug: string | null;

    cache: Record<string, QuickViewProduct>;

    openQuickView: (productSlug: string) => void;
    closeQuickView: () => void;

    cacheProduct: (product: QuickViewProduct) => void;
    clearCache: () => void;
};

export const useQuickViewStore = create<QuickViewStore>(
    (set) => ({
        isOpen: false,
        productSlug: null,

        cache: {},

        openQuickView: (productSlug) =>
            set({
                isOpen: true,
                productSlug,
            }),

        closeQuickView: () =>
            set({
                isOpen: false,
                productSlug: null,
            }),

        cacheProduct: (product) =>
            set((state) => ({
                cache: {
                    ...state.cache,
                    [product.slug]: product,
                },
            })),

        clearCache: () =>
            set({
                cache: {},
            }),
    })
);