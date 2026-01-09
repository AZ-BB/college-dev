import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function UseCasesSection() {
  const useCases = [
    {
      image: "/yt.svg",
      title: "Online Courses",
      description:
        "Put your courses in the same place as your community. Let your members interact and collaborate in one place.",
    },
    {
      image: "/mn.svg",
      title: "Subscription Memberships",
      description:
        "Build a community and monetize by charging a monthly/annual/tier based subscription. Like a country club!",
    },
    {
      image: "/ct.svg",
      title: "SaaS / Product Development",
      description:
        "Get feedback from your users to know what to build. Announce new features and get feedback immediately.",
    },
    {
      image: "/mc.svg",
      title: "Coaching Programs",
      description:
        "Give your members a home and improve their experience. Put all resources in 1-place, centralize communication.",
    },
    {
      image: "/ht.svg",
      title: "Influencer / Fan Communities",
      description:
        "Give your audience a place to hangout and connect. Deepen your relationship and get ideas from them.",
    },
    {
      image: "/sm.svg",
      title: "Support Forums",
      description:
        "Get your customers to support each other and build searchable help documentation organically over time.",
    },
  ];

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 flex flex-col items-center justify-center">
          <Badge className="mb-4 text-base bg-[#FEF0E7] text-[#F7670E]">
            Use Cases
          </Badge>

          <div className="relative inline-block">
            <h2 className="text-4xl sm:text-5xl text-neutral-900 mb-4 font-generalSans font-bold">
              How people use College
            </h2>

          </div>

          <p className="text-lg text-neutral-600 mb-8">
            Communities. Courses. Conversations. Payments. Analytics etc.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
          {useCases.map((useCase, idx) => (
            <div key={idx} className="flex flex-col items-start">
              {/* Image */}
              <div className="mb-6">
                <Image
                  src={useCase.image}
                  alt={useCase.title}
                  width={72}
                  height={72}
                  className="h-16 w-16"
                />
              </div>

              {/* Title */}
              <h3 className="mb-3 text-lg font-semibold text-grey-900">
                {useCase.title}
              </h3>

              {/* Description */}
              <p className="text-sm leading-relaxed text-grey-600">
                {useCase.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="mt-16 text-center">
          <Button
            className="px-4 py-7"
            variant="default"
            asChild
          >
            <Link href="/use-cases">
              Create you community
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
