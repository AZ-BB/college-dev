'use client';

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { HeroCollage } from "./hero-college";
import CreateCommunity from "./create-community";

export default function Hero() {
  return (
    <section className="relative py-10 md:py-14 lg:py-20 pb-0">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
            Open to opportunities · Limited time offer · 50%
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            The Better Place To Run Creator Programs
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Host your free or paid communities, courses, conversations and payments all in one place.<br /> <span>No ads, no algorithms, no monthly fees. You fully own and control everything.</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8"
              asChild
            >
              <Link href="/signup">
                Create your community
              </Link>
            </Button>
            <Button

              size="lg"
              className="px-8 text-gray-900 bg-gray-200 hover:bg-gray-100 hover:text-gray-900"
              asChild
            >
              <Link href="#explore">
                Explore Communities
              </Link>
            </Button>
          </div>
        </div>

        {/* Featured Section */}
        <div className="mt-16 md:mt-24">
          <HeroCollage />
        </div>

        {/*Create Community*/}
        <div className="mt-16 md:mt-24">
          <CreateCommunity/>
        </div>
      </div>
    </section>
  );
}
