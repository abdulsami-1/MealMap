import { prisma } from "@/lib/prisma";
import { created, unauthorized, serverError } from "@/lib/api-response";
import { getSessionHousehold } from "@/lib/auth-helpers";
import { startOfWeek, endOfWeek, format } from "date-fns";

export async function POST() {
  try {
    const ctx = await getSessionHousehold();
    if (!ctx) return unauthorized();

    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const [currentPlan, lowStockItems, expiringItems] = await Promise.all([
      prisma.mealPlan.findFirst({
        where: {
          householdId: ctx.householdId,
          weekStart: { gte: weekStart, lte: weekEnd },
        },
        include: { entries: { include: { meal: true } } },
      }),
      prisma.pantryItem.findMany({
        where: {
          householdId: ctx.householdId,
          lowStockAt: { not: null },
          quantity: { gt: 0 },
        },
      }),
      prisma.pantryItem.findMany({
        where: {
          householdId: ctx.householdId,
          expiryDate: {
            not: null,
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    const listName = `Week of ${format(weekStart, "MMM d")}`;

    const itemsToCreate: Array<{
      name: string;
      category: string;
      notes?: string;
      quantity?: number;
      unit?: string;
    }> = [];

    // Add restock items for low-stock pantry entries
    for (const item of lowStockItems) {
      if (item.lowStockAt !== null && item.quantity <= item.lowStockAt) {
        itemsToCreate.push({
          name: item.name,
          category: item.category ?? "pantry",
          notes: `Low stock — have ${item.quantity} ${item.unit ?? ""}`.trim(),
          unit: item.unit ?? undefined,
        });
      }
    }

    // Add expiring items (user should use or replace)
    for (const item of expiringItems) {
      const alreadyAdded = itemsToCreate.some(
        (i) => i.name.toLowerCase() === item.name.toLowerCase()
      );
      if (!alreadyAdded) {
        itemsToCreate.push({
          name: item.name,
          category: item.category ?? "pantry",
          notes: `Expiring soon — check before buying`,
        });
      }
    }

    // Add meal-based items
    if (currentPlan) {
      const mealNames = currentPlan.entries.map((e) => e.meal.name);
      const unique = [...new Set(mealNames)];
      for (const mealName of unique) {
        itemsToCreate.push({
          name: `Ingredients for: ${mealName}`,
          category: "other",
          notes: "Add specific ingredients",
        });
      }
    }

    // Deduplicate by name (case-insensitive)
    const seen = new Set<string>();
    const deduped = itemsToCreate.filter((item) => {
      const key = item.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const list = await prisma.groceryList.create({
      data: {
        name: listName,
        householdId: ctx.householdId,
        items: {
          create: deduped,
        },
      },
      include: { items: true },
    });

    return created(list);
  } catch {
    return serverError();
  }
}
