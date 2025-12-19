'use client';

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { HeroCollage } from "./hero-college";
import CreateCommunity from "./create-community";

export default function Hero() {
  return (
    <section className="relative px-4 py-10 md:py-14 lg:py-20 pb-0 ">
      <HeroCollage />
    </section >
  );
}
