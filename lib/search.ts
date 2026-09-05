export const SEARCH_TYPES = ["posts", "people"] as const;
export const SEARCH_SORTS = [
  "relevant",
  "newest",
  "oldest",
  "popular",
  "discussed",
] as const;
export const SEARCH_WHENS = ["any", "week", "month", "year"] as const;

export type SearchType = (typeof SEARCH_TYPES)[number];
export type SearchSort = (typeof SEARCH_SORTS)[number];
export type SearchWhen = (typeof SEARCH_WHENS)[number];

export type SearchQuery = {
  q: string;
  type: SearchType;
  sort: SearchSort;
  when: SearchWhen;
  tag: string | null;
  page: number;
};

const SEARCH_TYPE_SET = new Set<string>(SEARCH_TYPES);
const SEARCH_SORT_SET = new Set<string>(SEARCH_SORTS);
const SEARCH_WHEN_SET = new Set<string>(SEARCH_WHENS);

export function defaultSearchSort(q: string): SearchSort {
  return q ? "relevant" : "newest";
}

export function normalizeSearchTag(raw: string | null | undefined) {
  const value = String(raw ?? "")
    .trim()
    .replace(/^#+/, "")
    .toLowerCase()
    .slice(0, 48);
  if (!value) return null;
  return `#${value}`;
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseSearchParams(params: {
  q?: string | string[];
  type?: string | string[];
  sort?: string | string[];
  when?: string | string[];
  tag?: string | string[];
  page?: string | string[];
}): SearchQuery {
  const q = String(firstParam(params.q) ?? "")
    .trim()
    .slice(0, 200);
  const typeRaw = firstParam(params.type);
  const sortRaw = firstParam(params.sort);
  const whenRaw = firstParam(params.when);
  const type: SearchType = SEARCH_TYPE_SET.has(typeRaw ?? "")
    ? (typeRaw as SearchType)
    : "posts";
  const sort: SearchSort = SEARCH_SORT_SET.has(sortRaw ?? "")
    ? (sortRaw as SearchSort)
    : defaultSearchSort(q);
  const when: SearchWhen = SEARCH_WHEN_SET.has(whenRaw ?? "")
    ? (whenRaw as SearchWhen)
    : "any";

  return {
    q,
    type,
    sort: type === "people" && sort === "discussed" ? "popular" : sort,
    when,
    tag: type === "people" ? null : normalizeSearchTag(firstParam(params.tag)),
    page: Math.max(1, Number(firstParam(params.page)) || 1),
  };
}

export function searchHref(query: Partial<SearchQuery> = {}) {
  const q = (query.q ?? "").trim();
  const type = query.type ?? "posts";
  const sort = query.sort ?? defaultSearchSort(q);
  const when = query.when ?? "any";
  const tag = type === "people" ? null : (query.tag ?? null);
  const page = query.page ?? 1;
  const params = new URLSearchParams();

  if (q) params.set("q", q);
  if (type !== "posts") params.set("type", type);
  if (sort !== defaultSearchSort(q)) params.set("sort", sort);
  if (when !== "any") params.set("when", when);
  if (tag) params.set("tag", tag.replace(/^#/, ""));
  if (page > 1) params.set("page", String(page));

  const qs = params.toString();
  return qs ? `/search?${qs}` : "/search";
}

export function likePattern(q: string) {
  return `%${q.replace(/[%_\\]/g, "")}%`;
}
