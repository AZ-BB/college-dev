"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";

export function HeroCollage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let rafId: number;
    let lastScrollY = 0;

    const handleScroll = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Calculate scroll progress based on how much of the sticky section has been scrolled
        if (rect.top <= 0 && rect.bottom >= windowHeight) {
          const scrolled = Math.abs(rect.top);
          const totalScroll = rect.height - windowHeight;
          const progress = Math.max(0, Math.min(1, scrolled / totalScroll));
          
          // Only update if progress changed significantly (reduces re-renders)
          if (Math.abs(progress - scrollProgress) > 0.001) {
            setScrollProgress(progress);
          }
        } else if (rect.top > 0 && scrollProgress !== 0) {
          setScrollProgress(0);
        } else if (rect.bottom < windowHeight && scrollProgress !== 1) {
          setScrollProgress(1);
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
  }, [scrollProgress]);

  // Memoize position calculations
  const imagePositions = useMemo(() => ({
    twitter: -5 + (15 - (-5)) * scrollProgress,
    whatsapp: 62 + (50 - 62) * scrollProgress,
    telegram: 37 + (50 - 37) * scrollProgress,
    facebook: 15 + (50 - 15) * scrollProgress,
  }), [scrollProgress]);

  // Memoize rotation and opacity values
  const animationValues = useMemo(() => ({
    rotation: scrollProgress * 5,
    imageOpacity: 1 - scrollProgress,
    foregroundOpacity: scrollProgress,
  }), [scrollProgress]);

  return (
    <div ref={containerRef} className="relative max-w-6xl" style={{ height: "180vh" }}>

      {/* ===== DESKTOP (FLOATING COLLAGE – ANGLED) ===== */}
      <div className="hidden md:block h-[650px] sticky top-20 pt-10 space-y-10">

        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
            Open to opportunities · Limited time offer · 50%
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-generalSans tracking-tighter mb-6 font-bold"
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

        <div className="md:w-[1024px] lg:w-[1440px] relative left-2/3 -translate-x-1/2">
          <div
            className="absolute top-20 will-change-transform"
            style={{
              left: `${imagePositions.twitter}%`,
              opacity: animationValues.imageOpacity,
              transform: `rotate(${animationValues.rotation}deg)`,
            }}
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
              right: `${imagePositions.whatsapp}%`,
              opacity: animationValues.imageOpacity,
              transform: `rotate(${animationValues.rotation}deg)`,
            }}
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
              right: `${imagePositions.telegram}%`,
              opacity: animationValues.imageOpacity,
              transform: `rotate(${-animationValues.rotation}deg)`,
            }}
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
              right: `${imagePositions.facebook}%`,
              opacity: animationValues.imageOpacity,
              transform: `rotate(${-animationValues.rotation}deg)`,
            }}
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
              opacity: animationValues.foregroundOpacity,
            }}
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