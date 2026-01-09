"use client"

import { useState, useEffect, useTransition, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import Image from "next/image"
import { Tables } from "@/database.types"
import { formatPrice, formatMemberCount } from "@/utils/communities"

interface CommunitiesListProps {
  initialCommunities: Tables<"communities">[]
  initialQuery?: string
  initialPage?: number
}

export default function CommunitiesList({
  initialCommunities,
  initialQuery = "",
  initialPage = 1,
}: CommunitiesListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const itemsPerPage = 9 // 3x3 grid

  // Calculate pagination
  const totalPages = Math.ceil(initialCommunities.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentCommunities = initialCommunities.slice(startIndex, endIndex)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 500) // 500ms delay

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Update URL when debounced query changes
  useEffect(() => {
    if (debouncedQuery !== initialQuery) {
      const params = new URLSearchParams(searchParams.toString())
      if (debouncedQuery) {
        params.set("q", debouncedQuery)
      } else {
        params.delete("q")
      }
      params.delete("page") // Reset to page 1

      startTransition(() => {
        router.push(`?${params.toString()}`, { scroll: false })
      })
    }
  }, [debouncedQuery, router, searchParams, initialQuery])

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage > 3) {
        pages.push("ellipsis-start")
      }

      // Show current page and neighbors
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis-end")
      }

      // Always show last page
      pages.push(totalPages)
    }

    return pages
  }

  // Update search query (debounced update to URL)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)

    // Update URL with page param
    const params = new URLSearchParams(searchParams.toString())
    if (page > 1) {
      params.set("page", page.toString())
    } else {
      params.delete("page")
    }

    startTransition(() => {
      router.push(`?${params.toString()}`)
    })

    // Scroll to top of communities section
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Sync state with URL params
  useEffect(() => {
    const query = searchParams.get("q") || ""
    const page = Number(searchParams.get("page")) || 1

    setSearchQuery(query)
    setCurrentPage(page)
  }, [searchParams])

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-[#FEF0E7]  text-[#F7670E]">
            Beginnings
          </Badge>
          <h1 className="text-4xl sm:text-5xl  font-bold text-neutral-900 mb-4">
            Build skills. Or build income.
          </h1>
          <p className="text-lg text-neutral-600 mb-8">
            Join outcome-driven communities or{" "}
            <Link href="/create-community" className="text-orange-500 hover:underline">
              Create Yours Now
            </Link>
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search what you want to improve"
                className="pl-12 py-6 text-base rounded-lg font-normal  border-0 shadow-none focus:border-orange-500 focus:ring-orange-500"
                value={searchQuery}
                onChange={handleSearchChange}
                disabled={isPending}
              />
              {isPending && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-5 w-5 border-2 border-orange-500 border-t-transparent rounded-full" />
                </div>
              )}
            </div>
            {searchQuery && !isPending && (
              <p className="text-sm text-neutral-500 mt-2">
                Found {initialCommunities.length} {initialCommunities.length === 1 ? "community" : "communities"}
              </p>
            )}
          </div>
        </div>

        {/* Communities Grid */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10 justify-items-center transition-opacity ${isPending ? "opacity-50" : "opacity-100"
            }`}
        >
          {currentCommunities.map((community) => (
            <Link
              key={community.id}
              href={`/communities/${community.slug}`}
              className="w-full max-w-[400px]"
            >
              <Card className="hover:shadow-lg transition-shadow shadow-none cursor-pointer h-full bg-white rounded-t-[15px] pt-0 w-full max-h-[344px]">
                <div className="relative h-48 rounded-t-lg ">
                  {/* Placeholder for community image */}
                  <div className="absolute inset-0 flex items-center justify-center ">
                    <Image
                      className="w-full h-full object-cover opacity-50 rounded-t-[15px]"
                      src={community.cover_image || "/community-placeholder.png"}
                      alt={community.name}
                      width={400}
                      height={200}
                    />
                  </div>

                  {/* Community Avatar */}
                  <div className="absolute bg-black w-[44px] text-lg h-[44px] rounded-[10px] flex items-center justify-center text-white  font-semibold bottom-0 left-6 transform translate-y-1/2">
                    {community.avatar || community.name.charAt(0).toUpperCase()}
                  </div>
                </div>

                <CardHeader className=" pt-4 pb-4">
                  <CardTitle className="text-[16px] font-bold text-icon-black mb-2">
                    {community.name}
                  </CardTitle>
                  <CardDescription className="text-[#485057] line-clamp-2">
                    {community.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-start gap-4  font-medium text-[14px] text-[#485057]">
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
                        {community.price
                          ? formatPrice(Number(community.price), "INR")
                          : "Free"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* No Results */}
        {currentCommunities.length === 0 && !isPending && (
          <div className="text-center py-12">
            <p className="text-neutral-500 text-lg">
              {searchQuery
                ? `No communities found matching "${searchQuery}".`
                : "No communities available at the moment."}
            </p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("")
                  setDebouncedQuery("")
                  setCurrentPage(1)
                  const params = new URLSearchParams(searchParams.toString())
                  params.delete("q")
                  params.delete("page")
                  startTransition(() => {
                    router.push(`?${params.toString()}`, { scroll: false })
                  })
                }}
                className="mt-4 text-orange-500 hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {initialCommunities.length > 0 && totalPages > 1 && (
          <div className="mt-12 mb-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    aria-label="Go to previous page"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) {
                        handlePageChange(currentPage - 1)
                      }
                    }}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {getPageNumbers().map((page, index) => (
                  <PaginationItem key={index}>
                    {page === "ellipsis-start" || page === "ellipsis-end" ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        onClick={(e) => {
                          e.preventDefault()
                          handlePageChange(page as number)
                        }}
                        isActive={currentPage === page}
                        className="cursor-pointer rounded-full hover:bg-icon-black hover:text-white"
                      >
                        <div>{page}</div>
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages) {
                        handlePageChange(currentPage + 1)
                      }
                    }}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  )
}

