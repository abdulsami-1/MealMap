"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Package,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { PantryItem } from "@prisma/client";
import { usePantryStore } from "@/stores/pantry-store";
import { cn, getDaysUntilExpiry, getExpiryStatus, formatDate } from "@/lib/utils";
import { PANTRY_CATEGORIES } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PantryItemDialog } from "./pantry-item-dialog";

interface PantryPageProps {
  initialItems: PantryItem[];
}

function ExpiryIndicator({ item }: { item: PantryItem }) {
  if (!item.expiryDate) return null;
  const status = getExpiryStatus(item.expiryDate);
  const days = getDaysUntilExpiry(item.expiryDate);

  return (
    <Badge
      variant={
        status === "expired"
          ? "destructive"
          : status === "soon"
            ? "warning"
            : "success"
      }
      className="text-xs"
    >
      {status === "expired"
        ? "Expired"
        : days === 0
          ? "Expires today"
          : `${days}d`}
    </Badge>
  );
}

function LowStockBadge({ item }: { item: PantryItem }) {
  if (!item.lowStockAt || item.quantity > item.lowStockAt) return null;
  return (
    <Badge variant="warning" className="text-xs gap-1">
      <AlertTriangle className="size-2.5" />
      Low stock
    </Badge>
  );
}

const fadeItem = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95 },
};

export function PantryPage({ initialItems }: PantryPageProps) {
  const {
    items,
    setItems,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    deleteItem,
  } = usePantryStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<PantryItem | null>(null);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems, setItems]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesCategory = !categoryFilter || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, categoryFilter]);

  const expiringSoon = items.filter(
    (i) => i.expiryDate && getDaysUntilExpiry(i.expiryDate) <= 3
  ).length;

  const lowStock = items.filter(
    (i) => i.lowStockAt !== null && i.quantity <= i.lowStockAt
  ).length;

  function openAdd() {
    setEditItem(null);
    setDialogOpen(true);
  }

  function openEdit(item: PantryItem) {
    setEditItem(item);
    setDialogOpen(true);
  }

  async function handleDelete(item: PantryItem) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    await deleteItem(item.id);
    toast.success(`"${item.name}" removed from pantry`);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pantry Tracker</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {items.length} item{items.length !== 1 ? "s" : ""} tracked
            {expiringSoon > 0 && (
              <span className="text-orange-600 font-medium">
                {" "}· {expiringSoon} expiring soon
              </span>
            )}
            {lowStock > 0 && (
              <span className="text-amber-600 font-medium">
                {" "}· {lowStock} low stock
              </span>
            )}
          </p>
        </div>
        <Button onClick={openAdd} className="shrink-0">
          <Plus className="size-4 mr-1.5" />
          Add Item
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search pantry..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={categoryFilter === "" ? "default" : "outline"}
            size="sm"
            onClick={() => setCategoryFilter("")}
          >
            All
          </Button>
          {PANTRY_CATEGORIES.slice(0, 5).map((cat) => (
            <Button
              key={cat}
              variant={categoryFilter === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter(categoryFilter === cat ? "" : cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Items grid */}
      {filtered.length === 0 ? (
        <EmptyState
          hasSearch={!!search || !!categoryFilter}
          onClear={() => { setSearch(""); setCategoryFilter(""); }}
          onAdd={openAdd}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <motion.div key={item.id} {...fadeItem} layout>
                <Card className="group relative py-4 hover:shadow-md transition-shadow">
                  <CardContent className="px-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm leading-tight truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.quantity} {item.unit}
                          {item.category && ` · ${item.category}`}
                        </p>
                        {item.expiryDate && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Expires {formatDate(item.expiryDate)}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7"
                          onClick={() => openEdit(item)}
                        >
                          <Pencil className="size-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(item)}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-1.5 mt-2.5 flex-wrap">
                      <ExpiryIndicator item={item} />
                      <LowStockBadge item={item} />
                    </div>

                    {/* Expiry color strip */}
                    {item.expiryDate && (
                      <div
                        className={cn(
                          "absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl",
                          getExpiryStatus(item.expiryDate) === "expired"
                            ? "bg-destructive"
                            : getExpiryStatus(item.expiryDate) === "soon"
                              ? "bg-orange-400"
                              : "bg-emerald-400"
                        )}
                      />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <PantryItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editItem={editItem}
      />
    </div>
  );
}

function EmptyState({
  hasSearch,
  onClear,
  onAdd,
}: {
  hasSearch: boolean;
  onClear: () => void;
  onAdd: () => void;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-4 rounded-full bg-muted mb-4">
          <Package className="size-8 text-muted-foreground" />
        </div>
        {hasSearch ? (
          <>
            <p className="font-medium">No items match your search</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try different keywords or clear filters
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={onClear}>
              <X className="size-4 mr-1.5" />
              Clear filters
            </Button>
          </>
        ) : (
          <>
            <p className="font-medium">Your pantry is empty</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start tracking ingredients to reduce food waste
            </p>
            <Button size="sm" className="mt-4" onClick={onAdd}>
              <Plus className="size-4 mr-1.5" />
              Add first item
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function PantryPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-16" />
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
