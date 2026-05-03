"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    quote:
      "I used to spend 30 minutes every Sunday stressed about meals. Now I just open MealMap, drag a few recipes into the week, and my grocery list is ready. Absolute game changer.",
    name: "Sarah K.",
    role: "Product Manager, working mom of two",
    initials: "SK",
    rating: 5,
    color: "bg-blue-500",
  },
  {
    quote:
      "The AI recipe feature is my favourite thing. I dump whatever's in my fridge and it gives me three genuinely good recipes I can actually make tonight. No weird ingredients, no 47-step process.",
    name: "Marcus T.",
    role: "Software Engineer, cooking enthusiast",
    initials: "MT",
    rating: 5,
    color: "bg-emerald-500",
  },
  {
    quote:
      "My flatmates and I share the grocery list and it's completely changed our dynamic. No more 'did you get milk?' texts. Everything is updated in real time.",
    name: "Priya R.",
    role: "Graduate student, shared house of 4",
    initials: "PR",
    rating: 5,
    color: "bg-purple-500",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

type Testimonial = (typeof TESTIMONIALS)[number];

function TestimonialCard({ testimonial: t, index: i }: { testimonial: Testimonial; index: number }) {
  const cardRef = useRef(null);
  const cardInView = useInView(cardRef, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 24 }}
      animate={cardInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: i * 0.1 }}
      className="bg-background rounded-2xl border p-6 flex flex-col"
    >
      <Stars count={t.rating} />
      <blockquote className="mt-4 text-sm leading-relaxed text-foreground flex-1">
        &ldquo;{t.quote}&rdquo;
      </blockquote>
      <div className="mt-6 flex items-center gap-3">
        <div className={`size-10 rounded-full ${t.color} flex items-center justify-center shrink-0`}>
          <span className="text-xs font-bold text-white">{t.initials}</span>
        </div>
        <div>
          <p className="text-sm font-semibold">{t.name}</p>
          <p className="text-xs text-muted-foreground">{t.role}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function TestimonialsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-20 sm:py-28 bg-muted/40 border-y">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
              Real users, real kitchens
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              People love MealMap
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Join thousands of households who have simplified their weekly cooking routine.
            </p>
          </motion.div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={t.name} testimonial={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
