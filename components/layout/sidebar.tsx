"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingCart,
  BookOpen,
  Sparkles,
  Package,
  Settings,
  ChefHat,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/meal-planner", icon: UtensilsCrossed, label: "Meal Planner" },
  { href: "/pantry", icon: Package, label: "Pantry" },
  { href: "/grocery-list", icon: ShoppingCart, label: "Grocery List" },
  { href: "/recipes", icon: BookOpen, label: "Recipes" },
  { href: "/ai-recipes", icon: Sparkles, label: "AI Recipes" },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <TooltipProvider>
      <aside className="hidden lg:flex flex-col w-16 xl:w-60 bg-sidebar-background border-r border-sidebar-border shrink-0 transition-all duration-300">
        <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
          <div className="flex items-center justify-center size-8 rounded-lg bg-sidebar-primary shrink-0">
            <ChefHat className="size-4 text-sidebar-primary-foreground" />
          </div>
          <span className="font-bold text-sidebar-foreground text-lg hidden xl:block">
            MealMap
          </span>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute left-0 w-0.5 h-6 bg-sidebar-primary rounded-r-full"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <item.icon
                      className={cn(
                        "size-5 shrink-0 transition-colors",
                        isActive
                          ? "text-sidebar-primary"
                          : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground"
                      )}
                    />
                    <span className="hidden xl:block truncate">{item.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="xl:hidden">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        <div className="px-2 py-4 border-t border-sidebar-border">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/settings"
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                  pathname === "/settings"
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <Settings className="size-5 shrink-0 text-sidebar-foreground/60 group-hover:text-sidebar-foreground" />
                <span className="hidden xl:block">Settings</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="xl:hidden">
              Settings
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
