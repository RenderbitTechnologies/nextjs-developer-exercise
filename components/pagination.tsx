import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  totalItems?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  totalItems,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  // Build target URL preserving other search params or just setting ?page=X
  // Since we only do simple pagination, a simple helper is perfect:
  const getPageUrl = (page: number) => {
    const separator = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${separator}page=${page}`;
  };

  return (
    <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">
      <div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Showing page <span className="font-semibold text-zinc-900 dark:text-zinc-100">{currentPage}</span> of{" "}
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{totalPages}</span>
          {totalItems !== undefined && (
            <>
              {" "}
              (<span className="font-semibold text-zinc-900 dark:text-zinc-100">{totalItems}</span> total posts)
            </>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {hasPrev ? (
          <Link href={getPageUrl(currentPage - 1)}>
            <Button variant="outline" size="sm" className="font-semibold focus-visible:ring-primary select-none">
              ← Previous
            </Button>
          </Link>
        ) : (
          <Button variant="outline" size="sm" className="font-semibold select-none" disabled>
            ← Previous
          </Button>
        )}
        
        {hasNext ? (
          <Link href={getPageUrl(currentPage + 1)}>
            <Button variant="outline" size="sm" className="font-semibold focus-visible:ring-primary select-none">
              Next →
            </Button>
          </Link>
        ) : (
          <Button variant="outline" size="sm" className="font-semibold select-none" disabled>
            Next →
          </Button>
        )}
      </div>
    </div>
  );
}
