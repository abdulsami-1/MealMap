import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { LandingNavbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero";
import { FeaturesSection } from "@/components/landing/features";
import { HowItWorksSection } from "@/components/landing/how-it-works";
import { AiHighlight } from "@/components/landing/ai-highlight";
import { TestimonialsSection } from "@/components/landing/testimonials";
import { FaqSection } from "@/components/landing/faq";
import { CtaBanner } from "@/components/landing/cta-banner";
import { LandingFooter } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "MealMap — Smart Meal Planning for Busy Professionals",
  description:
    "Plan meals, manage your pantry, generate recipes with AI, and simplify grocery shopping. The all-in-one meal planning app built for how you actually cook.",
};

export default async function LandingPage() {
  const session = await auth();
  const isAuthenticated = !!session?.user;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNavbar isAuthenticated={isAuthenticated} />
      <main>
        <HeroSection isAuthenticated={isAuthenticated} />
        <FeaturesSection />
        <HowItWorksSection />
        <AiHighlight isAuthenticated={isAuthenticated} />
        <TestimonialsSection />
        <FaqSection />
        <CtaBanner isAuthenticated={isAuthenticated} />
      </main>
      <LandingFooter />
    </div>
  );
}
