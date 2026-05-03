"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CalendarDays, ShoppingCart, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeroSectionProps {
  isAuthenticated: boolean;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MEAL_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-orange-100 text-orange-700",
];
const MEALS = ["Oatmeal", "Grain Bowl", "Pasta"];

function ProductMockup() {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-full" />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-2xl border bg-background shadow-2xl overflow-hidden ring-1 ring-border/50"
      >
        {/* Browser chrome */}
        <div className="h-9 bg-muted border-b flex items-center gap-1.5 px-3 shrink-0">
          <div className="size-3 rounded-full bg-red-400" />
          <div className="size-3 rounded-full bg-amber-400" />
          <div className="size-3 rounded-full bg-emerald-400" />
          <div className="ml-3 flex-1 h-5 bg-background rounded-md text-[11px] flex items-center px-2 text-muted-foreground border">
            mealmap.app/dashboard
          </div>
        </div>

        {/* App layout */}
        <div className="flex h-72 sm:h-80">
          {/* Sidebar */}
          <div className="w-36 sm:w-44 bg-gray-900 p-2.5 space-y-0.5 shrink-0">
            <div className="px-2 py-1.5 mb-3 flex items-center gap-1.5">
              <div className="size-5 rounded bg-primary flex items-center justify-center">
                <span className="text-[9px] text-white font-bold">M</span>
              </div>
              <span className="text-white text-xs font-semibold">MealMap</span>
            </div>
            {[
              { label: "Dashboard", active: false },
              { label: "Meal Planner", active: true },
              { label: "Grocery List", active: false },
              { label: "Pantry", active: false },
              { label: "Recipes", active: false },
              { label: "AI Recipes", active: false },
            ].map(({ label, active }) => (
              <div
                key={label}
                className={`px-2 py-1.5 rounded text-[11px] transition-colors ${
                  active ? "bg-primary/80 text-white" : "text-gray-400 hover:text-gray-300"
                }`}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 p-3 bg-gray-50 overflow-hidden">
            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { icon: CalendarDays, label: "This Week", value: "5 meals", color: "text-blue-600", bg: "bg-blue-50" },
                { icon: Package, label: "Pantry Items", value: "23 items", color: "text-emerald-600", bg: "bg-emerald-50" },
                { icon: ShoppingCart, label: "Shopping", value: "8 items", color: "text-orange-600", bg: "bg-orange-50" },
              ].map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className="bg-white rounded-lg p-2 border shadow-sm">
                  <div className={`size-5 rounded ${bg} flex items-center justify-center mb-1`}>
                    <Icon className={`size-3 ${color}`} />
                  </div>
                  <div className="text-[9px] text-gray-400 leading-tight">{label}</div>
                  <div className="text-xs font-bold mt-0.5">{value}</div>
                </div>
              ))}
            </div>

            {/* Week planner grid */}
            <div className="bg-white rounded-lg border shadow-sm p-2">
              <div className="text-[10px] font-semibold text-gray-500 mb-2">Week of Jan 20</div>
              <div className="grid grid-cols-7 gap-1">
                {DAYS.map((day, i) => (
                  <div key={day} className="text-center">
                    <div className="text-[9px] text-gray-400 mb-1">{day}</div>
                    <div className="space-y-0.5">
                      {MEAL_COLORS.map((cls, j) => (
                        <div key={j} className={`rounded text-[8px] px-0.5 py-0.5 truncate ${cls} ${i > 4 ? "opacity-40" : ""}`}>
                          {i === 0 ? MEALS[j] : "·"}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function HeroSection({ isAuthenticated }: HeroSectionProps) {
  const ctaHref = isAuthenticated ? "/dashboard" : "/register";

  return (
    <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm gap-1.5">
              <Sparkles className="size-3.5 text-purple-500" />
              Now with Gemini AI recipe generation
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1]"
          >
            Meal planning that{" "}
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              actually works
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            Plan meals, manage your pantry, generate AI-powered recipes, and auto-build grocery lists.
            Built for busy professionals who want to eat well without the stress.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button size="lg" asChild className="h-12 px-8 text-base">
              <Link href={ctaHref}>
                Get Started Free
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base">
              <a href="#how-it-works">See how it works</a>
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="text-xs text-muted-foreground mt-4"
          >
            Free forever · No credit card required · Setup in 2 minutes
          </motion.p>
        </div>

        <ProductMockup />

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center"
        >
          {[
            { value: "10k+", label: "Meals planned" },
            { value: "500+", label: "AI recipes generated" },
            { value: "2 min", label: "Setup time" },
            { value: "4.9★", label: "User rating" },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-2xl sm:text-3xl font-bold">{value}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
