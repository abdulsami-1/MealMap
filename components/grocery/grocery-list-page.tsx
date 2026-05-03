"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  ShoppingCart,
  Sparkles,
  Loader2,
  ChevronRight,
  CheckCircle2,
  Clock,
  Archive,
} from "lucide-react";
import { toast } from "sonner";
import { useGroceryStore } from "@/stores/grocery-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { GroceryListView } from "./grocery-list-view";
import { CreateListDialog } from "./create-list-dialog";
import { cn, formatDate } from "@/lib/utils";

type ListSummary = {
  id: string;
  name: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  totalItems: number;
  uncheckedItems: number;
};

interface GroceryListPageProps {
  initialLists: ListSummary[];
}

const statusConfig = {
  ACTIVE: { icon: Clock, label: "Active", class: "text-blue-600 bg-blue-50 dark:bg-blue-950" },
  COMPLETED: { icon: CheckCircle2, label: "Completed", class: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950" },
  ARCHIVED: { icon: Archive, label: "Archived", class: "text-slate-500 bg-slate-100 dark:bg-slate-800" },
};

export function GroceryListPage({ initialLists }: GroceryListPageProps) {
  const {
    lists,
    activeList,
    setLists,
    setActiveList,
    addList,
    removeList,
  } = useGroceryStore();

  const [createOpen, setCreateOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadingListId, setLoadingListId] = useState<string | null>(null);

  useEffect(() => {
    setLists(initialLists);
    const active = initialLists.find((l) => l.status === "ACTIVE");
    if (active && !selectedId) setSelectedId(active.id);
  }, [initialLists, setLists, selectedId]);

  async function loadList(id: string) {
    setSelectedId(id);
    setLoadingListId(id);
    try {
      const res = await fetch(`/api/grocery-list/${id}`);
      const json = await res.json();
      if (json.success) setActiveList(json.data);
    } catch {
      toast.error("Failed to load list");
    } finally {
      setLoadingListId(null);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/grocery-list/generate", { method: "POST" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      const newSummary: ListSummary = {
        id: json.data.id,
        name: json.data.name,
        status: json.data.status,
        createdAt: json.data.createdAt,
        updatedAt: json.data.updatedAt,
        totalItems: json.data.items?.length ?? 0,
        uncheckedItems: json.data.items?.filter((i: { isChecked: boolean }) => !i.isChecked).length ?? 0,
      };
      addList(newSummary);
      setActiveList(json.data);
      setSelectedId(json.data.id);
      toast.success("Grocery list generated from your pantry & meal plan");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate list");
    } finally {
      setGenerating(false);
    }
  }

  async function handleDeleteList(id: string) {
    if (!confirm("Delete this grocery list?")) return;
    const res = await fetch(`/api/grocery-list/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      removeList(id);
      if (selectedId === id) {
        setSelectedId(null);
        setActiveList(null);
      }
      toast.success("List deleted");
    }
  }

  async function handleStatusChange(id: string, status: string) {
    const res = await fetch(`/api/grocery-list/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (json.success) {
      setLists(lists.map((l) => (l.id === id ? { ...l, status } : l)));
      toast.success("List updated");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Grocery Lists</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {lists.filter((l) => l.status === "ACTIVE").length} active list
            {lists.filter((l) => l.status === "ACTIVE").length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <Loader2 className="size-4 mr-1.5 animate-spin" />
            ) : (
              <Sparkles className="size-4 mr-1.5" />
            )}
            Generate from Plan
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4 mr-1.5" />
            New List
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6 items-start">
        {/* Sidebar: list of all grocery lists */}
        <div className="space-y-2">
          {lists.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center py-10 text-center">
                <ShoppingCart className="size-8 text-muted-foreground mb-3" />
                <p className="text-sm font-medium">No lists yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Create one or generate from your meal plan
                </p>
              </CardContent>
            </Card>
          ) : (
            lists.map((list) => {
              const config = statusConfig[list.status as keyof typeof statusConfig] ?? statusConfig.ACTIVE;
              const isSelected = selectedId === list.id;
              return (
                <motion.div
                  key={list.id}
                  whileHover={{ x: 2 }}
                  onClick={() => loadList(list.id)}
                  className={cn(
                    "cursor-pointer rounded-lg border p-3 transition-all",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-border/80 hover:shadow-sm"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className={cn("font-medium text-sm truncate", isSelected && "text-primary")}>
                        {list.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {list.uncheckedItems}/{list.totalItems} remaining
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(list.updatedAt)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", config.class)}>
                        {config.label}
                      </span>
                      {loadingListId === list.id && (
                        <Loader2 className="size-3 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Main: list detail */}
        <div>
          {selectedId && activeList?.id === selectedId ? (
            <GroceryListView
              list={activeList}
              onDelete={handleDeleteList}
              onStatusChange={handleStatusChange}
            />
          ) : selectedId && loadingListId === selectedId ? (
            <GroceryListViewSkeleton />
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center py-20 text-center">
                <ShoppingCart className="size-10 text-muted-foreground mb-3" />
                <p className="font-medium">Select a list to view</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose a list from the sidebar or create a new one
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <CreateListDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(list) => {
          const summary: ListSummary = {
            id: list.id,
            name: list.name,
            status: list.status,
            createdAt: list.createdAt,
            updatedAt: list.updatedAt,
            totalItems: 0,
            uncheckedItems: 0,
          };
          addList(summary);
          setActiveList({ ...list, items: [] });
          setSelectedId(list.id);
        }}
      />
    </div>
  );
}

function GroceryListViewSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}

export function GroceryListPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </div>
  );
}
