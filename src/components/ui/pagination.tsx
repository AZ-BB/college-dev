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
  React.ComponentProps<"div">

function PaginationLink({
  className,
  isActive,
  size = "icon",
  children,
  ...props
}: PaginationLinkProps) {
  return (
    <div
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        `flex mx-1 items-center justify-center rounded-full w-[32px] h-[32px]`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function PaginationNumber({
  className,
  isActive,
  children,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink className={cn("w-[32px] h-[32px] cursor-pointer  rounded-[8px] hover:bg-grey-200 hover:text-grey-900 transition-all duration-300", isActive ? "text-grey-900 bg-grey-200 font-semibold" : "bg-transparent text-grey-700", className)} {...props} >
      {children}
    </PaginationLink>
  )
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  const isDisabled = props["aria-disabled"] === true || props["aria-disabled"] === "true"
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn(
        `flex items-center justify-center w-8 h-8 border-2 border-grey-900 cursor-pointer hover:bg-grey-200 hover:text-grey-900 transition-all duration-300`,
        isDisabled && "border-grey-400 text-grey-400 cursor-not-allowed hover:bg-transparent",
        className
      )}
      {...props}
    >
      <ChevronLeftIcon className={cn("size-6 text-grey-900", isDisabled && "text-grey-400")} />
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  const isDisabled = props["aria-disabled"] === true || props["aria-disabled"] === "true"
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn(
        `flex items-center justify-center w-8 h-8 border-2 border-grey-900 cursor-pointer hover:bg-grey-200 hover:text-grey-900 transition-all duration-300`,
        isDisabled && "border-grey-400 text-grey-400 cursor-not-allowed hover:bg-transparent",
        className
      )}
      {...props}
    >
      <ChevronRightIcon className={cn("size-6 text-grey-900", isDisabled && "text-grey-400")} />
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
      <MoreHorizontalIcon className="size-4 text-grey-700" />
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
  PaginationNumber,
}
