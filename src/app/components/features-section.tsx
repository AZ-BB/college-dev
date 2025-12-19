'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function FeaturesSection() {


  return (
    <section className="py-4 md:py-6 lg:py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            This is where it all comes together.
          </h2>
          <p className="text-lg text-gray-600">
            One platform. Zero chaos.
          </p>
          <Button
            size="lg"
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 mt-5"
            asChild
          >
            <Link href="/signup">
              Create your community
            </Link>
          </Button>
        </div>




      </div>
    </section>
  );
}
