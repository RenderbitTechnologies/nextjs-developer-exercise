import { Suspense } from "react";
import type { Metadata } from "next";
import { RiSearch2Line } from "@remixicon/react";
import PostGrid from "@/components/post-grid";
import SearchFilters from "@/components/search-filters";
import SearchForm from "@/components/search-form";
import SearchPeople from "@/components/search-people";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  listPopularTags,
  searchPeople,
  searchPublishedPosts,
} from "@/lib/db/queries/search";
import { parseSearchParams, searchHref } from "@/lib/search";
import { getSession } from "@/lib/session";
import { getViewerLikeState } from "@/lib/viewer-likes";

export const instant = false;

type SearchPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    type?: string | string[];
    sort?: string | string[];
    when?: string | string[];
    tag?: string | string[];
    page?: string | string[];
  }>;
};

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const query = parseSearchParams(await searchParams);
  if (!query.q) {
    return { title: "Search · Blogly" };
  }
  return {
    title: `${query.q} · Search · Blogly`,
    description: `Search results for ${query.q} on Blogly.`,
  };
}

function SearchFallback() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-11 rounded-2xl bg-muted" />
      <div className="h-8 w-40 rounded-2xl bg-muted" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-2 p-2">
            <div className="h-75 rounded-2xl bg-muted" />
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-6 w-3/4 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

function resultLabel(total: number, type: "posts" | "people", q: string) {
  const noun =
    type === "people"
      ? total === 1
        ? "person"
        : "people"
      : total === 1
        ? "post"
        : "posts";
  if (q) return `${total} ${noun} for “${q}”`;
  return `${total} ${noun}`;
}

async function SearchResults({
  searchParams,
}: {
  searchParams: SearchPageProps["searchParams"];
}) {
  const query = parseSearchParams(await searchParams);
  const tagsPromise = query.type === "posts" ? listPopularTags() : Promise.resolve([]);

  if (query.type === "people") {
    const [feed, tags] = await Promise.all([searchPeople(query), tagsPromise]);
    return (
      <div className="flex flex-col gap-6">
        <SearchForm q={query.q} type={query.type} sort={query.sort} when={query.when} />
        <SearchFilters query={query} tags={tags} />
        <p className="text-sm text-muted-foreground">
          {resultLabel(feed.total, "people", query.q)}
        </p>
        {feed.items.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <RiSearch2Line />
              </EmptyMedia>
              <EmptyTitle>No people found</EmptyTitle>
              <EmptyDescription>
                {query.q
                  ? "Try a different name or username, or clear a filter."
                  : "No writers match these filters yet."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <SearchPeople
            people={feed.items}
            page={feed.page}
            pageCount={feed.pageCount}
            basePath={searchHref({ ...query, page: 1 })}
          />
        )}
      </div>
    );
  }

  const [feed, session, tags] = await Promise.all([
    searchPublishedPosts(query),
    getSession(),
    tagsPromise,
  ]);
  const likeState = await getViewerLikeState(
    feed.items.map((post) => post.id),
    session,
  );

  return (
    <div className="flex flex-col gap-6">
      <SearchForm q={query.q} type={query.type} sort={query.sort} when={query.when} />
      <SearchFilters query={query} tags={tags} />
      <p className="text-sm text-muted-foreground">
        {resultLabel(feed.total, "posts", query.q)}
        {query.tag ? ` in ${query.tag}` : ""}
      </p>
      {feed.items.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <RiSearch2Line />
            </EmptyMedia>
            <EmptyTitle>No posts found</EmptyTitle>
            <EmptyDescription>
              {query.q || query.tag
                ? "Try another query, tag, or sort order."
                : "No published posts match these filters yet."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <PostGrid
          posts={feed.items}
          page={feed.page}
          pageCount={feed.pageCount}
          basePath={searchHref({ ...query, page: 1 })}
          signedIn={likeState.signedIn}
          likedIds={likeState.likedIds}
        />
      )}
    </div>
  );
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <div className="mx-auto min-h-svh w-full px-4 pb-10 sm:w-9/12 sm:px-0 mt-5">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Search
        </h1>
        <p className="text-sm text-muted-foreground">
          Find posts and writers across Blogly.
        </p>
      </div>
      <Suspense fallback={<SearchFallback />}>
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
