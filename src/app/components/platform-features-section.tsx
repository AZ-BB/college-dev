'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PlatformFeaturesSection() {
  const features = [
    {
      icon: "👥",
      title: "Community",
      description: "Build engaged communities with members, roles, and permission management.",
    },
    {
      icon: "💬",
      title: "Classrooms",
      description: "Host organized discussions, workshops, and educational content delivery.",
    },
    {
      icon: "🔍",
      title: "Search",
      description: "Powerful search functionality to discover content and members instantly.",
    },
    {
      icon: "🔔",
      title: "Notifications & Profiles",
      description: "Smart notifications and rich member profiles with customization options.",
    },
    {
      icon: "💌",
      title: "Email Broadcasts",
      description: "Reach your community with targeted email campaigns and announcements.",
    },
    {
      icon: "📊",
      title: "Metrics",
      description: "Comprehensive analytics to track growth, engagement, and community health.",
    },
  ];

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-grey-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            One platform. Zero chaos.
          </h2>
          <p className="text-lg text-grey-600">
            Everything you need to run your creator programs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-8 bg-white rounded-lg border border-grey-200 hover:border-orange-300 transition-all hover:shadow-lg"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-grey-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            size="lg"
            className="bg-orange-500 hover:bg-orange-600 text-white"
            asChild
          >
            <Link href="#explore">
              Explore Communities
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
