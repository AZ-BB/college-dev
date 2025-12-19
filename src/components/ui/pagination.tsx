import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        `flex mx-1 items-center justify-center border-icon-black ${isActive ? "font-semibold text-icon-black" : "text-[#485057]"} rounded-full w-[32px] h-[32px]`,
        className
      )}
      {...props}
    />
  )
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn(
        "flex items-center justify-center border-[3px] border-icon-black rounded-full",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-center">
        <svg
          width="7"
          height="12"
          viewBox="0 0 7 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.70333 11.41C5.45 11.41 5.19667 11.3167 4.99667 11.1167L0.29 6.41C-0.0966667 6.02333 -0.0966667 5.38333 0.29 4.99667L4.99667 0.29C5.38333 -0.0966666 6.02333 -0.0966666 6.41 0.29C6.79667 0.676667 6.79667 1.31667 6.41 1.70333L2.41 5.70333L6.41 9.70333C6.79667 10.09 6.79667 10.73 6.41 11.1167C6.22333 11.3167 5.97 11.41 5.70333 11.41Z"
            fill="#0E1011"
          />
        </svg>
      </div>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn(
        "flex items-center justify-center border-[3px] border-icon-black rounded-full",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-center">
        <svg
          width="7"
          height="12"
          viewBox="0 0 7 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0.996666 11.41C0.743333 11.41 0.49 11.3167 0.29 11.1167C-0.0966667 10.73 -0.0966667 10.09 0.29 9.70333L4.29 5.70333L0.29 1.70333C-0.0966667 1.31667 -0.0966667 0.676667 0.29 0.29C0.676667 -0.0966666 1.31667 -0.0966666 1.70333 0.29L6.41 4.99667C6.79667 5.38333 6.79667 6.02333 6.41 6.41L1.70333 11.1167C1.50333 11.3167 1.25 11.41 0.996666 11.41Z"
            fill="#0E1011"
          />
        </svg>
      </div>
    </PaginationLink>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
