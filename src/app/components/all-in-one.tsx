import Image from "next/image";
import Link from "next/link";

export default function AllInOneSection() {
  const features = [
    {
      image: "/comm.svg",
      title: "Community",
      description:
        "Group discussion happens here. Posts, comments, topics, likes, mentions, photos, videos, GIFs, polls, real-time interactions, and notifications. All of these increase your engagement.",
    },
    {
      image: "/pl.svg",
      title: "Classroom",
      description:
        "Put your courses in the same place as your community. Courses, modules, videos, resources, searchable transcripts, and progress tracking. Increasing your completion rate.",
    },
    {
      image: "/search.svg",
      title: "Search",
      description:
        'Search posts, comments, course content, and members - with a single search box. Like Robot? Find all group discussions, course content, and members  who mentioned "Robot".',
    },
    {
      image: "/noti.svg",
      title: "Notifications & Profile",
      description:
        "Follow interesting posts, get notifications in-app and via email, tune your preferences, and get email digests of popular posts. Use 1-profile for all the groups you're in.",
    },
    {
      image: "/mai.svg",
      title: "Email Broadcast",
      description:
        "Email broadcast to all members with 1- click. Write a post, click a button, and the post sends to all your members via email. No segmenting lists, tags, or formatting - it just works.",
    },
    {
      image: "/trade.svg",
      title: "Metrics",
      description:
        "Monitor the health of your community with single dashboard and a few key metrics. Track growth, engagement, and progress at the group or member level. See how engaging TheCollege is!",
    },
  ];

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-20 text-center">
          <span className="inline-block rounded-full bg-orange-100 px-4 py-1 text-sm font-medium text-orange-600">
            All in One
          </span>

          <h2 className="mt-6 text-4xl font-bold md:text-5xl">
            One platform. Zero chaos.
          </h2>

          <p className="mt-4 text-lg text-gray-600">
            Built for creators who want everything under control.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 gap-x-12 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => (
            <div key={idx} className="flex flex-col items-start">
              {/* Icon */}
              <Image
                src={feature.image}
                alt={feature.title}
                width={64}
                height={64}
                className="mb-6 h-14 w-14"
              />

              {/* Title */}
              <h3 className="mb-3 text-lg font-semibold text-gray-900">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-sm leading-relaxed text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-8 py-3 text-base font-semibold text-white transition hover:bg-orange-600"
          >
            Create Your Community
          </Link>
        </div>
      </div>
    </section>
  );
}
