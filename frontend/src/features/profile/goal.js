const DAY = 24 * 60 * 60 * 1000;
const PLAN_POINTS = 6;

/**
 * Progress through the weight-goal period, counted from the day the goal was set.
 * Returns null when the user has no active goal.
 */
export function getGoalProgress(user, now = new Date()) {
  const totalDays = Number(user?.kacGun);
  const start = user?.baslangicTarihi ? new Date(user.baslangicTarihi) : null;
  if (!(totalDays > 0) || !(Number(user?.hedefKg) > 0) || !start || Number.isNaN(start.getTime())) {
    return null;
  }

  const elapsedMs = Math.max(0, now - start);
  const elapsedDays = Math.min(totalDays, Math.floor(elapsedMs / DAY));

  return {
    totalDays,
    elapsedDays,
    remainingDays: totalDays - elapsedDays,
    percent: Math.round((elapsedDays / totalDays) * 100),
    expired: elapsedMs > totalDays * DAY,
    endDate: new Date(start.getTime() + totalDays * DAY),
  };
}

/**
 * Evenly paced path from the current weight to the target weight across the
 * goal period. It is a plan, not recorded measurements.
 */
export function buildWeightPlan(user) {
  const weight = Number(user?.weight);
  const target = Number(user?.hedefKg);
  const totalDays = Number(user?.kacGun);
  if (!(weight > 0) || !(target > 0) || !(totalDays > 0)) return [];

  const steps = Math.min(PLAN_POINTS - 1, totalDays);
  return Array.from({ length: steps + 1 }, (_, index) => {
    const ratio = index / steps;
    return {
      day: Math.round(totalDays * ratio),
      weight: Math.round((weight + (target - weight) * ratio) * 10) / 10,
    };
  });
}
