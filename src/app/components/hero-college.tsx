"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function HeroCollage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    let rafId: number;
    let currentProgress = -1; // Force initial update

    const handleScroll = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        let progress = 0;
        // Calculate scroll progress based on how much of the sticky section has been scrolled
        if (rect.top <= 0 && rect.bottom >= windowHeight) {
          const scrolled = Math.abs(rect.top);
          const totalScroll = rect.height - windowHeight;
          progress = Math.max(0, Math.min(1, scrolled / totalScroll));
        } else if (rect.top > 0) {
          progress = 0;
        } else {
          progress = 1;
        }

        // Only update if progress changed significantly
        if (Math.abs(progress - currentProgress) > 0.0001) {
          currentProgress = progress;
          containerRef.current.style.setProperty('--scroll-progress', progress.toString());
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`relative ${!isMobile ? "h-[180vh]" : "h-[170vh]"}`}
      style={{ "--scroll-progress": "0" } as React.CSSProperties}
    >

      {/* ===== MOBILE (2x2 GRID – STRAIGHT) ===== */}
      <div className="md:hidden">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
            Open to opportunities · Limited time offer · 50%
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl tracking-tighter mb-6"
            style={{
              fontFamily: "General Sans",
              fontWeight: 700,
              fontSize: "64px",
              lineHeight: "64px",
              letterSpacing: "-2%",
              textAlign: "center",
            }}
          >
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
      </div>

      <div className="sticky top-40 pt-10 md:hidden">
        <div className="relative">
          <div
            className="absolute will-change-transform"
            style={{
              opacity: "calc(1 - var(--scroll-progress))",
              transform: "translate3d(calc(-50% + 50% * var(--scroll-progress)), calc(400px - 300px * var(--scroll-progress)), 0) rotate(calc(var(--scroll-progress) * 5.5deg))",
            } as React.CSSProperties}
          >
            <Image
              src="/hero/twitter.png"
              alt="X post"
              width={900}
              height={500}
              className="h-auto w-[450px] rounded-2xl"
              priority
            />
          </div>

          <div
            className="absolute will-change-transform"
            style={{
              opacity: "calc(1 - var(--scroll-progress))",
              transform: "translate3d(calc(-50% + 50% * var(--scroll-progress)), 50px, 0) rotate(calc(var(--scroll-progress) * 5.5deg))",
            } as React.CSSProperties}
          >
            <Image
              src="/hero/whatsapp.png"
              alt="WhatsApp message"
              width={900}
              height={500}
              className="h-auto w-[350px] rounded-2xl"
            />
          </div>

          <div
            className="absolute will-change-transform"
            style={{
              opacity: "calc(1 - var(--scroll-progress))",
              transform: "translate3d(calc(50% - 50% * var(--scroll-progress)), 2px, 0) rotate(calc(var(--scroll-progress) * -5.5deg))",
            } as React.CSSProperties}
          >
            <Image
              src="/hero/telegram.png"
              alt="Telegram message"
              width={900}
              height={500}
              className="h-auto w-[350px] rounded-2xl"
            />
          </div>

          <div
            className="absolute will-change-transform"
            style={{
              opacity: "calc(1 - var(--scroll-progress))",
              transform: "translate3d(calc(50% - 50% * var(--scroll-progress)), calc(400px - 300px * var(--scroll-progress)), 0) rotate(calc(var(--scroll-progress) * -5deg))",
            } as React.CSSProperties}
          >
            <Image
              src="/hero/facebook.png"
              alt="Facebook post"
              width={753}
              height={531}
              className="h-auto w-[350px] rounded-2xl"
            />
          </div>

          <div
            className="flex justify-center will-change-transform pt-20"
            style={{
              opacity: "var(--scroll-progress)",
            } as React.CSSProperties}
          >
            <Image
              src="/Foreground.svg"
              alt="X post"
              width={900}
              height={500}
              className="h-auto w-90"
              priority
            />
          </div>
        </div>

      </div>

      {/* ===== DESKTOP (FLOATING COLLAGE – ANGLED) ===== */}
      <div className="hidden md:block h-[650px] sticky top-20 pt-10 space-y-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
            Open to opportunities · Limited time offer · 50%
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl tracking-tighter mb-6"
            style={{
              fontFamily: "General Sans",
              fontWeight: 700,
              fontSize: "64px",
              lineHeight: "64px",
              letterSpacing: "-2%",
              textAlign: "center",
            }}
          >
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

        <div className="md:w-[1024px] lg:w-[1440px] relative left-2/3 -translate-x-1/2 ">
          <div
            className="absolute top-20 will-change-transform"
            style={{
              left: "calc(-5% + 20% * var(--scroll-progress))",
              opacity: "calc(1 - var(--scroll-progress))",
              transform: "rotate(calc(var(--scroll-progress) * 5deg))",
            } as React.CSSProperties}
          >
            <Image
              src="/hero/twitter.png"
              alt="X post"
              width={900}
              height={500}
              className="h-auto w-[450px] rounded-2xl"
              priority
            />
          </div>

          <div
            className="absolute top-2 will-change-transform"
            style={{
              right: "calc(62% + (50% - 62%) * var(--scroll-progress))",
              opacity: "calc(1 - var(--scroll-progress))",
              transform: "rotate(calc(var(--scroll-progress) * 5deg))",
            } as React.CSSProperties}
          >
            <Image
              src="/hero/whatsapp.png"
              alt="WhatsApp message"
              width={900}
              height={500}
              className="h-auto w-[350px] rounded-2xl"
            />
          </div>

          <div
            className="absolute top-2 will-change-transform"
            style={{
              right: "calc(37% + (50% - 37%) * var(--scroll-progress))",
              opacity: "calc(1 - var(--scroll-progress))",
              transform: "rotate(calc(var(--scroll-progress) * -5deg))",
            } as React.CSSProperties}
          >
            <Image
              src="/hero/telegram.png"
              alt="Telegram message"
              width={900}
              height={500}
              className="h-auto w-[350px] rounded-2xl"
            />
          </div>

          <div
            className="absolute top-8 will-change-transform"
            style={{
              right: "calc(15% + (50% - 15%) * var(--scroll-progress))",
              opacity: "calc(1 - var(--scroll-progress))",
              transform: "rotate(calc(var(--scroll-progress) * -5deg))",
            } as React.CSSProperties}
          >
            <Image
              src="/hero/facebook.png"
              alt="Facebook post"
              width={753}
              height={531}
              className="h-auto w-[350px] rounded-2xl"
            />
          </div>

          <div
            className="md:-translate-x-[15%] lg:-translate-x-[12%] flex justify-center will-change-transform"
            style={{
              opacity: "var(--scroll-progress)",
            } as React.CSSProperties}
          >
            <Image
              src="/Foreground.svg"
              alt="X post"
              width={900}
              height={500}
              className="h-auto w-90"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
