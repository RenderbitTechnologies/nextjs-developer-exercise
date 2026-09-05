import type { ReactNode } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SearchQuery, SearchSort, SearchType, SearchWhen } from "@/lib/search";
import { searchHref } from "@/lib/search";

const TYPES: { value: SearchType; label: string }[] = [
  { value: "posts", label: "Posts" },
  { value: "people", label: "People" },
];

const POST_SORTS: { value: SearchSort; label: string }[] = [
  { value: "relevant", label: "Relevant" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "popular", label: "Most liked" },
  { value: "discussed", label: "Most discussed" },
];

const PEOPLE_SORTS: { value: SearchSort; label: string }[] = [
  { value: "relevant", label: "Relevant" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "popular", label: "Most published" },
];

const WHENS: { value: SearchWhen; label: string }[] = [
  { value: "any", label: "Any time" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "year", label: "This year" },
];

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Button
      size="sm"
      variant={active ? "default" : "outline"}
      nativeButton={false}
      render={<Link href={href} />}
    >
      {children}
    </Button>
  );
}

export default function SearchFilters({
  query,
  tags = [],
}: {
  query: SearchQuery;
  tags?: { tag: string; count: number }[];
}) {
  const sorts = query.type === "people" ? PEOPLE_SORTS : POST_SORTS;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {TYPES.map((item) => (
          <FilterLink
            key={item.value}
            active={query.type === item.value}
            href={searchHref({
              ...query,
              type: item.value,
              tag: item.value === "people" ? null : query.tag,
              page: 1,
            })}
          >
            {item.label}
          </FilterLink>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground">Sort</p>
        <div className="flex flex-wrap gap-2">
          {sorts.map((item) => (
            <FilterLink
              key={item.value}
              active={query.sort === item.value}
              href={searchHref({ ...query, sort: item.value, page: 1 })}
            >
              {item.label}
            </FilterLink>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground">
          {query.type === "people" ? "Joined" : "Published"}
        </p>
        <div className="flex flex-wrap gap-2">
          {WHENS.map((item) => (
            <FilterLink
              key={item.value}
              active={query.when === item.value}
              href={searchHref({ ...query, when: item.value, page: 1 })}
            >
              {item.label}
            </FilterLink>
          ))}
        </div>
      </div>

      {query.type === "posts" && tags.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">Tags</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((item) => {
              const active = query.tag === item.tag;
              return (
                <Badge
                  key={item.tag}
                  variant={active ? "default" : "outline"}
                  render={
                    <Link
                      href={searchHref({
                        ...query,
                        tag: active ? null : item.tag,
                        page: 1,
                      })}
                    />
                  }
                >
                  {item.tag}
                </Badge>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
