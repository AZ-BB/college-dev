import Hero from "./components/hero";
import FeaturesSection from "./components/features-section";
import UseCasesSection from "./components/use-cases-section";
import PlatformFeaturesSection from "./components/platform-features-section";
import PricingSection from "./components/pricing-section";
import CTASection from "./components/cta-section";
import AllInOneSection from "./components/all-in-one";
import CommunitiesSection from "./components/communities-section";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Hero />
      <FeaturesSection />
      <CommunitiesSection />
      <UseCasesSection />
      <AllInOneSection />
      <PricingSection />
      <CTASection />
    </div>
  );
}