'use client';

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

export default function PricingSection() {
  const pricingPlans = [
    {
      name: "Always Free",
      price: "$0",
      description: "Perfect for getting started",
      features: [
        "Create up to 3 communities",
        "Up to 1000 members",
        "Basic analytics",
        "Email support",
        "Community moderation",
        "Custom branding",
      ],
      cta: "Start Free",
      highlighted: false,
    },
    {
      name: "3% Fee",
      subtitle: "for Paying Member",
      price: "3%",
      description: "For serious creators",
      features: [
        "Unlimited communities",
        "Unlimited members",
        "Advanced analytics",
        "Priority support",
        "Revenue sharing",
        "Custom domains",
        "API access",
        "White-label options",
      ],
      cta: "Start Growing",
      highlighted: true,
    },
  ];

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Simple and transparent pricing
          </h2>
          <p className="text-lg text-gray-600">
            Choose the perfect plan for your creator program
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pricingPlans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative p-8 rounded-lg border-2 transition-all ${
                plan.highlighted
                  ? "border-orange-500 bg-gradient-to-br from-orange-50 to-white shadow-xl scale-105 md:scale-110"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                {plan.subtitle && (
                  <p className="text-sm text-gray-600">{plan.subtitle}</p>
                )}
                <p className="text-gray-600 text-sm mt-2">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-bold">{plan.price}</span>
                  {plan.price !== "$0" && <span className="text-gray-600">per paying member</span>}
                </div>
              </div>

              <Button
                asChild
                size="lg"
                className={`w-full mb-8 ${
                  plan.highlighted
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                }`}
              >
                <Link href="#signup">
                  {plan.cta}
                </Link>
              </Button>

              <div className="space-y-4">
                <p className="text-sm font-semibold text-gray-900 mb-4">What's included:</p>
                {plan.features.map((feature, featureIdx) => (
                  <div key={featureIdx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Have questions? <Link href="#" className="text-orange-500 hover:underline font-semibold">Contact our sales team</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
