"use client";

import dynamic from "next/dynamic";
import { ButtonLink } from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import Spinner from "@/components/ui/Spinner";
import { formatDate, formatNumber } from "@/lib/format";
import { buildWeightPlan, getGoalProgress } from "./goal";

// The charting library is large and only needed once this dialog is opened.
const GoalCharts = dynamic(() => import("./GoalCharts"), {
  ssr: false,
  loading: () => (
    <div role="status" className="flex h-48 items-center justify-center text-ink-muted">
      <Spinner className="size-6" />
      <span className="sr-only">Grafikler yükleniyor</span>
    </div>
  ),
});

const formatKg = (value) => (value > 0 ? `${formatNumber(value)} kg` : "—");

export default function GoalAnalysisDialog({ open, onClose, user }) {
  const progress = getGoalProgress(user);
  const plan = buildWeightPlan(user);
  const weight = Number(user.weight);
  const target = Number(user.hedefKg);

  const stats = [
    { label: "Mevcut", value: formatKg(weight) },
    { label: "Hedef", value: formatKg(target) },
    {
      label: "Fark",
      value: weight > 0 && target > 0 ? `${formatNumber(Math.abs(weight - target))} kg` : "—",
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Hedef analizi"
      description={progress ? `Hedef bitiş tarihi: ${formatDate(progress.endDate)}` : undefined}
      size="lg"
    >
      <dl className="grid grid-cols-3 gap-2 sm:gap-3">
        {stats.map(({ label, value }) => (
          <div key={label} className="min-w-0 rounded-xl bg-subtle px-3 py-3">
            <dt className="truncate text-xs text-ink-muted">{label}</dt>
            <dd className="mt-1 truncate text-base font-semibold tabular-nums sm:text-lg">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6">
        {progress && plan.length > 0 ? (
          <GoalCharts progress={progress} plan={plan} />
        ) : (
          <div className="rounded-xl border border-dashed border-line-strong px-4 py-8 text-center">
            <p className="text-sm font-medium">Analiz için bir hedef gerekli</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-ink-muted">
              Profilinde kilonu, hedef kilonu ve hedef süreni belirlediğinde ilerlemen burada görünür.
            </p>
            <ButtonLink href="/profil" variant="secondary" className="mt-4" onClick={onClose}>
              Hedef belirle
            </ButtonLink>
          </div>
        )}
      </div>
    </Dialog>
  );
}
