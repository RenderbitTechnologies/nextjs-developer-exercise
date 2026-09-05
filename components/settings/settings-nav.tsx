"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  RiLockPasswordLine,
  RiUser3Line,
  RiUserSettingsLine,
} from "@remixicon/react";
import { Button } from "@/components/ui/button";

const ITEMS = [
  {
    href: "/settings/account",
    label: "Account",
    icon: RiUser3Line,
  },
  {
    href: "/settings/security",
    label: "Security",
    icon: RiLockPasswordLine,
  },
  {
    href: "/settings/manage",
    label: "Manage account",
    icon: RiUserSettingsLine,
  },
] as const;

export default function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Settings"
      className="flex gap-2 overflow-x-auto md:w-52 md:flex-col md:overflow-visible"
    >
      {ITEMS.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Button
            key={item.href}
            nativeButton={false}
            variant={active ? "secondary" : "ghost"}
            render={<Link href={item.href} aria-current={active ? "page" : undefined} />}
            className="justify-start"
          >
            <Icon data-icon="inline-start" />
            {item.label}
          </Button>
        );
      })}
    </nav>
  );
}
