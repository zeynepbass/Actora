import { ButtonLink } from "@/components/ui/Button";
import Logo from "@/components/ui/Logo";

export const metadata = { title: "Sayfa bulunamadı" };

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <Logo />
      <p className="mt-10 text-sm font-semibold text-brand-ink">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Sayfa bulunamadı</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">
        Aradığın sayfa taşınmış ya da hiç var olmamış olabilir.
      </p>
      <ButtonLink href="/workouts" className="mt-6">
        Akışa dön
      </ButtonLink>
    </main>
  );
}
