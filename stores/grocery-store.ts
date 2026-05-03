import { create } from "zustand";
import type { GroceryList, GroceryItem } from "@prisma/client";
import { toast } from "sonner";

type GroceryListSummary = {
  id: string;
  name: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  totalItems: number;
  uncheckedItems: number;
};

type GroceryListFull = GroceryList & { items: GroceryItem[] };

interface GroceryStore {
  lists: GroceryListSummary[];
  activeList: GroceryListFull | null;
  isLoading: boolean;
  setLists: (lists: GroceryListSummary[]) => void;
  setActiveList: (list: GroceryListFull | null) => void;
  addList: (list: GroceryListSummary) => void;
  removeList: (id: string) => void;
  toggleItem: (listId: string, itemId: string, checked: boolean) => Promise<void>;
  deleteItem: (listId: string, itemId: string) => Promise<void>;
  toggleLoading: (loading: boolean) => void;
}

export const useGroceryStore = create<GroceryStore>((set, get) => ({
  lists: [],
  activeList: null,
  isLoading: false,

  setLists: (lists) => set({ lists }),
  setActiveList: (activeList) => set({ activeList }),
  addList: (list) => set((state) => ({ lists: [list, ...state.lists] })),
  removeList: (id) =>
    set((state) => ({ lists: state.lists.filter((l) => l.id !== id) })),
  toggleLoading: (isLoading) => set({ isLoading }),

  toggleItem: async (listId, itemId, checked) => {
    const prev = get().activeList;
    set((state) => ({
      activeList: state.activeList
        ? {
            ...state.activeList,
            items: state.activeList.items.map((item) =>
              item.id === itemId ? { ...item, isChecked: checked } : item
            ),
          }
        : null,
    }));

    try {
      const res = await fetch(`/api/grocery-list/${listId}/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isChecked: checked }),
      });
      const json = await res.json();
      if (!json.success) {
        set({ activeList: prev });
        toast.error("Failed to update item");
      }
    } catch {
      set({ activeList: prev });
      toast.error("Failed to update item");
    }
  },

  deleteItem: async (listId, itemId) => {
    const prev = get().activeList;
    set((state) => ({
      activeList: state.activeList
        ? {
            ...state.activeList,
            items: state.activeList.items.filter((item) => item.id !== itemId),
          }
        : null,
    }));

    try {
      const res = await fetch(`/api/grocery-list/${listId}/items/${itemId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) {
        set({ activeList: prev });
        toast.error("Failed to delete item");
      }
    } catch {
      set({ activeList: prev });
      toast.error("Failed to delete item");
    }
  },
}));
