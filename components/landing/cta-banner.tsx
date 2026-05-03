"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CtaBannerProps {
  isAuthenticated: boolean;
}

export function CtaBanner({ isAuthenticated }: CtaBannerProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const ctaHref = isAuthenticated ? "/dashboard" : "/register";
  const ctaLabel = isAuthenticated ? "Go to Dashboard" : "Get Started Free — It's Free";

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl bg-primary overflow-hidden text-center px-8 py-20"
        >
          {/* Background decorations */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -left-20 size-64 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 size-64 rounded-full bg-white/5 blur-3xl" />
          </div>

          <div className="relative">
            <div className="size-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6">
              <UtensilsCrossed className="size-8 text-white" />
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
              Stop stressing about dinner
            </h2>
            <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto mb-8">
              Join MealMap today and turn meal planning from a chore into a 5-minute weekly habit.
              Free to start, no credit card needed.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="bg-white text-primary hover:bg-white/90 h-12 px-8 text-base font-semibold"
              >
                <Link href={ctaHref}>
                  {ctaLabel}
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>

            <p className="text-primary-foreground/60 text-sm mt-5">
              Free forever · No credit card · Setup in 2 minutes
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
