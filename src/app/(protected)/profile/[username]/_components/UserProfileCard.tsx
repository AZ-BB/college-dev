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
import Link from "next/link"
import LikeDislikeIcon from "@/components/icons/like-dislike"
import ClockIcon from "@/components/icons/clock"

export default function UserProfileCard({ user, isUserProfile }: { user: UserProfile, isUserProfile: boolean }) {
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
        <div className="w-full sm:border sm:border-gray-200 sm:shadow-[0px_3px_6px_0px_#00000014] p-6 rounded-[20px] flex flex-col gap-5">
          <div>
            <Avatar className="w-40 h-40 rounded-2xl">
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
              @{user.username}
            </p>
            {/* Max ~50 words */}
            <div className="w-full">
              <p className="text-base text-[#65707A] font-medium w-full line-clamp-2">
                {user.bio || "No bio"}
              </p>
              {user.bio && user.bio.length > 50 && (
                <button
                  onClick={() => setIsDialogOpen(true)}
                  className="text-sm font-bold text-orange-500 mt-1 hover:underline focus:outline-none"
                >
                  Show more
                </button>
              )}
            </div>
          </div>

          <div className="w-full flex flex-col gap-3">


            <div className="flex items-center gap-2">
              <LikeDislikeIcon />

              <p className="text-sm text-[#65707A] font-medium">
                {user.contributions_count || 0} Contributions
              </p>
            </div>

            <div className="flex items-center gap-2">
              <CalendarIcon />

              <p className="text-sm text-[#65707A] font-medium">
                joined {format(new Date(user.created_at || ""), "MMM d, yyyy")}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <ClockIcon />

              <p className="text-sm text-[#65707A] font-medium">
                Active {10}d ago
              </p>
            </div>

          </div>


          {
            isUserProfile && (
              <div className="w-full flex flex-col gap-2">
                <Link href={`/settings/details`}>
                  <Button
                    variant="default"
                    className="w-full rounded-xl bg-gray-200 text-gray-900 py-6 font-semibold text-base"
                  >
                    Edit Profile
                  </Button>
                </Link>
              </div>
            )
          }

          {/* Social Links */}
          <div className="w-full flex items-center gap-3 justify-center py-1">
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
              </div>
              <p className="text-sm text-[#65707A] font-medium">
                @{user.username}
              </p>
              <div className="mt-1 w-full">
                <p className="text-sm text-[#65707A] leading-relaxed line-clamp-1">
                  {user.bio || "No bio"}
                </p>
                <button
                  onClick={() => setIsDialogOpen(true)}
                  className="text-sm font-bold text-orange-500 mt-1 hover:underline focus:outline-none"
                >
                  Show more
                </button>
              </div>
            </div>
          </div>

          {
            isUserProfile && (
              <div className="w-full flex flex-col gap-2">
                <Link href={`/settings/details`}>
                  <Button
                    variant="default"
                    className="w-full rounded-xl bg-gray-200 text-gray-900 py-6 font-semibold text-base"
                  >
                    Edit Profile
                  </Button>
                </Link>
              </div>
            )
          }
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
                  <WebsiteIcon />
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
                  <InstagramIcon />
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
                  <TwitterIcon />
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
                  <FacebookIcon />
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
