import { create } from "zustand";
 
type MenuStore = {
    openId: string | null;
    setOpenId: (id: string | null) => void;
};

export const useRowMenuStore = create<MenuStore>((set) => ({
    openId: null,
    setOpenId: (id) => set({ openId: id }),
}));