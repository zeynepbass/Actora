"use client";

import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { getErrorMessage } from "@/lib/apiClient";
import AccountActions from "./AccountActions";
import ProfileForm from "./ProfileForm";
import ProfileSummary from "./ProfileSummary";
import { useCurrentUser } from "./useCurrentUser";

export default function ProfileScreen() {
  const { data: user, isPending, isError, error, refetch } = useCurrentUser();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Profil</h1>
      <p className="mt-1 text-sm text-ink-muted">Bilgilerini ve kilo hedefini güncelle.</p>

      <div className="mt-6 space-y-5">
        {/* From the lg breakpoint up this summary lives in the sidebar. */}
        <div className="card p-5 sm:p-6 lg:hidden">
          <ProfileSummary showEditLink={false} />
        </div>

        {isPending && (
          <div role="status" aria-label="Profil formu yükleniyor" className="card h-96 animate-pulse" />
        )}
        {isError && (
          <EmptyState
            icon={ExclamationTriangleIcon}
            title="Profil yüklenemedi"
            description={getErrorMessage(error)}
            action={
              <Button variant="secondary" onClick={() => refetch()}>
                Tekrar dene
              </Button>
            }
          />
        )}
        {user && (
          <>
            <ProfileForm key={user.id} user={user} />
            <AccountActions userId={user.id} />
          </>
        )}
      </div>
    </div>
  );
}
