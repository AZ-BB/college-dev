import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
        <div className="text-center mb-12 flex flex-col items-center justify-center">
          <Badge className="mb-4 text-base bg-[#FEF0E7] text-[#F7670E]">
            All in One
          </Badge>

          <div className="relative inline-block">
            <h2 className="text-4xl sm:text-5xl text-neutral-900 mb-4 font-generalSans font-bold">
              One platform. Zero chaos.
            </h2>

            <div className="hidden sm:block absolute -top-2 right-0 translate-x-3/4 -translate-y-1/2">
              <svg className="w-24 h-24 sm:w-32 sm:h-32" width="143" height="143" viewBox="0 0 143 143" fill="none" xmlns="http://www.w3.org/2000/svg">
                <mask id="mask0_32378_56020" style={{ maskType: "luminance" }} maskUnits="userSpaceOnUse" x="60" y="50" width="66" height="65">
                  <path d="M125.441 71.3153L103.998 50.0095L60.7405 93.5459L82.1836 114.852L125.441 71.3153Z" fill="white" />
                </mask>
                <g mask="url(#mask0_32378_56020)">
                  <path d="M123.863 71.072C123.186 74.2669 120.026 77.1039 112.539 81.1536C104.364 85.6071 90.917 90.9641 81.256 93.5954C73.3924 95.7379 63.8965 96.5437 62.5543 95.2101C61.2679 93.932 61.6352 92.5333 63.6834 90.8707C65.5888 89.2961 70.3484 87.5373 85.3366 82.8592C92.9727 80.4908 109.27 74.3791 115.68 71.474C119.154 69.9202 121.947 69.2234 123.258 69.6187C123.945 69.8451 124.059 70.0734 123.863 71.072Z" fill="#F7670E" />
                </g>
                <path d="M63.4842 47.1956C63.6866 47.682 63.7762 48.9639 63.6624 50.0478C63.4987 52.3305 57.1849 70.2922 55.1131 74.4915C53.3234 78.0637 51.3064 80.1536 49.6522 80.1032C47.9384 80.0531 46.7971 78.7447 46.8208 76.8341C46.8092 72.6137 53.0372 54.5668 56.5589 48.677C58.6607 45.1336 62.2526 44.3786 63.4862 47.1976L63.4842 47.1956Z" fill="#F7670E" />
                <mask id="mask1_32378_56020" style={{ maskType: "luminance" }} maskUnits="userSpaceOnUse" x="1" y="35" width="36" height="36">
                  <path d="M36.6913 54.4247L18.0223 35.8752L1.78924 52.2128L20.4583 70.7623L36.6913 54.4247Z" fill="white" />
                </mask>
                <g mask="url(#mask1_32378_56020)">
                  <path d="M22.8335 42.3651C23.5221 44.4721 23.8444 47.6379 24.2989 57.9302C24.5696 64.2312 24.264 66.8841 23.0969 68.0588C21.9595 69.2035 19.7328 69.155 18.5322 67.9621C17.19 66.6285 15.6666 62.0988 14.3668 55.4016C12.3763 45.3428 12.5644 41.3802 15.2395 38.6878C16.3492 37.571 16.8594 37.3408 18.0028 37.4504C19.9414 37.5575 21.8861 39.5452 22.8335 42.3651Z" fill="#F7670E" />
                </g>
                <path d="M102.926 127.511C103.19 130.56 99.7146 132.172 92.898 132.227C85.2564 132.256 77.5233 130.434 74.4099 127.907C71.4659 125.497 72.6558 122.126 76.731 121.455C79.3836 121.015 81.7778 121.234 87.7414 122.379C90.5383 122.939 94.56 123.578 96.6702 123.856C101.35 124.467 102.75 125.287 102.926 127.511Z" fill="#F7670E" />
              </svg>
            </div>

          </div>

          <p className="text-lg text-neutral-600 mb-8">
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
              <h3 className="mb-3 text-lg font-semibold text-grey-900">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-sm leading-relaxed text-grey-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <Button
            className="px-4 py-7"
            variant="default"
            asChild
          >
            <Link href="/signup">
              Create Your Community
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
