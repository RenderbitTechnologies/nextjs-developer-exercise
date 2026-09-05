"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { motion, useInView, useReducedMotion } from "motion/react";
import { CloudShader } from "@/components/ui/cloud-shader";

const wordVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.45,
    },
  },
};

const letterVariants = {
  hidden: { y: 72, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 480,
      damping: 14,
      mass: 0.7,
    },
  },
};

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/", label: "For you" },
  { href: "/signin", label: "Login" },
];

export default function Footer() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  const reduce = useReducedMotion();
  const footerRef = useRef<HTMLElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const revealed = useInView(spacerRef, { once: true, amount: 0.2 });
  const showWord = Boolean(reduce) || revealed;
  const letters = "Blogly.".split("");

  useLayoutEffect(() => {
    const node = footerRef.current;
    if (!node) return;

    const apply = () => {
      document.documentElement.style.setProperty(
        "--footer-height",
        `${node.offsetHeight}px`,
      );
    };

    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(node);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--footer-height");
    };
  }, [dark]);

  return (
    <>
      <div
        ref={spacerRef}
        aria-hidden
        className="pointer-events-none"
        style={{ height: "var(--footer-height, 0px)" }}
      />
      <footer
        ref={footerRef}
        className="fixed inset-x-0 bottom-0 z-0"
      >
        <div className="relative h-[48svh] min-h-64">
          <CloudShader
            className="absolute inset-0 h-full min-h-0 w-full"
            speed={0.85}
            count={6}
            cloudColor={dark ? "#4e5868" : "#fbf8f2"}
            skyTopColor={dark ? "#0c1424" : "#3876ba"}
            skyBottomColor={dark ? "#1c3358" : "#8cbfe8"}
          />
        </div>

        <div className="bg-background text-foreground">
          <div className="mx-auto flex w-full flex-col gap-10 px-4 py-16 sm:w-9/12 sm:px-0 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
                Leave the page open.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">
                The next sentence is still arriving. Come back with whatever you
                were afraid to publish this morning.
              </p>
            </div>

            <nav
              aria-label="Footer"
              className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm"
            >
              {LINKS.map((link, index) => (
                <span key={link.label} className="flex items-center gap-6">
                  <Link
                    href={link.href}
                    className="underline-offset-4 transition-opacity hover:underline"
                  >
                    {link.label}
                  </Link>
                  {index < LINKS.length - 1 ? (
                    <span aria-hidden className="text-muted-foreground/50">
                      /
                    </span>
                  ) : null}
                </span>
              ))}
            </nav>
          </div>

          <div className="mx-auto w-full px-4 pb-10 sm:w-9/12 sm:px-0">
            <motion.p
              aria-label="Blogly."
              className="flex font-extrabold tracking-tight text-5xl sm:text-7xl"
              initial="hidden"
              animate={showWord ? "show" : "hidden"}
              variants={wordVariants}
            >
              {letters.map((letter, index) => (
                <motion.span
                  key={`${letter}-${index}`}
                  className="inline-block will-change-transform"
                  variants={letterVariants}
                >
                  {letter === " " ? "\u00A0" : letter}
                </motion.span>
              ))}
            </motion.p>
          </div>
        </div>
      </footer>
    </>
  );
}
