import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

function pageHref(basePath: string, page: number) {
  if (page <= 1) return basePath;
  const join = basePath.includes("?") ? "&" : "?";
  return `${basePath}${join}page=${page}`;
}

export default function PostPagination({
  basePath,
  page,
  pageCount,
}: {
  basePath: string;
  page: number;
  pageCount: number;
}) {
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1).slice(
    0,
    8,
  );

  return (
    <Pagination className="mt-5">
      <PaginationContent>
        {page > 1 ? (
          <PaginationItem>
            <PaginationPrevious href={pageHref(basePath, page - 1)} />
          </PaginationItem>
        ) : null}
        {pages.map((number) => (
          <PaginationItem key={number}>
            <PaginationLink href={pageHref(basePath, number)} isActive={number === page}>
              {number}
            </PaginationLink>
          </PaginationItem>
        ))}
        {page < pageCount ? (
          <PaginationItem>
            <PaginationNext href={pageHref(basePath, page + 1)} />
          </PaginationItem>
        ) : null}
      </PaginationContent>
    </Pagination>
  );
}
