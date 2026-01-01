'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function FeaturesSection() {


  return (
    <section className="py-4 md:py-6 lg:py-8 mt-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-6xl font-generalSans font-bold mb-4">
            This is where it all <br /> comes together.
          </h2>
          <p className="text-lg text-gray-700">
            Your community, finally organized.
          </p>
          <Button
            className="px-5 mt-5 py-7"
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
