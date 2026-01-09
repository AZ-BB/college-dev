'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Image from "next/image";
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
        <div className="text-center mb-12 flex flex-col items-center justify-center">
          <Badge className="mb-4 text-base bg-[#FEF0E7] text-[#F7670E]">
            Launch
          </Badge>

          <div className="relative inline-block">
            <h2 className="text-4xl sm:text-5xl text-neutral-900 mb-4 font-generalSans font-bold">
              Simple and transparent pricing
            </h2>

          </div>

          <p className="text-lg text-neutral-700 mb-8 font-bold">
            Start free. Pay 2% only while you grow. Switch to ₹2,999/month once you scale - no fees after that.
          </p>
        </div>

        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">

              {/* ===== FREE COMMUNITY ===== */}
              <div className="rounded-2xl border border-grey-200 p-8">
                <p className="text-orange-500 font-semibold mb-2">
                  Free Community
                </p>

                <h3 className="text-3xl font-bold mb-6">
                  Always Free
                </h3>

                <Link
                  href="#"
                  className="block w-full rounded-xl bg-grey-100 py-3 text-center font-semibold text-grey-900 hover:bg-grey-200 transition mb-8"
                >
                  Create Free Community
                </Link>

                <ul className="space-y-4 text-grey-700">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-grey-900" />
                    Create up to 10 free communities
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-grey-900" />
                    All Features
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-grey-900" />
                    Unlimited courses
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-grey-900" />
                    Unlimited members
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-grey-900" />
                    Custom URL
                  </li>
                </ul>
              </div>

              {/* ===== PAID COMMUNITY ===== */}
              <div className="rounded-2xl border border-grey-200 p-8">
                <p className="text-orange-500 font-semibold mb-2">
                  Paid Community
                </p>

                <h3 className="text-3xl font-bold mb-2">
                  3% Fee <span className="text-lg font-medium text-grey-600">Per Paying Member</span>
                </h3>

                <Link
                  href="#"
                  className="block w-full rounded-xl bg-orange-500 py-3 text-center font-semibold text-white hover:bg-orange-600 transition mb-8"
                >
                  Start For Free
                </Link>

                <ul className="space-y-4 text-grey-700">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-grey-900" />
                    Create up to 10 paid communities
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-grey-900" />
                    All Features
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-grey-900" />
                    Unlimited Courses
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-grey-900" />
                    Unlimited members
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-grey-900" />
                    3% platform fee + payment gateway charges
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-grey-900" />
                    Custom URL
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </section>

        <div className="flex flex-col items-center justify-center">
          <p className="text-neutral-700 font-bold text-base">
            We earn, only when you earn. We grow, only when you grow.
          </p>
          <Image
            src="/Vector 155.svg"
            alt="vector"
            width={1}
            height={1}
            className="mx-auto w-100 h-10"
          />
        </div>
      </div>
    </section>
  );
}
