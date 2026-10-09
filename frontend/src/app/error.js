"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";
import Logo from "@/components/ui/Logo";

export default function ErrorPage({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <Logo />
      <h1 className="mt-10 text-2xl font-semibold tracking-tight">Bir şeyler ters gitti</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">
        Beklenmeyen bir hata oluştu. Tekrar denemek sorunu çözebilir.
      </p>
      <Button onClick={reset} className="mt-6">
        Tekrar dene
      </Button>
    </main>
  );
}
