import Link from "next/link";
import { getCurrentUser } from "@/lib/auth-helper";
import { logoutUser } from "@/actions/logout";
import { Button } from "@/components/ui/button";
import { AvatarImage } from "@/components/avatar-image";
import { prisma } from "@/lib/prisma";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LayoutDashboard, Settings, LogOut, ChevronDown } from "lucide-react";

export async function UserMenu() {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-sm font-semibold text-zinc-650 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors focus:outline-none focus-visible:underline"
        >
          Log in
        </Link>
        <Link href="/signup">
          <Button size="sm" className="font-semibold">
            Sign up
          </Button>
        </Link>
      </div>
    );
  }

  // Fetch fresh user data from DB to reflect updates instantly
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { name: true, username: true, avatarUrl: true },
  });

  if (!user) {
    return null;
  }

  const initial = user.name ? user.name.charAt(0).toUpperCase() : "@";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        nativeButton
        render={
          <button
            className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 p-1 pr-3 text-sm font-semibold hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="User menu"
          >
            <AvatarImage
              src={user.avatarUrl || ""}
              alt={user.name || "User avatar"}
              initial={initial}
              className="h-7 w-7"
            />
            <span className="max-w-[120px] truncate text-zinc-700 dark:text-zinc-350">
              @{user.username || "user"}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-56 mt-1">
        <div className="px-2.5 py-2 text-xs font-medium text-zinc-500">
          <div className="flex items-center gap-3">
            <AvatarImage
              src={user.avatarUrl || ""}
              alt={user.name || "User avatar"}
              initial={initial}
              className="h-9 w-9"
              fallbackClassName="h-9 w-9 text-sm"
            />
            <div className="flex flex-col min-w-0">
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 truncate leading-none">
                {user.name}
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate leading-none mt-1">
                @{user.username}
              </p>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={
            <Link href={`/${user.username}`} className="cursor-pointer flex items-center w-full" />
          }
        >
          <User className="mr-2 h-4 w-4 text-zinc-400" />
          <span>My Blog Home</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          render={
            <Link href="/admin" className="cursor-pointer flex items-center w-full" />
          }
        >
          <LayoutDashboard className="mr-2 h-4 w-4 text-zinc-400" />
          <span>Admin Panel</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          render={
            <Link href="/admin/profile" className="cursor-pointer flex items-center w-full" />
          }
        >
          <Settings className="mr-2 h-4 w-4 text-zinc-400" />
          <span>Edit Profile</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={logoutUser} className="w-full">
          <DropdownMenuItem
            variant="destructive"
            className="focus:bg-destructive/10 focus:text-destructive cursor-pointer"
            nativeButton
            render={
              <button type="submit" className="flex items-center w-full text-left cursor-pointer outline-none" />
            }
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
