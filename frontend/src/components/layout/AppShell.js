"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Spinner from "@/components/ui/Spinner";
import { useSession } from "@/features/auth/session";
import GoalExpiredDialog from "@/features/profile/GoalExpiredDialog";
import ProfileSummary from "@/features/profile/ProfileSummary";
import Header from "./Header";
import MobileNav from "./MobileNav";

/** Layout for signed-in pages; sends visitors without a session to the sign-in page. */
export default function AppShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const session = useSession();
  const signedIn = Boolean(session?.token && session?.kullanici?.id);
  const signedOut = session !== undefined && !signedIn;

  useEffect(() => {
    if (signedOut) router.replace("/");
  }, [signedOut, router]);

  if (!signedIn) {
    return (
      <div role="status" className="flex min-h-dvh items-center justify-center text-ink-muted">
        <Spinner className="size-6" />
        <span className="sr-only">Yükleniyor</span>
      </div>
    );
  }

  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        İçeriğe geç
      </a>
      <Header />
      <div className="mx-auto flex max-w-shell">
        <aside
          aria-label="Profil özeti"
          className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-80 shrink-0 overflow-y-auto border-r border-line p-6 lg:block"
        >
          <ProfileSummary showEditLink={pathname !== "/profil"} />
        </aside>
        <main id="main" tabIndex={-1} className="min-w-0 flex-1 px-4 pb-28 pt-6 outline-none sm:px-6 md:pb-10 lg:px-8">
          {children}
        </main>
      </div>
      <MobileNav />
      <GoalExpiredDialog />
    </>
  );
}
