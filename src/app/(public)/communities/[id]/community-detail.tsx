"use client"

import { Community } from "@/action/communities"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatMemberCount, formatPrice } from "@/utils/communities"
import Image from "next/image"
import Link from "next/link"
import {
  Share2,
  Users,
  Lock,
  ExternalLink,
  ArrowLeft,
  ChevronLeft,
} from "lucide-react"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"

interface CommunityDetailPageProps {
  community: Community
}

export default function CommunityDetailPage({
  community,
}: CommunityDetailPageProps) {
  const [showShareMenu, setShowShareMenu] = useState(false)
  const router = useRouter()

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: community.name,
          text: community.description || "",
          url: window.location.href,
        })
      } catch (err) {
        console.log("Error sharing:", err)
      }
    } else {
      setShowShareMenu(!showShareMenu)
    }
  }

  return (
    <div className="flex max-w-7xl mx-auto">
      {/* Left Side */}
      <div className="min-h-screen bg-white w-full">
        {/* Top Header Section - Desktop */}
        <div className="border-b bg-white hidden lg:block">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-start justify-between gap-8">
              {/* Left - Community Info */}
              <div className="flex items-start gap-4 flex-1">
                <div className="w-[44px] h-[44px] bg-black rounded-lg flex items-center justify-center text-white text-xl font-semibold shrink-0">
                  {community.avatar || community.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 mb-1">
                    {community.name}
                  </h1>
                  <p className="text-sm text-gray-primary font-medium">
                    thecollege.com/{community.slug || community.id}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Community Info */}
        <div className="lg:hidden px-4 py-4 bg-white">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-[56px] h-[56px] bg-black rounded-lg flex items-center justify-center text-white text-2xl font-semibold shrink-0">
              {community.avatar || community.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900 mb-1">
                {community.name}
              </h1>
              <p className="text-xs text-gray-primary">
                skool.com/{community.slug || community.id}
              </p>
            </div>
          </div>
        </div>

        {/* Image Gallery Section */}
        <div className="bg-white">
          {/* Desktop Image Gallery */}
          <div className="hidden lg:block border-b">
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="gap-8">
                {/* Left - Main Image and Thumbnails */}
                <div>
                  <div className="relative rounded-2xl overflow-hidden mb-4 bg-gray-100 h-[450px]">
                    <Image
                      src={"/cover.jpg"}
                      alt={community.name}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1000px"
                    />
                  </div>

                  {/* Thumbnail Gallery */}
                  <div className="flex gap-3">
                    <div className="w-[96px] h-[96px] rounded-lg overflow-hidden border-2 border-gray-200 hover:border-orange-500 transition-colors cursor-pointer">
                      <Image
                        src={"/thumb1.jpg"}
                        alt={community.name}
                        width={96}
                        height={96}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="w-[96px] h-[96px] rounded-lg overflow-hidden border-2 border-gray-200 hover:border-orange-500 transition-colors cursor-pointer bg-gray-100">
                      <Image
                        src={"/thumb2.jpg"}
                        alt={`${community.name} 2`}
                        width={96}
                        height={96}
                        className="object-cover w-full h-full opacity-70"
                      />
                    </div>
                    <div className="w-[96px] h-[96px] rounded-lg overflow-hidden border-2 border-gray-200 hover:border-orange-500 transition-colors cursor-pointer bg-gray-100">
                      <Image
                        src={"/thumb3.jpg"}
                        alt={`${community.name} 3`}
                        width={96}
                        height={96}
                        className="object-cover w-full h-full opacity-70"
                      />
                    </div>
                  </div>
                </div>

                {/* Right - Spacer for layout */}
                <div className="hidden lg:block"></div>
              </div>
            </div>
          </div>

          {/* Mobile Image */}
          <div className="lg:hidden px-4 pb-4">
            <div className="relative rounded-2xl overflow-hidden bg-gray-100 h-[200px]">
              <Image
                src={"/cover.jpg"}
                alt={community.name}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
            </div>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
          <div className="gap-8">
            {/* Left Column - Community Details */}
            <div>
              {/* Desktop Stats Bar */}
              <div className="hidden lg:flex flex-wrap items-center gap-4 mb-6">
                {community.is_public ? (
                  <div className="flex items-center gap-2 text-sm">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                        stroke="#0E1011"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M7.99961 3H8.99961C7.04961 8.84 7.04961 15.16 8.99961 21H7.99961"
                        stroke="#0E1011"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M15 3C16.95 8.84 16.95 15.16 15 21"
                        stroke="#292D32"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3 16V15C8.84 16.95 15.16 16.95 21 15V16"
                        stroke="#292D32"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3 9.0001C8.84 7.0501 15.16 7.0501 21 9.0001"
                        stroke="#292D32"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>

                    <span className="font-medium">Public</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <Lock className="w-4 h-4" />
                    <span className="font-medium">Private</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.15957 10.87C9.05957 10.86 8.93957 10.86 8.82957 10.87C6.44957 10.79 4.55957 8.84 4.55957 6.44C4.55957 3.99 6.53957 2 8.99957 2C11.4496 2 13.4396 3.99 13.4396 6.44C13.4296 8.84 11.5396 10.79 9.15957 10.87Z"
                      stroke="#0E1011"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16.4103 4C18.3503 4 19.9103 5.57 19.9103 7.5C19.9103 9.39 18.4103 10.93 16.5403 11C16.4603 10.99 16.3703 10.99 16.2803 11"
                      stroke="#0E1011"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4.15973 14.56C1.73973 16.18 1.73973 18.82 4.15973 20.43C6.90973 22.27 11.4197 22.27 14.1697 20.43C16.5897 18.81 16.5897 16.17 14.1697 14.56C11.4297 12.73 6.91973 12.73 4.15973 14.56Z"
                      stroke="#0E1011"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M18.3398 20C19.0598 19.85 19.7398 19.56 20.2998 19.13C21.8598 17.96 21.8598 16.03 20.2998 14.86C19.7498 14.44 19.0798 14.16 18.3698 14"
                      stroke="#0E1011"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <span className="font-medium">
                    {formatMemberCount(community.member_count || 0)} members
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M17 20.5H7C4 20.5 2 19 2 15.5V8.5C2 5 4 3.5 7 3.5H17C20 3.5 22 5 22 8.5V15.5C22 19 20 20.5 17 20.5Z"
                      stroke="#292D32"
                      strokeWidth="1.5"
                      stroke-miterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                      stroke="#292D32"
                      strokeWidth="1.5"
                      stroke-miterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5.5 9.5V14.5"
                      stroke="#292D32"
                      strokeWidth="1.5"
                      stroke-miterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M18.5 9.5V14.5"
                      stroke="#292D32"
                      strokeWidth="1.5"
                      stroke-miterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <span className="font-medium">
                    {community.price && community.currency
                      ? formatPrice(Number(community.price), community.currency)
                      : "Free"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Avatar className="w-[24px] h-[24px]">
                    {community.creator?.avatar_url ? (
                      <AvatarImage
                        className="w-full h-full object-cover"
                        src={community.creator?.avatar_url}
                        alt={community.creator?.first_name || "Unknown"}
                      />
                    ) : (
                      <div className="w-full text-xs h-full bg-[#cbcad0] flex items-center justify-center">
                        {community.creator?.first_name
                          ?.charAt(0)
                          .toUpperCase() || "Unknown"}
                      </div>
                    )}
                  </Avatar>
                  <span className="font-medium">
                    By {community.creator?.first_name || "Unknown"}{" "}
                    {community.creator?.last_name || ""}
                  </span>
                </div>
              </div>

              {/* Mobile "About" Section */}
              <div className="lg:hidden mb-6">
                <h3 className="text-base font-bold text-gray-900 mb-3">
                  About
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  {community.description ||
                    "A community built to master no-code AI automations. Join to learn, discuss, and build the systems that will shape the future of work."}
                </p>
              </div>

              {/* Mobile Creator & Links Section */}
              <div className="lg:hidden mb-6">
                {/* Creator Info */}
                <div className="flex items-center gap-2 mb-4">
                  <Avatar className="w-[24px] h-[24px]">
                    {community.creator?.avatar_url ? (
                      <AvatarImage
                        className="w-full h-full object-cover"
                        src={community.creator?.avatar_url}
                        alt={community.creator?.first_name || "Unknown"}
                      />
                    ) : (
                      <div className="w-full text-xs h-full bg-[#cbcad0] flex items-center justify-center">
                        {community.creator?.first_name
                          ?.charAt(0)
                          .toUpperCase() || "U"}
                      </div>
                    )}
                  </Avatar>
                  <span className="text-sm text-gray-700">
                    By {community.creator?.first_name || "Unknown"}{" "}
                    {community.creator?.last_name || ""}
                  </span>
                </div>

                {/* Start Here Links */}
                <div className="flex items-center gap-4 mb-4">
                  <Link
                    href="#"
                    className="text-orange-primary hover:text-orange-600 text-xs font-semibold flex items-center gap-1"
                  >
                    Start here
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                  <Link
                    href="#"
                    className="text-orange-primary hover:text-orange-600 text-xs font-semibold flex items-center gap-1"
                  >
                    Start here
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                  <Link
                    href="#"
                    className="text-orange-primary hover:text-orange-600 text-xs font-semibold flex items-center gap-1"
                  >
                    Start here
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-6 text-sm text-gray-700">
                  <span>
                    <span className="font-bold">
                      {formatMemberCount(community.member_count || 156)}
                    </span>{" "}
                    members
                  </span>
                  <span>
                    <span className="font-bold">60</span> online
                  </span>
                  <span>
                    <span className="font-bold">13</span> admins
                  </span>
                </div>
              </div>
              {/* Mobile CTAs & Info Section */}
              <div className="lg:hidden mb-6">
                {/* Join Button */}
                <Button className="w-full bg-orange-primary hover:bg-orange-primary/90 text-white font-semibold text-base h-[52px] rounded-2xl mb-3">
                  Join For{" "}
                  {community.price && community.currency
                    ? formatPrice(Number(community.price), community.currency)
                    : "Free"}
                </Button>

                {/* Share Button */}
                <Button
                  onClick={handleShare}
                  className="w-full bg-[#F4F4F6] hover:bg-[#e5e5e8] text-black font-semibold text-base h-[52px] rounded-2xl mb-4"
                >
                  Share
                </Button>

                {/* Private Community Indicator */}
                <div className="flex items-start gap-3 mb-4 bg-white">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="shrink-0 mt-1"
                  >
                    <path
                      d="M6 10V8C6 4.69 7 2 12 2C17 2 18 4.69 18 8V10"
                      stroke="#485057"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 18.5C13.3807 18.5 14.5 17.3807 14.5 16C14.5 14.6193 13.3807 13.5 12 13.5C10.6193 13.5 9.5 14.6193 9.5 16C9.5 17.3807 10.6193 18.5 12 18.5Z"
                      stroke="#485057"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M17 22H7C3 22 2 21 2 17V15C2 11 3 10 7 10H17C21 10 22 11 22 15V17C22 21 21 22 17 22Z"
                      stroke="#485057"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex flex-col">
                    <div className="text-sm font-semibold text-gray-900">
                      Private Community
                    </div>
                    <div className="text-xs text-gray-600">
                      You can view this community publicly
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 text-sm pb-6 border-b">
                  <span className="text-base">🏆</span>
                  <span className="text-xs">3x Skool Games Winner</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-base">✅</span>
                  <span className="text-xs">Verified n8n Expert Partner</span>
                </div>
              </div>
              {/* Badges - Desktop Only */}
              <div className="hidden lg:flex flex-wrap items-center gap-2 mb-6 pb-6 border-b">
                <span className="text-base">🏆</span>
                <span className="text-sm">3x Skool Games Winner</span>
                <span className="text-gray-400">|</span>
                <span className="text-base">✅</span>
                <span className="text-sm">Verified n8n Expert Partner</span>
              </div>

              {/* Community Description - Desktop */}
              <div className="hidden lg:block mb-8">
                <p className="text-gray-900 text-sm leading-relaxed mb-3">
                  {community.description ||
                    "We make AI easy to understand regardless of your background, from the fundamentals to building complex agents."}
                </p>
                <p className="text-gray-900 text-sm leading-relaxed">
                  Unlimited FREE Tech Support 🤝
                </p>
              </div>

              {/* Mobile Description Continuation */}
              <div className="lg:hidden mb-6">
                <p className="text-sm text-gray-700 leading-relaxed">
                  We make AI easy to understand regardless of your background,
                  from the fundamentals to building complex agents.
                </p>
                <p className="text-sm text-gray-700 leading-relaxed mt-2">
                  Unlimited FREE Tech Support 🤝
                </p>
              </div>

              {/* Step-by-Step Path */}
              <div className="mb-8">
                <h2 className="text-base lg:text-xl font-bold text-gray-900 mb-4">
                  Step-by-Step Path to Monetization:
                </h2>
                <ul className="space-y-3">
                  <li className="text-gray-700 flex items-start text-sm lg:text-base">
                    <span className="mr-2">•</span>
                    <span>
                      Agent Zero: Beginner's guide to AI, automation, and
                      agents.
                    </span>
                  </li>
                  <li className="text-gray-700 flex items-start text-sm lg:text-base">
                    <span className="mr-2">•</span>
                    <span>
                      10 Hours to 10 Seconds: Identify, design, and build
                      time-saving automations.
                    </span>
                  </li>
                  <li className="text-gray-700 flex items-start text-sm lg:text-base">
                    <span className="mr-2">•</span>
                    <span>
                      One Person AI Automation Agency: Building a scalable AI
                      business.
                    </span>
                  </li>
                  <li className="text-gray-700 flex items-start text-sm lg:text-base">
                    <span className="mr-2">•</span>
                    <span>
                      Subs to Sales: Fuel your AI business with content.
                    </span>
                  </li>
                  <li className="text-gray-700 flex items-start text-sm lg:text-base">
                    <span className="mr-2">•</span>
                    <span>Weekly Q&A with Nate</span>
                  </li>
                </ul>
              </div>

              {/* Real Opportunities */}
              <div className="mb-8">
                <h2 className="text-xl lg:text-xl font-bold text-gray-900 mb-4">
                  Real Opportunities
                </h2>
                <ul className="space-y-3">
                  <li className="text-gray-700 flex items-start text-sm lg:text-base">
                    <span className="mr-2">•</span>
                    <span>AI Job & Client Opportunities</span>
                  </li>
                  <li className="text-gray-700 flex items-start text-sm lg:text-base">
                    <span className="mr-2">•</span>
                    <span>Expert Guest Speakers</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Right - About Preview Card */}
      <div className="hidden bg-white lg:block w-80 mt-4">
        <div className="bg-white rounded-lg border shadow">
          <div className="rounded-t-lg overflow-hidden mb-3">
            <Image
              src={"/laptop.jpg"}
              alt="About"
              width={320}
              height={200}
              className="w-full h-32 object-cover"
            />
          </div>
          <div className="px-4 pb-4">
            <h3 className="text-sm font-bold text-gray-900 mb-2">About</h3>
            <p className="text-xs text-gray-primary leading-relaxed mb-3">
              A community built to master no-code AI automations. Join to learn,
              discuss, and build the systems that will shape the future of work.
            </p>
            <div className="space-y-3">
              <Link
                href="#"
                className="text-orange-primary hover:text-orange-600 text-xs font-semibold flex items-center gap-1 group"
              >
                Start Now
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9.75 8.2501L15.9 2.1001"
                    stroke="#E85231"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16.5004 5.1V1.5H12.9004"
                    stroke="#E85231"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8.25 1.5H6.75C3 1.5 1.5 3 1.5 6.75V11.25C1.5 15 3 16.5 6.75 16.5H11.25C15 16.5 16.5 15 16.5 11.25V9.75"
                    stroke="#E85231"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <Link
                href="#"
                className="text-orange-primary hover:text-orange-600 text-xs font-semibold flex items-center gap-1 group"
              >
                Buy My New Program
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9.75 8.2501L15.9 2.1001"
                    stroke="#E85231"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16.5004 5.1V1.5H12.9004"
                    stroke="#E85231"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8.25 1.5H6.75C3 1.5 1.5 3 1.5 6.75V11.25C1.5 15 3 16.5 6.75 16.5H11.25C15 16.5 16.5 15 16.5 11.25V9.75"
                    stroke="#E85231"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <Link
                href="#"
                className="text-orange-primary hover:text-orange-600 text-xs font-semibold flex items-center gap-1 group"
              >
                See my biography
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9.75 8.2501L15.9 2.1001"
                    stroke="#E85231"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16.5004 5.1V1.5H12.9004"
                    stroke="#E85231"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8.25 1.5H6.75C3 1.5 1.5 3 1.5 6.75V11.25C1.5 15 3 16.5 6.75 16.5H11.25C15 16.5 16.5 15 16.5 11.25V9.75"
                    stroke="#E85231"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
            <div className="flex items-center justify-between gap-10 mt-8">
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-bold text-icon-black">120K</span>
                <span className="text-xs text-gray-primary">members</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-bold text-icon-black">13</span>
                <span className="text-xs text-gray-primary">online</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-bold text-icon-black">12K</span>
                <span className="text-xs text-gray-primary">followers</span>
              </div>
            </div>
            <Button className="w-full bg-orange-primary text-xs hover:bg-orange-primary/90 cursor-pointer font-semibold text-white mt-6 h-[45px] rounded-[16px]">
              Join For{" "}
              {community.price && community.currency
                ? formatPrice(Number(community.price), community.currency)
                : "Free"}
            </Button>
            <Button className="w-full text-black bg-[#F4F4F6] text-xs hover:bg-[#bbbbc4] cursor-pointer font-semibold mt-3 h-[45px] rounded-[16px]">
              Share
            </Button>
            <div className="w-full border-t border-t-[#CBCFD4] mt-4 p-2 pt-4 flex items-center gap-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 10V8C6 4.69 7 2 12 2C17 2 18 4.69 18 8V10"
                  stroke="#485057"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 18.5C13.3807 18.5 14.5 17.3807 14.5 16C14.5 14.6193 13.3807 13.5 12 13.5C10.6193 13.5 9.5 14.6193 9.5 16C9.5 17.3807 10.6193 18.5 12 18.5Z"
                  stroke="#485057"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17 22H7C3 22 2 21 2 17V15C2 11 3 10 7 10H17C21 10 22 11 22 15V17C22 21 21 22 17 22Z"
                  stroke="#485057"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex flex-col">
                <div className="text-xs font-semibold text-icon-black">
                  Private Community
                </div>
                <div className="text-[10px] text-gray-primary ">
                  This community is visible to members only
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
