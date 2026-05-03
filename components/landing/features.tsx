"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  CalendarDays,
  Package,
  ShoppingCart,
  BookOpen,
  Sparkles,
  Users,
} from "lucide-react";

const FEATURES = [
  {
    icon: CalendarDays,
    title: "Visual Meal Planner",
    description:
      "Drag and drop meals across a weekly calendar. See your entire week at a glance and plan breakfast, lunch, and dinner with ease.",
    color: "bg-blue-500/10 text-blue-600",
    accent: "border-blue-200",
  },
  {
    icon: Package,
    title: "Smart Pantry Tracking",
    description:
      "Track what you have with expiry alerts, low-stock notifications, and category organization. Never let food go to waste again.",
    color: "bg-emerald-500/10 text-emerald-600",
    accent: "border-emerald-200",
  },
  {
    icon: ShoppingCart,
    title: "Auto Grocery Lists",
    description:
      "Grocery lists that build themselves from your meal plan. Check items off on your phone while shopping — even works offline.",
    color: "bg-orange-500/10 text-orange-600",
    accent: "border-orange-200",
  },
  {
    icon: BookOpen,
    title: "Recipe Library",
    description:
      "Build your personal recipe collection. Filter by cuisine, difficulty, and cooking time. Save favorites for quick access.",
    color: "bg-amber-500/10 text-amber-600",
    accent: "border-amber-200",
  },
  {
    icon: Sparkles,
    title: "AI Recipe Generator",
    description:
      "Tell Gemini AI what's in your pantry and get 3 practical recipes you can cook tonight. Smart suggestions, zero waste.",
    color: "bg-purple-500/10 text-purple-600",
    accent: "border-purple-200",
  },
  {
    icon: Users,
    title: "Household Sharing",
    description:
      "Share your meal plan, pantry, and grocery lists with your household. Everyone stays in sync, no more duplicate purchases.",
    color: "bg-pink-500/10 text-pink-600",
    accent: "border-pink-200",
  },
];

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof FEATURES)[0];
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className="group relative p-6 rounded-2xl border bg-background hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
    >
      <div className={`size-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
        <feature.icon className="size-6" />
      </div>
      <h3 className="font-semibold text-base mb-2">{feature.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
    </motion.div>
  );
}

export function FeaturesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
              Everything you need
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              One app for your entire kitchen
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Stop juggling spreadsheets, notes apps, and recipe websites. MealMap brings everything
              into one beautifully simple place.
            </p>
          </motion.div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
