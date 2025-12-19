import Hero from "./components/hero";
import PricingSection from "./components/pricing-section";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Hero />
      <PricingSection />
    </div>
  );
}