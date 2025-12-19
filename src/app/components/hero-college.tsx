import Image from "next/image";

export function HeroCollage() {
  return (
    <div className="relative mx-auto mt-10 max-w-6xl">
      {/* background */}
      <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-b from-gray-50 to-white" />

      {/* ===== MOBILE (2x2 GRID – STRAIGHT) ===== */}
      <div className="grid grid-cols-2 gap-4 md:hidden">
        <Image
          src="/Twitter.svg"
          alt="X post"
          width={900}
          height={500}
          className="w-full rounded-2xl"
          priority
        />

        <Image
          src="/whatsapp.svg"
          alt="WhatsApp message"
          width={900}
          height={500}
          className="w-full rounded-2xl"
        />

        <Image
          src="/telegram.svg"
          alt="Telegram message"
          width={900}
          height={500}
          className="w-full rounded-2xl"
        />

        <Image
          src="/facebook post.svg"
          alt="Facebook post"
          width={900}
          height={500}
          className="w-full rounded-2xl"
        />
      </div>

      {/* ===== DESKTOP (FLOATING COLLAGE – ANGLED) ===== */}
      <div className="relative hidden h-[260px] md:block lg:h-[300px]">
        {/* Card 1 */}
        <div className="absolute left-0 top-6 w-[320px] -rotate-6">
          <Image
            src="/Twitter.svg"
            alt="X post"
            width={900}
            height={500}
            className="w-full rounded-2xl"
            priority
          />
        </div>

        {/* Card 2 */}
        <div className="absolute left-[18%] top-10 w-[320px] rotate-3">
          <Image
            src="/whatsapp.svg"
            alt="WhatsApp message"
            width={900}
            height={500}
            className="w-full rounded-2xl"
          />
        </div>

        {/* Card 3 */}
        <div className="absolute left-[44%] top-2 w-[320px] -rotate-2">
          <Image
            src="/telegram.svg"
            alt="Telegram message"
            width={900}
            height={500}
            className="w-full rounded-2xl"
          />
        </div>

        {/* Card 4 */}
        <div className="absolute right-0 top-8 w-[320px] rotate-6">
          <Image
            src="/facebook post.svg"
            alt="Facebook post"
            width={900}
            height={500}
            className="w-full rounded-2xl"
          />
        </div>
      </div>
    </div>
  );
}
