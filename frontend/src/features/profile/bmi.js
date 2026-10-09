const CATEGORIES = [
  { below: 18.5, label: "Zayıf" },
  { below: 25, label: "Normal" },
  { below: 30, label: "Fazla kilolu" },
  { below: Infinity, label: "Obez" },
];

/** Body mass index from weight in kilograms and height in centimetres. */
export function calculateBmi(weightKg, heightCm) {
  const weight = Number(weightKg);
  const height = Number(heightCm);
  if (!(weight > 0) || !(height > 0)) return null;

  const value = Math.round((weight / (height / 100) ** 2) * 10) / 10;
  return { value, category: CATEGORIES.find(({ below }) => value < below).label };
}
