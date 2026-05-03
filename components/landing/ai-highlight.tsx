"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Sparkles, ArrowRight, Zap, ChefHat, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AiHighlightProps {
  isAuthenticated: boolean;
}

const AI_FEATURES = [
  {
    icon: Zap,
    title: "Instant suggestions",
    description: "Get 3 complete recipes in under 10 seconds based on what you already have.",
  },
  {
    icon: ChefHat,
    title: "Practical recipes only",
    description: "No exotic ingredients. No restaurant techniques. Real food for real kitchens.",
  },
  {
    icon: Clock,
    title: "Under 60 minutes",
    description: "Every AI suggestion is optimized for weeknight cooking — quick, delicious, doable.",
  },
];

function AIRecipePreview() {
  return (
    <div className="space-y-3">
      {[
        { name: "Garlic Chicken Fried Rice", time: "25 min", diff: "Easy" },
        { name: "One-Pan Herb Chicken & Rice", time: "35 min", diff: "Easy" },
        { name: "Creamy Garlic Parmesan Rice", time: "30 min", diff: "Medium" },
      ].map((recipe, i) => (
        <motion.div
          key={recipe.name}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 + i * 0.15, duration: 0.4 }}
          className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20"
        >
          <div className="size-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <ChefHat className="size-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{recipe.name}</p>
            <p className="text-xs text-purple-200">{recipe.time} · {recipe.diff}</p>
          </div>
          <div className="shrink-0 size-6 rounded-full bg-white/20 flex items-center justify-center">
            <ArrowRight className="size-3 text-white" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function AiHighlight({ isAuthenticated }: AiHighlightProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const ctaHref = isAuthenticated ? "/ai-recipes" : "/register";

  return (
    <section id="ai" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Left: text */}
            <div className="p-10 lg:p-16 flex flex-col justify-center">
              <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center gap-2 bg-white/10 text-purple-100 rounded-full px-3 py-1 text-sm mb-6">
                  <Sparkles className="size-3.5" />
                  Powered by Google Gemini
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                  Turn your pantry into dinner — in seconds
                </h2>
                <p className="text-purple-100 text-lg mb-8 leading-relaxed">
                  Just tell MealMap what ingredients you have. Gemini AI suggests 3 practical recipes
                  you can cook tonight. No waste, no stress, no &ldquo;what&apos;s for dinner&rdquo; paralysis.
                </p>

                <div className="space-y-4 mb-8">
                  {AI_FEATURES.map((feat) => (
                    <div key={feat.title} className="flex gap-3">
                      <div className="size-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                        <feat.icon className="size-4 text-purple-200" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{feat.title}</p>
                        <p className="text-sm text-purple-200 mt-0.5">{feat.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button asChild size="lg" className="bg-white text-purple-700 hover:bg-purple-50 h-12 px-8">
                  <Link href={ctaHref}>
                    Try AI Recipes Free
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </motion.div>
            </div>

            {/* Right: AI recipe preview */}
            <div className="p-10 lg:p-16 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 mb-4">
                  <p className="text-xs text-purple-200 mb-1 font-medium">Your ingredients</p>
                  <div className="flex flex-wrap gap-2">
                    {["🍗 chicken", "🧄 garlic", "🍚 rice", "+ 2 more"].map((tag) => (
                      <span key={tag} className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-purple-200 mb-3 font-medium">
                  <Sparkles className="inline size-3 mr-1" />
                  Gemini suggested 3 recipes
                </p>
                <AIRecipePreview />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
