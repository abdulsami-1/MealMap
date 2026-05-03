"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Printer,
  Trash2,
  CheckCircle2,
  RotateCcw,
  X,
} from "lucide-react";
import type { GroceryList, GroceryItem } from "@prisma/client";
import { useGroceryStore } from "@/stores/grocery-store";
import { cn } from "@/lib/utils";
import { GROCERY_CATEGORIES } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { AddItemDialog } from "./add-item-dialog";
import { toast } from "sonner";

type GroceryListFull = GroceryList & { items: GroceryItem[] };

interface GroceryListViewProps {
  list: GroceryListFull;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  produce: "🥦",
  dairy: "🧀",
  meat: "🥩",
  pantry: "🥫",
  frozen: "🧊",
  bakery: "🍞",
  beverages: "🥤",
  other: "🛒",
};

export function GroceryListView({
  list,
  onDelete,
  onStatusChange,
}: GroceryListViewProps) {
  const { toggleItem, deleteItem, activeList, setActiveList } = useGroceryStore();
  const [addItemOpen, setAddItemOpen] = useState(false);

  const items = activeList?.id === list.id ? activeList.items : list.items;

  const grouped = GROCERY_CATEGORIES.reduce(
    (acc, cat) => {
      const catItems = items.filter(
        (i) => (i.category?.toLowerCase() ?? "other") === cat.value
      );
      if (catItems.length > 0) acc[cat.value] = catItems;
      return acc;
    },
    {} as Record<string, GroceryItem[]>
  );

  // Items with no recognized category go to "other"
  const uncategorized = items.filter(
    (i) => !GROCERY_CATEGORIES.some((c) => c.value === i.category?.toLowerCase())
  );
  if (uncategorized.length > 0) {
    grouped["other"] = [...(grouped["other"] ?? []), ...uncategorized];
  }

  const checkedCount = items.filter((i) => i.isChecked).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  function handlePrint() {
    window.print();
  }

  async function handleAddItem(item: GroceryItem) {
    if (activeList?.id === list.id) {
      setActiveList({ ...activeList, items: [...activeList.items, item] });
    }
  }

  return (
    <Card className="print:shadow-none print:border-0">
      <CardHeader className="print:pb-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">{list.name}</CardTitle>
            <CardDescription>
              {checkedCount}/{totalCount} items checked
              {list.status === "COMPLETED" && (
                <Badge variant="success" className="ml-2 text-xs">
                  <CheckCircle2 className="size-3 mr-1" />
                  Completed
                </Badge>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="size-4 mr-1.5" />
              Print
            </Button>
            {list.status === "ACTIVE" && checkedCount === totalCount && totalCount > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                onClick={() => onStatusChange(list.id, "COMPLETED")}
              >
                <CheckCircle2 className="size-4 mr-1.5" />
                Mark Done
              </Button>
            )}
            {list.status === "COMPLETED" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusChange(list.id, "ACTIVE")}
              >
                <RotateCcw className="size-4 mr-1.5" />
                Reopen
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(list.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden print:hidden">
            <motion.div
              className="h-full bg-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {totalCount === 0 ? (
          <div className="flex flex-col items-center py-10 text-center print:hidden">
            <p className="text-sm text-muted-foreground">No items yet</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setAddItemOpen(true)}
            >
              <Plus className="size-4 mr-1.5" />
              Add first item
            </Button>
          </div>
        ) : (
          Object.entries(grouped).map(([category, catItems]) => {
            const catConfig = GROCERY_CATEGORIES.find((c) => c.value === category);
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">
                    {CATEGORY_ICONS[category] ?? "🛒"}
                  </span>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {catConfig?.label ?? "Other"}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    ({catItems.filter((i) => i.isChecked).length}/{catItems.length})
                  </span>
                </div>
                <div className="space-y-1">
                  <AnimatePresence mode="popLayout">
                    {catItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg group transition-colors",
                          item.isChecked
                            ? "bg-muted/40"
                            : "hover:bg-muted/50"
                        )}
                      >
                        <Checkbox
                          checked={item.isChecked}
                          onCheckedChange={(checked) =>
                            toggleItem(list.id, item.id, !!checked)
                          }
                          className="shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span
                            className={cn(
                              "text-sm",
                              item.isChecked &&
                                "line-through text-muted-foreground"
                            )}
                          >
                            {item.name}
                          </span>
                          {(item.quantity || item.unit || item.notes) && (
                            <p className="text-xs text-muted-foreground">
                              {item.quantity && `${item.quantity} ${item.unit ?? ""}`}
                              {item.notes && (item.quantity ? ` · ${item.notes}` : item.notes)}
                            </p>
                          )}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 print:hidden"
                          onClick={() => deleteItem(list.id, item.id)}
                        >
                          <X className="size-3" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })
        )}

        <Button
          variant="outline"
          size="sm"
          className="w-full print:hidden"
          onClick={() => setAddItemOpen(true)}
        >
          <Plus className="size-4 mr-1.5" />
          Add Item
        </Button>
      </CardContent>

      <AddItemDialog
        open={addItemOpen}
        onOpenChange={setAddItemOpen}
        listId={list.id}
        onAdded={handleAddItem}
      />
    </Card>
  );
}
