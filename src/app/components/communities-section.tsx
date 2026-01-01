import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { formatPrice, formatMemberCount } from "@/utils/communities"
import { getCommunities } from "@/action/communities"

export default async function CommunitiesSection() {
  // Fetch communities
  const communities = await getCommunities({
    page: 1,
    limit: 6,
  })

  // Show only first 6 communities for the landing page
  const displayCommunities = communities.data?.communities || []
  if (communities.error || displayCommunities.length === 0) {
    return null
  }

  return (
    <section className="py-20 ">
      <div className="w-full mx-auto sm:px-8">
        {/* Header Section */}
        <div className="text-center mb-12 flex flex-col items-center justify-center">
          <Badge className="mb-4 text-base bg-[#FEF0E7] text-[#F7670E]">
            Level Up
          </Badge>

          <div className="relative inline-block">
            <h2 className="text-4xl sm:text-5xl font-bold text-neutral-900 mb-4 font-generalSans font-bold">
              Join a community.
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
            Skills, support, and structure - already set up.
          </p>
        </div>

        {/* Communities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10 justify-items-center">
          {displayCommunities.map((community: any) => (
            <Link
              key={community.id}
              href={`/communities/${community.slug}`}
              className="w-full max-w-[400px]"
            >
              <Card className="border-none hover:shadow-md transition-shadow shadow-none cursor-pointer h-full bg-white rounded-t-[15px] pt-0 w-full max-h-[344px]">
                <div className="relative h-48 rounded-t-lg">
                  {/* Community Cover Image */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image
                      className="w-full h-full object-cover opacity-50 rounded-t-[15px]"
                      src={community.cover_image || "/community-placeholder.png"}
                      alt={community.name}
                      width={400}
                      height={200}
                    />
                  </div>

                  {/* Community Avatar */}
                  <div className="absolute bg-black w-[44px] text-lg h-[44px] rounded-[10px] flex items-center justify-center text-white font-semibold bottom-0 left-6 transform translate-y-1/2">
                    {community.avatar || community.name.charAt(0).toUpperCase()}
                  </div>
                </div>

                <CardHeader className="pt-4 pb-4">
                  <CardTitle className="text-[16px] font-bold text-icon-black mb-2">
                    {community.name}
                  </CardTitle>
                  <CardDescription className="text-[#485057] line-clamp-2">
                    {community.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-start gap-4 font-medium text-[14px] text-[#485057]">
                    <div className="flex items-center gap-2">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M15 5.96651C14.95 5.95817 14.8917 5.95817 14.8417 5.96651C13.6917 5.92484 12.775 4.98317 12.775 3.81651C12.775 2.62484 13.7334 1.6665 14.925 1.6665C16.1167 1.6665 17.075 2.63317 17.075 3.81651C17.0667 4.98317 16.15 5.92484 15 5.96651Z"
                          stroke="#2B3034"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M14.1417 12.0333C15.2834 12.225 16.5417 12.025 17.425 11.4333C18.6 10.65 18.6 9.36664 17.425 8.58331C16.5334 7.99164 15.2584 7.79163 14.1167 7.99163"
                          stroke="#2B3034"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M4.97503 5.96651C5.02503 5.95817 5.08336 5.95817 5.13336 5.96651C6.28336 5.92484 7.20002 4.98317 7.20002 3.81651C7.20002 2.62484 6.24169 1.6665 5.05003 1.6665C3.85836 1.6665 2.90002 2.63317 2.90002 3.81651C2.90836 4.98317 3.82503 5.92484 4.97503 5.96651Z"
                          stroke="#2B3034"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M5.83334 12.0333C4.69168 12.225 3.43335 12.025 2.55001 11.4333C1.37501 10.65 1.37501 9.36664 2.55001 8.58331C3.44168 7.99164 4.71668 7.79163 5.85834 7.99163"
                          stroke="#2B3034"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9.99996 12.1916C9.94996 12.1833 9.89163 12.1833 9.84163 12.1916C8.69163 12.1499 7.77496 11.2083 7.77496 10.0416C7.77496 8.84994 8.7333 7.8916 9.92496 7.8916C11.1166 7.8916 12.075 8.85827 12.075 10.0416C12.0666 11.2083 11.15 12.1583 9.99996 12.1916Z"
                          stroke="#2B3034"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M7.57498 14.8168C6.39998 15.6001 6.39998 16.8835 7.57498 17.6668C8.90831 18.5585 11.0916 18.5585 12.425 17.6668C13.6 16.8835 13.6 15.6001 12.425 14.8168C11.1 13.9335 8.90831 13.9335 7.57498 14.8168Z"
                          stroke="#2B3034"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                      <span>
                        {formatMemberCount(community.member_count || 0)} members
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M14.1667 17.0832H5.83332C3.33332 17.0832 1.66666 15.8332 1.66666 12.9165V7.08317C1.66666 4.1665 3.33332 2.9165 5.83332 2.9165H14.1667C16.6667 2.9165 18.3333 4.1665 18.3333 7.08317V12.9165C18.3333 15.8332 16.6667 17.0832 14.1667 17.0832Z"
                          stroke="#2B3034"
                          strokeWidth="1.5"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z"
                          stroke="#2B3034"
                          strokeWidth="1.5"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M4.58334 7.9165V12.0832"
                          stroke="#2B3034"
                          strokeWidth="1.5"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M15.4167 7.9165V12.0832"
                          stroke="#2B3034"
                          strokeWidth="1.5"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                      <span>
                        {community.price && community.currency
                          ? formatPrice(Number(community.price), community.currency)
                          : "Free"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Explore Communities Button */}
        <div className="text-center mt-12">
          <Link href="/communities">
            <Button
              className="px-4 py-7"
              variant="secondary"
            >
              Explore Communities
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

