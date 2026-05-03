"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { UserPlus, ShoppingBag, CalendarCheck, Sparkles } from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create your household",
    description:
      "Sign up in 30 seconds, create your household, and invite family or roommates to share the same meal plan and grocery list.",
    color: "bg-blue-500",
  },
  {
    number: "02",
    icon: CalendarCheck,
    title: "Plan your week",
    description:
      "Drag meals into your weekly calendar. Browse your recipe library or use the AI generator to fill slots with personalized suggestions.",
    color: "bg-emerald-500",
  },
  {
    number: "03",
    icon: ShoppingBag,
    title: "Shop smarter",
    description:
      "Your grocery list builds automatically from your meal plan. Check items off at the store — the app syncs in real time for everyone.",
    color: "bg-orange-500",
  },
  {
    number: "04",
    icon: Sparkles,
    title: "Let AI do the rest",
    description:
      "Tell the AI what's in your pantry. Get 3 practical recipes you can cook tonight — no exotic ingredients, no complicated techniques.",
    color: "bg-purple-500",
  },
];

type Step = (typeof STEPS)[number];

function StepCard({ step, index }: { step: Step; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative text-center"
    >
      <div className="flex justify-center mb-5">
        <div className={`relative size-16 rounded-2xl ${step.color} flex items-center justify-center shadow-lg`}>
          <step.icon className="size-7 text-white" />
          <div className="absolute -top-2 -right-2 size-6 rounded-full bg-background border-2 border-border flex items-center justify-center">
            <span className="text-[10px] font-bold">{index + 1}</span>
          </div>
        </div>
      </div>
      <h3 className="font-semibold text-base mb-2">{step.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
    </motion.div>
  );
}

export function HowItWorksSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="how-it-works"
      className="py-20 sm:py-28 bg-muted/40 border-y"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
              Simple by design
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Up and running in minutes
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              No complicated onboarding. No learning curve. Just a better way to plan meals starting today.
            </p>
          </motion.div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-border" />

          {STEPS.map((step, i) => (
            <StepCard key={step.number} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
