"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X, Bell, User, LogOut, Settings, ChevronDown, Check } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { UserData } from "@/utils/get-user-data"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createSupabaseBrowserClient } from "@/utils/supabase-browser"
import { usePathname, useRouter } from "next/navigation"
import UserAvatar from "../user-avatart"
import { useUserCommunities } from "@/hooks/use-user-communities"
import { useNotifications } from "@/hooks/use-notifications"
import { formatDistanceToNow } from "date-fns"

interface HeaderProps {
  userData: UserData | null
}

export default function Header({ userData: initialUserData }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(initialUserData)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const router = useRouter()

  const pathname = usePathname()
  const isLandingPage = pathname === "/"
  const { communities, loading } = useUserCommunities(userData)
  const { notifications, unreadCount, loading: notificationsLoading, hasMore, loadMore, resetCount } = useNotifications(userData?.id)

  const currentCommunitySlug = useMemo(() => {
    const match = pathname.match(/^\/communities\/([^/]+)/)
    return match?.[1] ?? null
  }, [pathname])

  const selectedCommunity = useMemo(
    () => communities.find((c) => c.slug === currentCommunitySlug) ?? null,
    [communities, currentCommunitySlug]
  )

  // Listen for auth state changes
  useEffect(() => {
    const supabase = createSupabaseBrowserClient()

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && !userData) {
        // If we have a session but no user data, refresh to get it
        router.refresh()
      } else if (!session?.user && userData) {
        // If we lost the session, clear user data
        setUserData(null)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && !userData) {
        // User just logged in, refresh to get server data
        router.refresh()
      } else if (!session?.user && userData) {
        // User just logged out
        setUserData(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [router, userData])

  // Update local state when prop changes
  useEffect(() => {
    setUserData(initialUserData)
  }, [initialUserData])

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    setUserData(null)
    router.push("/")
    router.refresh()
  }

  const landingPageNavLinks = [
    { href: "#community", label: "Community" },
    { href: "#learn", label: "Learn" },
    { href: "#usecase", label: "Use Case" },
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
  ]

  return (
    <header className="sticky top-0 z-50 max-w-7xl mx-auto bg-white/95 backdrop-blur">

      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          {userData ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 font-bold text-lg hover:bg-grey-200 transition-colors cursor-pointer p-1 rounded-md"
                >
                  {selectedCommunity ? (
                    <>
                      <Avatar className="h-8 w-8 shrink-0 rounded-md">
                        <AvatarImage
                          src={selectedCommunity.avatar || ""}
                          alt={selectedCommunity.name}
                          className="rounded-md"
                        />
                        <AvatarFallback className="rounded-md bg-grey-900 text-white">
                          {selectedCommunity.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-grey-900 truncate max-w-[140px]">
                        {selectedCommunity.name}
                      </span>
                    </>
                  ) : (
                    <Image
                      src="/logo.svg"
                      alt="College Logo"
                      width={157}
                      height={32}
                      className="w-auto h-[32px]"
                    />
                  )}
                  <ChevronDown className="h-4 w-4 text-grey-600 shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                {loading ? (
                  <div className="py-4 px-3 text-sm text-grey-600">
                    Loading communities...
                  </div>
                ) : communities.length === 0 ? (
                  <DropdownMenuItem asChild>
                    <Link
                      href="/communities"
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <span>No communities yet</span>
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  communities.map((community) => {
                    const isSelected = community.slug === currentCommunitySlug
                    return (
                      <DropdownMenuItem
                        key={community.id}
                        className="cursor-pointer"
                        onClick={() => router.push(`/communities/${community.slug}`)}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <Avatar className="h-8 w-8 shrink-0 rounded-lg">
                            <AvatarImage
                              src={community.avatar || ""}
                              alt={community.name}
                              className="rounded-lg"
                            />
                            <AvatarFallback className="rounded-lg bg-grey-200 text-grey-700">
                              {community.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span
                            className={
                              isSelected ? "font-semibold text-grey-900" : ""
                            }
                          >
                            {community.name}
                          </span>
                          {isSelected && (
                            <span className="ml-auto text-orange-500"><Check className="w-4 h-4" /></span>
                          )}
                        </div>
                      </DropdownMenuItem>
                    )
                  })
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <Image
                src="/logo.svg"
                alt="College Logo"
                width={157}
                height={32}
                className="w-auto h-[32px]"
              />
            </Link>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {isLandingPage && landingPageNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-icon-black text-lg hover:text-grey-900 transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Buttons or User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {userData ? (
              <>

                {/* Notification Bell */}
                <DropdownMenu modal={false} open={notificationsOpen} onOpenChange={(open) => {
                  setNotificationsOpen(open)
                  if (open && unreadCount > 0) {
                    resetCount()
                  }
                }}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative rounded-full hover:bg-grey-100 cursor-pointer"
                    >
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M16.0268 3.87988C11.6135 3.87988 8.02678 7.46655 8.02678 11.8799V15.7332C8.02678 16.5465 7.68012 17.7865 7.26678 18.4799L5.73345 21.0265C4.78678 22.5999 5.44012 24.3465 7.17345 24.9332C12.9201 26.8532 19.1201 26.8532 24.8668 24.9332C26.4801 24.3999 27.1868 22.4932 26.3068 21.0265L24.7734 18.4799C24.3734 17.7865 24.0268 16.5465 24.0268 15.7332V11.8799C24.0268 7.47988 20.4268 3.87988 16.0268 3.87988Z"
                          stroke="#0E1011"
                          strokeWidth="1.5"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                        />
                        <path
                          d="M18.4939 4.26643C18.0805 4.14643 17.6539 4.05309 17.2139 3.99976C15.9339 3.83976 14.7072 3.93309 13.5605 4.26643C13.9472 3.27976 14.9072 2.58643 16.0272 2.58643C17.1472 2.58643 18.1072 3.27976 18.4939 4.26643Z"
                          stroke="#0E1011"
                          strokeWidth="1.5"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M20.0273 25.4136C20.0273 27.6136 18.2273 29.4136 16.0273 29.4136C14.934 29.4136 13.9207 28.9602 13.2007 28.2402C12.4807 27.5202 12.0273 26.5069 12.0273 25.4136"
                          stroke="#0E1011"
                          strokeWidth="1.5"
                          strokeMiterlimit="10"
                        />
                      </svg>

                      {/* Notification badge */}
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-orange-500 text-white text-xs font-semibold rounded-full flex items-center justify-center px-1">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 max-h-[480px] overflow-y-auto">
                    <DropdownMenuLabel>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-semibold">Notifications</span>
                        {notifications.length > 0 && (
                          <span className="text-xs text-grey-600">{notifications.length} total</span>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {notificationsLoading ? (
                      <div className="py-8 px-4 text-center text-sm text-grey-600">
                        Loading notifications...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="py-8 px-4 text-center">
                        <Bell className="mx-auto h-12 w-12 text-grey-300 mb-2" />
                        <p className="text-sm text-grey-600">No notifications yet</p>
                        <p className="text-xs text-grey-500 mt-1">
                          We'll notify you when something happens
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="max-h-[400px] overflow-y-auto">
                          {notifications.map((notification) => {
                            // Convert UTC to local time - add Z if not present
                            const utcTime = notification.created_at.endsWith('Z') ? notification.created_at : `${notification.created_at}Z`
                            const localDate = new Date(utcTime)
                            const timeAgo = formatDistanceToNow(localDate, { addSuffix: true })
                            
                            return (
                              <DropdownMenuItem
                                key={notification.id}
                                className="cursor-pointer p-3 focus:bg-grey-50"
                                onClick={() => {
                                  if (notification.url) {
                                    router.push(notification.url)
                                    setNotificationsOpen(false)
                                  }
                                }}
                              >
                                <div className="flex flex-col gap-1 w-full">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm font-medium text-grey-900 line-clamp-2">
                                      {notification.title}
                                    </p>
                                    <span className="text-xs text-grey-500 whitespace-nowrap">
                                      {timeAgo}
                                    </span>
                                  </div>
                                  {notification.message && (
                                    <p className="text-xs text-grey-600 line-clamp-2">
                                      {notification.message}
                                    </p>
                                  )}
                                  {notification.type && (
                                    <span className="text-xs text-grey-500 capitalize">
                                      {notification.type}
                                    </span>
                                  )}
                                </div>
                              </DropdownMenuItem>
                            )
                          })}
                        </div>
                        {hasMore && (
                          <div className="p-2 border-t border-grey-200">
                            <Button
                              variant="ghost"
                              className="w-full text-sm text-grey-700 hover:text-grey-900 hover:bg-grey-50"
                              onClick={(e) => {
                                e.stopPropagation()
                                loadMore()
                              }}
                              disabled={notificationsLoading}
                            >
                              {notificationsLoading ? "Loading..." : "Load More"}
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Avatar Dropdown */}
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative ml-2 h-8 w-8 rounded-full p-0 cursor-pointer"
                    >
                      <UserAvatar
                        className="h-8 w-8"
                        user={userData}
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {userData.first_name && userData.last_name
                            ? `${userData.first_name} ${userData.last_name}`
                            : userData.first_name || "User"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {userData.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/create-community" className="cursor-pointer text-orange-600 font-medium">
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>Create Community</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="cursor-pointer text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  variant="default"
                  className="bg-[#f4f4f6] text-grey-900 rounded-md hover:bg-grey-400 font-semibold"
                  asChild
                >
                  <Link href="/login">Log In</Link>
                </Button>
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-sm"
                  asChild
                >
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-grey-100 rounded-lg transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-grey-200">
            <div className="flex flex-col gap-4 py-4">
              {isLandingPage && landingPageNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-grey-600 hover:text-grey-900 transition-colors font-medium px-4"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {userData ? (
                <div className="flex flex-col gap-3 px-4 pt-4 border-t border-grey-200">
                  <div className="flex items-center gap-3 py-2">
                    <UserAvatar user={userData} className="h-10 w-10" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {userData.first_name && userData.last_name
                          ? `${userData.first_name} ${userData.last_name}`
                          : userData.first_name || "User"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {userData.email}
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 py-2 text-grey-600 hover:text-grey-900"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 py-2 text-grey-600 hover:text-grey-900"
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut()
                      setIsOpen(false)
                    }}
                    className="flex items-center gap-2 py-2 text-red-600 hover:text-red-700"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </button>
                </div>
              ) : (
                <div className="flex gap-3 px-4 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 text-grey-900 hover:bg-grey-100 hover:text-grey-900"
                    asChild
                  >
                    <Link href="/login">Log In</Link>
                  </Button>
                  <Button
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                    asChild
                  >
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
