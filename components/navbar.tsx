"use client";

import Link from "next/link";
import { RiSearch2Line } from "@remixicon/react";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { motion, useScroll, useSpring, useTransform } from "motion/react";

export default function Navbar({ children }: { children: React.ReactNode }) {
  const { scrollY } = useScroll();
  const rawFontSize = useTransform(scrollY, [0, 150], [60, 20]);
  const fontSize = useSpring(rawFontSize, { stiffness: 300, damping: 30 });

  return (
    <header className="w-full sticky top-0 pt-4 backdrop-blur-3xl bg-background/70 z-50">
      <nav className="mx-auto flex sm:w-9/12 w-full flex-col">
        <div className="flex items-center justify-between">
          <Link href="/">
            <motion.h2 style={{ fontSize }} className="font-extrabold">
              Blogly.
            </motion.h2>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              nativeButton={false}
              render={<Link href="/search" />}
              aria-label="Search"
            >
              <RiSearch2Line />
            </Button>
            <ModeToggle />
            {children}
          </div>
        </div>
        <Separator className={"mt-4"} />
      </nav>
    </header>
  );
}
