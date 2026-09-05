import Form from "next/form";
import { RiSearch2Line } from "@remixicon/react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import type { SearchQuery } from "@/lib/search";
import { defaultSearchSort } from "@/lib/search";

export default function SearchForm({
  q,
  type,
  sort,
  when,
}: Pick<SearchQuery, "q" | "type" | "sort" | "when">) {
  return (
    <Form action="/search" className="w-full">
      {type !== "posts" ? <input type="hidden" name="type" value={type} /> : null}
      {sort !== defaultSearchSort(q) ? (
        <input type="hidden" name="sort" value={sort} />
      ) : null}
      {when !== "any" ? <input type="hidden" name="when" value={when} /> : null}
      <InputGroup className="h-11">
        <InputGroupAddon>
          <RiSearch2Line />
        </InputGroupAddon>
        <InputGroupInput
          key={q}
          name="q"
          defaultValue={q}
          placeholder="Search posts, people, and tags"
          aria-label="Search"
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton type="submit" variant="default" size="sm">
            Search
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </Form>
  );
}
