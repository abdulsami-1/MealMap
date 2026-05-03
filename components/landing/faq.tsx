"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const FAQS = [
  {
    q: "Is MealMap really free?",
    a: "Yes — the core meal planning, pantry tracking, recipe library, grocery lists, and AI recipe generator are all available on the free plan. No credit card required.",
  },
  {
    q: "How does the AI recipe generator work?",
    a: "You enter the ingredients you have available, and Google Gemini AI suggests 3 practical recipes you can cook with them. Suggestions are optimized for weeknight cooking — under 60 minutes, no exotic ingredients.",
  },
  {
    q: "Can I share my meal plan with my family or roommates?",
    a: "Yes. When you create an account you also create a Household. You can invite others to join your household — they'll see the same meal plan, pantry, and grocery lists in real time.",
  },
  {
    q: "Does it work on mobile?",
    a: "MealMap is fully responsive and works great on any screen size. A dedicated mobile app is on the roadmap.",
  },
  {
    q: "Can I import my existing recipes?",
    a: "You can manually add recipes to your library with as much or as little detail as you like — name, ingredients, instructions, cuisine, difficulty, and tags. Bulk import is coming in a future update.",
  },
  {
    q: "What happens to my data if I stop using MealMap?",
    a: "Your data is yours. You can export your recipes and grocery lists at any time. We don't sell your data to third parties.",
  },
  {
    q: "How many AI recipe requests can I make?",
    a: "You get 10 AI recipe generations per day — more than enough for everyday cooking. The limit resets every 24 hours.",
  },
];

function FaqItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left gap-4 hover:text-primary transition-colors"
      >
        <span className="font-medium text-sm sm:text-base">{q}</span>
        <span className="shrink-0 size-6 rounded-full border flex items-center justify-center">
          {isOpen ? <Minus className="size-3.5" /> : <Plus className="size-3.5" />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm text-muted-foreground leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="faq" className="py-20 sm:py-28 bg-muted/40 border-t">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
              Got questions?
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Frequently asked questions
            </h2>
            <p className="text-muted-foreground">
              Can&apos;t find what you&apos;re looking for?{" "}
              <a href="mailto:support@mealmap.app" className="text-primary hover:underline">
                Contact support
              </a>
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-background rounded-2xl border divide-y px-6"
        >
          {FAQS.map((item, i) => (
            <FaqItem
              key={item.q}
              q={item.q}
              a={item.a}
              isOpen={open === i}
              onToggle={() => setOpen(open === i ? null : i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
