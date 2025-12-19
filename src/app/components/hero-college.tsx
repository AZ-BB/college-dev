import Image from "next/image";

export function HeroCollage() {
  return (
    <div className="relative mx-auto mt-10 max-w-6xl">
      {/* background */}
      <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-b from-gray-50 to-white" />

      {/* container that holds floating cards */}
      <div className="relative h-[180px] sm:h-[220px] md:h-[260px] lg:h-[300px]">
        {/* Card 1 */}
        <div className="absolute left-0 top-6 w-[240px] sm:w-[280px] md:w-[320px] rotate-[-6deg]">
          <div className="">
            <Image
              src="/Twitter.svg"
              alt="X post"
              width={900}
              height={500}
              className="h-auto w-full rounded-2xl"
              priority
            />
          </div>
        </div>

        {/* Card 2 */}
        <div className="absolute left-[18%] top-10 w-[240px] sm:w-[280px] md:w-[320px] rotate-[3deg]">
          <div className="">
            <Image
              src="/whatsapp.svg"
              alt="WhatsApp message"
              width={900}
              height={500}
              className="h-auto w-full rounded-2xl"
            />
          </div>
        </div>

        {/* Card 3 */}
        <div className="absolute left-[44%] top-2 w-[240px] sm:w-[280px] md:w-[320px] rotate-[-2deg]">
          <div className="">
            <Image
              src="/telegram.svg"
              alt="Telegram message"
              width={900}
              height={500}
              className="h-auto w-full rounded-2xl"
            />
          </div>
        </div>

        {/* Card 4 */}
        <div className="absolute right-0 top-8 w-[240px] sm:w-[280px] md:w-[320px] rotate-[6deg]">
          <div className="">
            <Image
              src="/facebook post.svg"
              alt="Facebook post"
              width={900}
              height={500}
              className="h-auto w-full rounded-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
