"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { RiAddLine, RiSearch2Line } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export default function HomeTabs({
  children,
  following,
  defaultTab = "for-you",
}: {
  children: React.ReactNode;
  following: React.ReactNode;
  defaultTab?: "for-you" | "following";
}) {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const stickyRef = useRef<HTMLDivElement>(null);
  const triggerPointRef = useRef(0);

  useEffect(() => {
    const stickyTopOffset = 80;

    const calculateTriggerPoint = () => {
      if (stickyRef.current) {
        triggerPointRef.current = stickyRef.current.offsetTop - stickyTopOffset;
      }
    };

    calculateTriggerPoint();
    window.addEventListener("resize", calculateTriggerPoint);
    return () => window.removeEventListener("resize", calculateTriggerPoint);
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest >= triggerPointRef.current);
  });

  return (
    <Tabs defaultValue={defaultTab}>
      <div
        ref={stickyRef}
        className={cn(
          "flex items-center justify-between transition-all duration-300 ease-out sticky top-20 z-50 bg-background/70 backdrop-blur-2xl p-2 rounded-full mx-auto",
          isScrolled ? "w-100" : "w-full",
        )}
      >
        <TabsList>
          <TabsTrigger value="for-you">For You</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <Button
            size="default"
            variant="outline"
            nativeButton={false}
            render={<Link href="/admin/new" />}
          >
            <RiAddLine data-icon="inline-start" />
            Write
          </Button>
          <Button
            size="icon"
            variant="outline"
            nativeButton={false}
            render={<Link href="/search" />}
            aria-label="Search"
          >
            <RiSearch2Line />
          </Button>
        </div>
      </div>
      <TabsContent value="for-you" className="pt-4">
        {children}
      </TabsContent>
      <TabsContent value="following" className="pt-4">
        {following}
      </TabsContent>
    </Tabs>
  );
}
