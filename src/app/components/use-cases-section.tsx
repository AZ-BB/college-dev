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
        "Give your members a home and improve their experience. Put all resources in-place, centralize communication.",
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
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full bg-orange-100 px-4 py-1 text-sm font-medium text-orange-600">
            Use Cases
          </span>

          <h2 className="mt-4 text-4xl font-bold md:text-5xl">
            How people use College
          </h2>

          <p className="mt-4 text-lg text-gray-600">
            Communities. Courses. Payments. Posts. Members. Analytics etc.
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
              <h3 className="mb-3 text-lg font-semibold text-gray-900">
                {useCase.title}
              </h3>

              {/* Description */}
              <p className="text-sm leading-relaxed text-gray-600">
                {useCase.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="mt-16 text-center">
          <Button
            size="lg"
            className="bg-orange-500 hover:bg-orange-600 text-white px-8"
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
