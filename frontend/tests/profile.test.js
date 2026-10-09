import { describe, expect, it } from "vitest";
import { calculateBmi } from "@/features/profile/bmi";
import { buildWeightPlan, getGoalProgress } from "@/features/profile/goal";

const DAY = 24 * 60 * 60 * 1000;

describe("calculateBmi", () => {
  it("computes the index rounded to one decimal", () => {
    expect(calculateBmi(70, 175)).toEqual({ value: 22.9, category: "Normal" });
  });

  it("accepts numeric strings from form inputs", () => {
    expect(calculateBmi("60", "170").value).toBe(20.8);
  });

  it.each([
    [50, 175, "Zayıf"],
    [56.7, 175, "Normal"],
    [76.6, 175, "Fazla kilolu"],
    [92, 175, "Obez"],
  ])("classifies %s kg at %s cm as %s", (weight, height, category) => {
    expect(calculateBmi(weight, height).category).toBe(category);
  });

  it("returns null for missing or non-positive input", () => {
    expect(calculateBmi("", 170)).toBeNull();
    expect(calculateBmi(70, 0)).toBeNull();
    expect(calculateBmi("abc", 170)).toBeNull();
  });
});

describe("getGoalProgress", () => {
  const start = new Date("2026-01-01T00:00:00Z");
  const user = { hedefKg: 65, kacGun: 30, baslangicTarihi: start.toISOString() };
  const after = (days) => new Date(start.getTime() + days * DAY);

  it("returns null without an active goal", () => {
    expect(getGoalProgress(null)).toBeNull();
    expect(getGoalProgress({ ...user, kacGun: 0 })).toBeNull();
    expect(getGoalProgress({ ...user, hedefKg: 0 })).toBeNull();
    expect(getGoalProgress({ ...user, baslangicTarihi: null })).toBeNull();
    expect(getGoalProgress({ ...user, baslangicTarihi: "not a date" })).toBeNull();
  });

  it("reports elapsed and remaining days", () => {
    expect(getGoalProgress(user, after(12))).toMatchObject({
      totalDays: 30,
      elapsedDays: 12,
      remainingDays: 18,
      percent: 40,
      expired: false,
    });
  });

  it("is not expired on the last day and expires once the period has passed", () => {
    expect(getGoalProgress(user, after(30)).expired).toBe(false);
    const late = getGoalProgress(user, after(31));
    expect(late.expired).toBe(true);
    expect(late.elapsedDays).toBe(30);
    expect(late.remainingDays).toBe(0);
    expect(late.percent).toBe(100);
  });

  it("treats a start date in the future as day zero", () => {
    expect(getGoalProgress(user, after(-3)).elapsedDays).toBe(0);
  });
});

describe("buildWeightPlan", () => {
  it("runs from the current weight to the target across the period", () => {
    const plan = buildWeightPlan({ weight: 80, hedefKg: 70, kacGun: 50 });
    expect(plan).toHaveLength(6);
    expect(plan[0]).toEqual({ day: 0, weight: 80 });
    expect(plan.at(-1)).toEqual({ day: 50, weight: 70 });
    expect(plan[1]).toEqual({ day: 10, weight: 78 });
  });

  it("uses fewer points for very short goals", () => {
    expect(buildWeightPlan({ weight: 80, hedefKg: 79, kacGun: 2 }).map((p) => p.day)).toEqual([0, 1, 2]);
  });

  it("returns nothing when data is incomplete", () => {
    expect(buildWeightPlan({ weight: null, hedefKg: 70, kacGun: 30 })).toEqual([]);
  });
});
