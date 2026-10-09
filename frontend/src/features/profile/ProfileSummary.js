"use client";

import { useId, useState } from "react";
import { ChartBarIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import Avatar from "@/components/ui/Avatar";
import Button, { ButtonLink } from "@/components/ui/Button";
import { BMI_ROLE } from "@/features/auth/roles";
import { getErrorMessage } from "@/lib/apiClient";
import { formatNumber } from "@/lib/format";
import BmiCalculator from "./BmiCalculator";
import GoalAnalysisDialog from "./GoalAnalysisDialog";
import { getGoalProgress } from "./goal";
import { useCurrentUser } from "./useCurrentUser";

const withUnit = (value, unit) => (Number(value) > 0 ? `${formatNumber(Number(value))} ${unit}` : "—");

function SummarySkeleton() {
  return (
    <div role="status" aria-label="Profil yükleniyor" className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="size-20 animate-pulse rounded-full bg-subtle" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 animate-pulse rounded bg-subtle" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-subtle" />
        </div>
      </div>
      <div className="h-24 animate-pulse rounded-xl bg-subtle" />
    </div>
  );
}

/** Profile overview shown in the desktop sidebar and at the top of the profile page on small screens. */
export default function ProfileSummary({ showEditLink = true }) {
  const { data: user, isPending, isError, error, refetch } = useCurrentUser();
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const goalTitleId = useId();

  if (isPending) return <SummarySkeleton />;
  if (isError) {
    return (
      <div role="alert" className="text-sm">
        <p className="font-medium">Profil yüklenemedi</p>
        <p className="mt-1 text-ink-muted">{getErrorMessage(error)}</p>
        <Button variant="secondary" size="sm" className="mt-3" onClick={() => refetch()}>
          Tekrar dene
        </Button>
      </div>
    );
  }

  const progress = getGoalProgress(user);
  const stats = [
    { label: "Boy", value: withUnit(user.height, "cm") },
    { label: "Kilo", value: withUnit(user.weight, "kg") },
    { label: "Hedef", value: withUnit(user.hedefKg, "kg") },
    { label: "Süre", value: withUnit(user.kacGun, "gün") },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar name={user.adSoyad} src={user.resim} size="lg" />
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold">{user.adSoyad || "İsimsiz üye"}</h2>
          <p className="truncate text-sm text-ink-muted">{user.email}</p>
          {user.rol && (
            <span className="mt-1.5 inline-block rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand-ink">
              {user.rol}
            </span>
          )}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-2">
        {stats.map(({ label, value }) => (
          <div key={label} className="rounded-xl bg-subtle px-3 py-2.5">
            <dt className="text-xs text-ink-muted">{label}</dt>
            <dd className="mt-0.5 text-sm font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby={goalTitleId}>
        <div className="flex items-baseline justify-between gap-2">
          <h3 id={goalTitleId} className="text-sm font-semibold">
            Hedef süreci
          </h3>
          {progress && (
            <span className="text-xs tabular-nums text-ink-muted">
              {progress.elapsedDays} / {progress.totalDays} gün
            </span>
          )}
        </div>
        {progress ? (
          <>
            <div
              role="progressbar"
              aria-labelledby={goalTitleId}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress.percent}
              className="mt-2 h-2 overflow-hidden rounded-full bg-subtle"
            >
              <div className="h-full rounded-full bg-brand" style={{ width: `${progress.percent}%` }} />
            </div>
            <p className="mt-2 text-xs text-ink-muted">
              {progress.expired ? "Hedef süren doldu." : `${progress.remainingDays} gün kaldı.`}
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm text-ink-muted">Henüz bir hedef belirlemedin.</p>
        )}
        <Button
          variant="secondary"
          size="sm"
          fullWidth
          className="mt-3"
          onClick={() => setAnalysisOpen(true)}
        >
          <ChartBarIcon aria-hidden="true" className="size-4" />
          Analizi görüntüle
        </Button>
      </section>

      {user.rol === BMI_ROLE && <BmiCalculator key={user.id} user={user} />}

      {showEditLink && (
        <ButtonLink href="/profil" variant="secondary" fullWidth>
          <PencilSquareIcon aria-hidden="true" className="size-4" />
          Profili düzenle
        </ButtonLink>
      )}

      <GoalAnalysisDialog open={analysisOpen} onClose={() => setAnalysisOpen(false)} user={user} />
    </div>
  );
}
