import { create } from "zustand";
import type { PantryItem } from "@prisma/client";
import { toast } from "sonner";

interface PantryStore {
  items: PantryItem[];
  isLoading: boolean;
  search: string;
  categoryFilter: string;
  setItems: (items: PantryItem[]) => void;
  setSearch: (search: string) => void;
  setCategoryFilter: (category: string) => void;
  addItem: (item: PantryItem) => void;
  updateItem: (id: string, data: Partial<PantryItem>) => void;
  removeItem: (id: string) => void;
  deleteItem: (id: string) => Promise<void>;
  toggleLoading: (loading: boolean) => void;
}

export const usePantryStore = create<PantryStore>((set, get) => ({
  items: [],
  isLoading: false,
  search: "",
  categoryFilter: "",

  setItems: (items) => set({ items }),
  setSearch: (search) => set({ search }),
  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
  toggleLoading: (isLoading) => set({ isLoading }),

  addItem: (item) =>
    set((state) => ({ items: [item, ...state.items] })),

  updateItem: (id, data) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...data } : item
      ),
    })),

  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((item) => item.id !== id) })),

  deleteItem: async (id) => {
    const prev = get().items;
    get().removeItem(id);
    try {
      const res = await fetch(`/api/pantry/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) {
        set({ items: prev });
        toast.error("Failed to delete item");
      }
    } catch {
      set({ items: prev });
      toast.error("Failed to delete item");
    }
  },
}));
