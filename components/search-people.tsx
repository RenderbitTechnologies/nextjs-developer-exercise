import Link from "next/link";
import PostPagination from "@/components/post-pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import type { SearchPerson } from "@/lib/db/queries/search";
import { initialsFromName } from "@/lib/format";

export default function SearchPeople({
  people,
  page,
  pageCount,
  basePath,
}: {
  people: SearchPerson[];
  page: number;
  pageCount: number;
  basePath: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <ItemGroup>
        {people.map((person) => (
          <Item
            key={person.id}
            variant="outline"
            render={<Link href={`/${person.username}`} />}
          >
            <ItemMedia>
              <Avatar>
                {person.image ? (
                  <AvatarImage src={person.image} alt={person.name} />
                ) : null}
                <AvatarFallback>{initialsFromName(person.name)}</AvatarFallback>
              </Avatar>
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{person.name}</ItemTitle>
              <ItemDescription>
                @{person.username} · {person.postCount}{" "}
                {person.postCount === 1 ? "post" : "posts"}
              </ItemDescription>
            </ItemContent>
          </Item>
        ))}
      </ItemGroup>
      <PostPagination basePath={basePath} page={page} pageCount={pageCount} />
    </div>
  );
}
