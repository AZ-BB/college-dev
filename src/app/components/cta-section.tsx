import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="relative mx-auto max-w-4xl text-center">

          {/* Heading */}
          <h2 className="relative inline-block text-4xl font-bold leading-tight md:text-5xl">
            Ready to build your <br /> community?

            {/* Orange SVG decoration */}
            <Image
              src="/Group 26086451.svg" // ← your orange SVG
              alt=""
              width={80}
              height={80}
              className="absolute -right-14  -top-6 hidden md:block"
            />
          </h2>

          {/* Subtext */}
          <p className="mt-6 text-lg text-grey-600">
            Join hundreds of creators making the switch to The College
          </p>

          {/* CTA Button */}
          <Button
            className="mt-4 px-4 py-7"
            variant="default"
          >
            <Link href="/signup">
              Create your community
            </Link>
          </Button>
        </div>
      </div>

      {/* Optional subtle background shape (very light) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-orange-100 opacity-30 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-64 w-64 rounded-full bg-orange-100 opacity-20 blur-3xl" />
      </div>
    </section>
  );
}
