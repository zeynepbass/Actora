"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";
import Logo from "@/components/ui/Logo";
import { signOut } from "@/features/auth/signOut";
import { cn } from "@/lib/cn";
import { NAV_ITEMS } from "./navigation";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const pathname = usePathname();
  const queryClient = useQueryClient();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface">
      <div className="mx-auto flex h-16 max-w-shell items-center gap-2 px-4 sm:px-6 lg:px-8">
        <Link href="/workouts" aria-label="Actora ana sayfa" className="mr-auto rounded-lg md:mr-6">
          <Logo />
        </Link>

        <nav aria-label="Ana menü" className="mr-auto hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-medium transition-colors",
                  active ? "bg-brand-soft text-brand-ink" : "text-ink-muted hover:bg-subtle hover:text-ink"
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <ThemeToggle />
        {/* Clearing the session makes the app shell redirect to the sign-in page. */}
        <button
          type="button"
          onClick={() => signOut(queryClient)}
          className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-subtle hover:text-ink"
        >
          <ArrowRightStartOnRectangleIcon aria-hidden="true" className="size-5" />
          <span className="sr-only sm:not-sr-only">Çıkış</span>
        </button>
      </div>
    </header>
  );
}
