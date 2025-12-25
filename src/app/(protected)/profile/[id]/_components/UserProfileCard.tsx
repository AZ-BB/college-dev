"use client"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Tables } from "@/database.types"
import { formatFullName } from "@/lib/utils"
import { format } from "date-fns"
import { useEffect, useState } from "react"
import { Calendar } from "lucide-react"
import { UserData } from "@/utils/get-user-data"
import { UserProfile } from "@/action/profile"
import WebsiteIcon from "@/components/icons/website"
import InstagramIcon from "@/components/icons/instagram"
import TwitterIcon from "@/components/icons/twitter"
import FacebookIcon from "@/components/icons/facebook"
import CalendarIcon from "@/components/icons/calendar"

export default function UserProfileCard({ user }: { user: UserProfile }) {
  const [isMobile, setIsMobile] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return (
    <>
      {!isMobile ? (
        // DESKTOP
        <div className="w-full  sm:shadow-md p-6 rounded-3xl flex flex-col gap-5">
          <div>
            <Avatar className="w-28 h-28 rounded-2xl">
              <AvatarImage
                className="object-cover"
                src={user.avatar_url || ""}
              />
              <AvatarFallback className="text-4xl font-bold rounded-2xl text-white">
                {user.first_name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="w-full space-y-2">
            <h1 className="text-2xl font-bold">
              {formatFullName(user.first_name || "", user.last_name || "")}
            </h1>
            <p className="text-base text-[#65707A] font-semibold tracking-wide">
              {user.email}
            </p>
            {/* Max ~50 words */}
            <div className="w-full">
              <p className="text-base text-[#65707A] font-medium w-full line-clamp-3">
                {user.bio || "No bio"}
              </p>
              {user.bio && user.bio.length > 150 && (
                <button
                  onClick={() => setIsDialogOpen(true)}
                  className="text-sm font-bold text-[#F7670E] mt-1 hover:underline focus:outline-none"
                >
                  Show more
                </button>
              )}
            </div>
          </div>

          <Badge className="bg-[#E8FDF3] flex items-center gap-2 py-1">
            <div className="w-3 h-3 rounded-full bg-[#0DA55E]" />
            <p className="text-sm text-[#0DA55E] font-semibold tracking-wide">
              Online now
            </p>
          </Badge>

          <div className="w-full flex items-center gap-2">
            <CalendarIcon />

            <p className="text-sm text-[#65707A] font-medium">
              joined {format(new Date(user.created_at || ""), "MMM d, yyyy")}
            </p>
          </div>

          <div className="flex items-center gap-2 justify-start">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight">
                {user.contributions_count || 0}
              </span>
              <span className="text-sm text-[#65707A] font-medium">
                Contributions
              </span>
            </div>
          </div>
          {/* Social Links */}
          <div className="w-full flex items-center gap-3 justify-start py-1">
            {/* Website Link */}
            {user.website_url && (
              <a href={user.website_url} target="_blank" rel="noopener noreferrer">
                <WebsiteIcon />
              </a>
            )}
            {/* Instagram Link */}
            {user.instagram_url && (
              <a href={user.instagram_url} target="_blank" rel="noopener noreferrer">
                <InstagramIcon />
              </a>
            )}
            {/* Twitter/X Link */}
            {user.x_url && (
              <a href={user.x_url} target="_blank" rel="noopener noreferrer">
                <TwitterIcon />
              </a>
            )}
            {/* Facebook Link */}
            {user.facebook_url && (
              <a href={user.facebook_url} target="_blank" rel="noopener noreferrer">
                <FacebookIcon />
              </a>
            )}
          </div>

          <div className="w-full flex flex-col gap-2">
            <Button
              variant="default"
              className="w-full bg-[#F7670E] text-white py-6 font-semibold text-base hover:bg-[#F7670E]/90"
            >
              Follow
            </Button>

            <Button
              variant="default"
              className="w-full py-6 font-semibold text-base"
            >
              Chat
            </Button>
          </div>
        </div>
      ) : (
        // MOBILE
        <div className="w-full flex flex-col gap-8 p-4 bg-white">
          {/* Header: Avatar, Name, Status, Username, Bio */}
          <div className="flex gap-4">
            <div className="shrink-0">
              <Avatar className="w-20 h-20 rounded-2xl">
                <AvatarImage
                  className="object-cover"
                  src={user.avatar_url || ""}
                />
                <AvatarFallback className="text-4xl font-bold rounded-2xl text-white">
                  {user.first_name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold truncate">
                  {formatFullName(user.first_name || "", user.last_name || "")}
                </h1>
                <div className="flex items-center gap-1.5 bg-[#E8FDF3] text-[#0DA55E] px-2 py-0.5 rounded-full font-medium text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0DA55E]" />
                  Online
                </div>
              </div>
              <p className="text-sm text-[#65707A] font-medium">
                {user.email || "No email"}
              </p>
              <div className="mt-1 w-full">
                <p className="text-sm text-[#65707A] leading-relaxed line-clamp-1">
                  {user.bio || "No bio"}
                </p>
                <button
                  onClick={() => setIsDialogOpen(true)}
                  className="text-sm font-bold text-[#F7670E] mt-1 hover:underline focus:outline-none"
                >
                  Show more
                </button>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight">
                {user.contributions_count || 0}
              </span>
              <span className="text-sm text-[#65707A] font-medium">
                Contributions
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight">
                {user.followers_count || 0}
              </span>
              <span className="text-sm text-[#65707A] font-medium">
                Followers
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight">
                {user.following_count || 0}
              </span>
              <span className="text-sm text-[#65707A] font-medium">
                Following
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              variant="default"
              className="w-full bg-[#F7670E] text-white py-7 rounded-[20px] font-bold text-lg hover:bg-[#F7670E]/90 shadow-none border-none"
            >
              Follow
            </Button>
            <Button
              variant="secondary"
              className="w-full py-7 rounded-[20px] font-bold text-lg bg-[#F2F4F7] text-[#0A0D12] hover:bg-[#EAECF0] shadow-none border-none"
            >
              Chat
            </Button>
          </div>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[400px] p-8 rounded-[32px] gap-6 border-none shadow-xl bg-white text-black"
        >
          <DialogHeader className="flex flex-col items-start gap-4">
            <Avatar className="w-16 h-16 rounded-2xl">
              <AvatarImage
                className="object-cover"
                src={user.avatar_url || ""}
              />
              <AvatarFallback className="text-2xl font-bold rounded-2xl text-white bg-gray-400">
                {user.first_name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1 items-start text-left">
              <DialogTitle className="text-2xl font-bold">
                {formatFullName(user.first_name || "", user.last_name || "")}
              </DialogTitle>
              <DialogDescription className="text-base text-[#65707A] font-medium">
                {user.email || "No email"}
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="flex flex-col gap-6">
            <p className="text-base text-[#0A0D12] font-medium leading-relaxed">
              {user.bio || "No bio"}
            </p>

            <div className="flex items-center gap-2 text-[#65707A]">
              <Calendar className="w-5 h-5" />
              <span className="text-base font-medium">
                Joined {format(new Date(user.created_at || ""), "MMM d, yyyy")}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Website Link */}
              {user.website_url && (
                <a
                  href={user.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-70 transition-opacity"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.9902 17.5H16.5002C19.5202 17.5 22.0002 15.03 22.0002 12C22.0002 8.98 19.5302 6.5 16.5002 6.5H14.9902"
                      stroke="#292D32"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 6.5H7.5C4.47 6.5 2 8.97 2 12C2 15.02 4.47 17.5 7.5 17.5H9"
                      stroke="#292D32"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 12H16"
                      stroke="#292D32"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              )}
              {/* Instagram */}
              {user.instagram_url && (
                <a
                  href={user.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-70 transition-opacity"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
                      stroke="#292D32"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5Z"
                      stroke="#292D32"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M17.6361 7H17.6477"
                      stroke="#292D32"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              )}
              {/* Twitter/X */}
              {user.x_url && (
                <a
                  href={user.x_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-70 transition-opacity"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <mask
                      id="mask0_dialog"
                      style={{ maskType: "luminance" }}
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                      width="20"
                      height="20"
                    >
                      <path d="M0 0H20V20H0V0Z" fill="white" />
                    </mask>
                    <g mask="url(#mask0_dialog)">
                      <path
                        d="M15.75 0.937012H18.8171L12.1171 8.61415L20 19.0627H13.8286L8.99143 12.727L3.46286 19.0627H0.392857L7.55857 10.8484L0 0.93844H6.32857L10.6943 6.72844L15.75 0.937012ZM14.6714 17.2227H16.3714L5.4 2.6813H3.57714L14.6714 17.2227Z"
                        fill="black"
                      />
                    </g>
                  </svg>
                </a>
              )}
              {/* Facebook */}
              {user.facebook_url && (
                <a
                  href={user.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-70 transition-opacity"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M17 2H14C12.6739 2 11.4021 2.52678 10.4645 3.46447C9.52678 4.40215 9 5.67392 9 7V10H6V14H9V22H13V14H16L17 10H13V7C13 6.73478 13.1054 6.48043 13.2929 6.29289C13.4804 6.10536 13.7348 6 14 6H17V2Z"
                      stroke="black"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              )}
            </div>

            <Button
              onClick={() => setIsDialogOpen(false)}
              className="w-full py-7 rounded-[20px] font-bold text-lg bg-[#F2F4F7] text-[#0A0D12] hover:bg-[#EAECF0] shadow-none border-none mt-2"
            >
              Okay
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
