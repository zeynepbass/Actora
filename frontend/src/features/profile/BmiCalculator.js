"use client";

import { useId, useState } from "react";
import Button from "@/components/ui/Button";
import { InputField } from "@/components/ui/Field";
import { formatNumber } from "@/lib/format";
import { calculateBmi } from "./bmi";

export default function BmiCalculator({ user }) {
  const [weight, setWeight] = useState(user.weight ?? "");
  const [height, setHeight] = useState(user.height ?? "");
  const [result, setResult] = useState(null);
  const titleId = useId();

  const handleSubmit = (event) => {
    event.preventDefault();
    setResult(calculateBmi(weight, height));
  };

  return (
    <section aria-labelledby={titleId}>
      <h3 id={titleId} className="text-sm font-semibold">
        Vücut kitle endeksi
      </h3>
      <form onSubmit={handleSubmit} className="mt-3 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Kilo (kg)"
            type="number"
            inputMode="decimal"
            min={20}
            max={400}
            step="0.1"
            required
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
          />
          <InputField
            label="Boy (cm)"
            type="number"
            inputMode="decimal"
            min={50}
            max={260}
            step="0.1"
            required
            value={height}
            onChange={(event) => setHeight(event.target.value)}
          />
        </div>
        <Button type="submit" variant="secondary" fullWidth>
          Hesapla
        </Button>
      </form>
      <p aria-live="polite" className="mt-3 text-sm">
        {result && (
          <>
            <span className="text-2xl font-semibold tabular-nums">{formatNumber(result.value)}</span>
            <span className="ml-2 text-ink-muted">{result.category}</span>
          </>
        )}
      </p>
    </section>
  );
}
