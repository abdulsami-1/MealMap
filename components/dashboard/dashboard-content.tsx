"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  AlertTriangle,
  Calendar,
  ChefHat,
  Package,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  UtensilsCrossed,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, getDaysUntilExpiry, getExpiryStatus, formatDate } from "@/lib/utils";
import type { Household, PantryItem, MealPlan, MealPlanEntry, Meal, GroceryList } from "@prisma/client";

interface DashboardContentProps {
  user: { name?: string | null };
  household: Household;
  pantryAlerts: PantryItem[];
  activePlan: (MealPlan & { entries: (MealPlanEntry & { meal: Meal })[] }) | null;
  activeGroceryList: (GroceryList & { _count: { items: number } }) | null;
}

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function ExpiryBadge({ expiryDate }: { expiryDate: Date | null }) {
  if (!expiryDate) return null;
  const status = getExpiryStatus(expiryDate);
  const days = getDaysUntilExpiry(expiryDate);

  if (status === "expired") {
    return <Badge variant="destructive">Expired</Badge>;
  }
  if (status === "soon") {
    return (
      <Badge variant="warning">
        {days === 0 ? "Today" : `${days}d left`}
      </Badge>
    );
  }
  return (
    <Badge variant="success">
      {days}d left
    </Badge>
  );
}

export function DashboardContent({
  user,
  household,
  pantryAlerts,
  activePlan,
  activeGroceryList,
}: DashboardContentProps) {
  const firstName = user.name?.split(" ")[0] ?? "there";
  const expiringCount = pantryAlerts.filter(
    (item) => item.expiryDate && getDaysUntilExpiry(item.expiryDate) <= 3
  ).length;
  const mealsPlanned = activePlan?.entries.length ?? 0;
  const groceryItems = activeGroceryList?._count.items ?? 0;

  const quickActions = [
    {
      label: "Plan Meals",
      href: "/meal-planner",
      icon: UtensilsCrossed,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      label: "Add to Pantry",
      href: "/pantry",
      icon: Package,
      color: "bg-emerald-500/10 text-emerald-600",
    },
    {
      label: "Grocery List",
      href: "/grocery-list",
      icon: ShoppingCart,
      color: "bg-orange-500/10 text-orange-600",
    },
    {
      label: "AI Recipes",
      href: "/ai-recipes",
      icon: Sparkles,
      color: "bg-purple-500/10 text-purple-600",
    },
  ];

  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold tracking-tight">
          Good{" "}
          {new Date().getHours() < 12
            ? "morning"
            : new Date().getHours() < 17
              ? "afternoon"
              : "evening"}
          , {firstName} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          {household.name} · Here&apos;s your meal planning overview
        </p>
      </motion.div>

      {/* Stats row */}
      <motion.div
        variants={fadeUp}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          icon={Calendar}
          label="Meals Planned"
          value={mealsPlanned.toString()}
          sub="this week"
          color="text-blue-600"
          bg="bg-blue-500/10"
        />
        <StatCard
          icon={Package}
          label="Expiring Soon"
          value={expiringCount.toString()}
          sub="pantry items"
          color={expiringCount > 0 ? "text-orange-600" : "text-emerald-600"}
          bg={expiringCount > 0 ? "bg-orange-500/10" : "bg-emerald-500/10"}
        />
        <StatCard
          icon={ShoppingCart}
          label="Grocery Items"
          value={groceryItems.toString()}
          sub="in active list"
          color="text-violet-600"
          bg="bg-violet-500/10"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Pantry"
          value={pantryAlerts.length.toString()}
          sub="tracked items"
          color="text-slate-600"
          bg="bg-slate-500/10"
        />
      </motion.div>

      {/* Expiry alerts */}
      {expiringCount > 0 && (
        <motion.div variants={fadeUp}>
          <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-900/50 dark:bg-orange-900/10">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-orange-600" />
                <CardTitle className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                  Expiry Alerts
                </CardTitle>
              </div>
              <CardDescription>
                {expiringCount} item{expiringCount > 1 ? "s" : ""} expiring within 3 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pantryAlerts
                  .filter(
                    (item) =>
                      item.expiryDate && getDaysUntilExpiry(item.expiryDate) <= 3
                  )
                  .slice(0, 5)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-1.5 border-b border-orange-100 dark:border-orange-900/30 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} {item.unit}
                          {item.expiryDate && (
                            <> · {formatDate(item.expiryDate)}</>
                          )}
                        </p>
                      </div>
                      <ExpiryBadge expiryDate={item.expiryDate} />
                    </div>
                  ))}
              </div>
              <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
                <Link href="/pantry">View Pantry</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick actions */}
      <motion.div variants={fadeUp}>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex flex-col items-center gap-3 p-4 rounded-xl border bg-card hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className={cn("p-2.5 rounded-lg", action.color)}>
                  <action.icon className="size-5" />
                </div>
                <span className="text-sm font-medium text-center">
                  {action.label}
                </span>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* This week's meals */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">This Week&apos;s Meals</CardTitle>
              <CardDescription>
                {mealsPlanned > 0
                  ? `${mealsPlanned} meal${mealsPlanned > 1 ? "s" : ""} planned`
                  : "No meals planned yet"}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/meal-planner">
                <Calendar className="size-4 mr-1" />
                Plan Meals
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {mealsPlanned === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="p-3 rounded-full bg-muted mb-3">
                  <ChefHat className="size-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">No meals planned this week</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Start planning to reduce food waste and decision fatigue
                </p>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link href="/meal-planner">Plan Your Week</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {activePlan?.entries.slice(0, 5).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 py-2 border-b last:border-0"
                  >
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {entry.mealType.charAt(0) + entry.mealType.slice(1).toLowerCase()}
                    </Badge>
                    <span className="text-sm">{entry.meal.name}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  bg,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  color: string;
  bg: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className={cn("p-2 rounded-lg shrink-0", bg)}>
            <Icon className={cn("size-4", color)} />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold leading-none">{value}</p>
            <p className="text-xs text-muted-foreground mt-1 truncate">{label}</p>
            <p className="text-xs text-muted-foreground/60 truncate">{sub}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
