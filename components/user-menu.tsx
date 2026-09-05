"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  RiLogoutBoxRLine,
  RiQuillPenLine,
  RiSettings3Line,
  RiUser3Line,
} from "@remixicon/react";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/toast";

export type UserMenuUser = {
  name: string;
  email: string;
  image?: string | null;
  username?: string | null;
};

function initialsFromName(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function UserMenu({ user: initialUser }: { user: UserMenuUser | null }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = isPending ? (session?.user ?? initialUser) : session?.user;

  if (!user) {
    return (
      <Button size="lg" nativeButton={false} render={<Link href="/signin" />}>
        Login
      </Button>
    );
  }

  const username = user.username;
  const profileHref = username ? `/${username}` : "/";

  async function handleSignOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.add({ type: "success", title: "Signed out." });
          router.push("/");
          router.refresh();
        },
      },
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-lg"
            className="rounded-full"
            aria-label="Open account menu"
          />
        }
      >
        <Avatar>
          <AvatarImage src={user.image ?? undefined} alt={user.name} />
          <AvatarFallback>{initialsFromName(user.name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">
                {user.name}
              </span>
              <span>{username ? `@${username}` : user.email}</span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            nativeButton={false}
            render={<Link href={profileHref} />}
          >
            <RiUser3Line />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            nativeButton={false}
            render={<Link href="/admin" />}
          >
            <RiQuillPenLine />
            Studio
          </DropdownMenuItem>
          <DropdownMenuItem
            nativeButton={false}
            render={<Link href="/settings" />}
          >
            <RiSettings3Line />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
            <RiLogoutBoxRLine />
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
