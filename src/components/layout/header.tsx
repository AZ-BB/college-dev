"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X, Bell, User, LogOut, Settings } from "lucide-react"
import { useState, useEffect } from "react"
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

interface HeaderProps {
  userData: UserData | null
}

export default function Header({ userData: initialUserData }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(initialUserData)
  const router = useRouter()

  const pathname = usePathname()
  const isLandingPage = pathname === "/"

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

      <div className="container mx-auto">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Image
              src="/logo.svg"
              alt="College Logo"
              width={157}
              height={32}
              className="w-auto h-[32px]"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {isLandingPage && landingPageNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-icon-black text-lg hover:text-gray-900 transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Buttons or User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {userData ? (
              <>
                {/* Chat Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-full hover:bg-gray-100 cursor-pointer"
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M29.3327 8.33317V15.1331C29.3327 16.8265 28.7727 18.2532 27.7727 19.2398C26.786 20.2398 25.3593 20.7998 23.666 20.7998V23.2131C23.666 24.1198 22.6527 24.6665 21.906 24.1598L20.6127 23.3065C20.7327 22.8931 20.786 22.4398 20.786 21.9598V16.5332C20.786 13.8132 18.9727 11.9998 16.2527 11.9998H7.19934C7.01267 11.9998 6.83935 12.0132 6.66602 12.0265V8.33317C6.66602 4.93317 8.93268 2.6665 12.3327 2.6665H23.666C27.066 2.6665 29.3327 4.93317 29.3327 8.33317Z"
                      stroke="#0E1011"
                      strokeWidth="1.5"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M20.786 16.5334V21.96C20.786 22.44 20.7327 22.8933 20.6127 23.3066C20.1194 25.2666 18.4927 26.4933 16.2527 26.4933H12.626L8.59935 29.1733C7.99935 29.5867 7.19934 29.1467 7.19934 28.4267V26.4933C5.83934 26.4933 4.70602 26.04 3.91935 25.2533C3.11935 24.4533 2.66602 23.32 2.66602 21.96V16.5334C2.66602 14 4.23935 12.2534 6.66602 12.0267C6.83935 12.0134 7.01267 12 7.19934 12H16.2527C18.9727 12 20.786 13.8134 20.786 16.5334Z"
                      stroke="#0E1011"
                      strokeWidth="1.5"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  {/* Optional: Add notification badge */}
                  {/* <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span> */}
                </Button>
                {/* Notification Bell */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-full hover:bg-gray-100 cursor-pointer"
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

                  {/* Optional: Add notification badge */}
                  {/* <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span> */}
                </Button>

                {/* User Avatar Dropdown */}
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative ml-2 h-8 w-8 rounded-full p-0 cursor-pointer"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={userData.avatar_url || ""}
                          alt={userData.first_name || userData.email}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-orange-500 text-white">
                          {userData.first_name
                            ? userData.first_name.charAt(0).toUpperCase()
                            : userData.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
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
                  className="bg-white font-semibold"
                  asChild
                >
                  <Link href="/login">Log In</Link>
                </Button>
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white"
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
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200">
            <div className="flex flex-col gap-4 py-4">
              {isLandingPage && landingPageNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-600 hover:text-gray-900 transition-colors font-medium px-4"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {userData ? (
                <div className="flex flex-col gap-3 px-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3 py-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={userData.avatar_url || ""}
                        alt={userData.first_name || userData.email}
                      />
                      <AvatarFallback className="bg-orange-500 text-white">
                        {userData.first_name
                          ? userData.first_name.charAt(0).toUpperCase()
                          : userData.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
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
                    className="flex items-center gap-2 py-2 text-gray-600 hover:text-gray-900"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 py-2 text-gray-600 hover:text-gray-900"
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
                    className="flex-1 text-gray-900 hover:bg-gray-100 hover:text-gray-900"
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
