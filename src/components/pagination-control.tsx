"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationNext, PaginationNumber, PaginationPrevious } from "./ui/pagination";

export default function PaginationControl({
    currentPage,
    maxPages,
}: {
    currentPage: number;
    maxPages: number;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        if (page > 1) {
            params.set("page", page.toString());
        } else {
            params.delete("page");
        }
        router.push(`?${params.toString()}`);
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            handlePageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < maxPages) {
            handlePageChange(currentPage + 1);
        }
    };

    // Generate page numbers to display
    const getPageNumbers = (): (number | "ellipsis")[] => {
        const pages: (number | "ellipsis")[] = [];

        if (maxPages <= 4) {
            // Show all pages if total is 4 or less
            for (let i = 1; i <= maxPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage > 3) {
                pages.push("ellipsis");
            }

            // Show current page and neighbors
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(maxPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < maxPages - 2) {
                pages.push("ellipsis");
            }

            // Always show last page
            pages.push(maxPages);
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();
    const isPreviousDisabled = currentPage <= 1;
    const isNextDisabled = currentPage >= maxPages;

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        aria-disabled={isPreviousDisabled}
                        onClick={(e) => {
                            e.preventDefault();
                            if (!isPreviousDisabled) {
                                handlePrevious();
                            }
                        }}
                    />
                </PaginationItem>

                {pageNumbers.map((page, index) => {
                    if (page === "ellipsis") {
                        return (
                            <PaginationItem key={`ellipsis-${index}`}>
                                <PaginationEllipsis />
                            </PaginationItem>
                        );
                    }

                    return (
                        <PaginationItem key={page}>
                            <PaginationNumber
                                isActive={page === currentPage}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handlePageChange(page);
                                }}
                            >
                                <div>{page}</div>
                            </PaginationNumber>
                        </PaginationItem>
                    );
                })}

                <PaginationItem>
                    <PaginationNext
                        aria-disabled={isNextDisabled}
                        onClick={(e) => {
                            e.preventDefault();
                            if (!isNextDisabled) {
                                handleNext();
                            }
                        }}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}