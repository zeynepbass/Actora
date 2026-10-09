"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { signOut } from "@/features/auth/signOut";
import { getErrorMessage } from "@/lib/apiClient";
import { deleteUser, freezeUser } from "./api";

const ACTIONS = {
  freeze: {
    run: freezeUser,
    title: "Hesabın dondurulsun mu?",
    description:
      "Gönderilerin akışta gizlenir ve oturumun kapatılır. Tekrar giriş yaptığında hesabın yeniden etkinleşir.",
    confirmLabel: "Hesabı dondur",
    tone: "primary",
    done: "Hesabın donduruldu",
    forgetDevice: false,
  },
  delete: {
    run: deleteUser,
    title: "Hesabın kalıcı olarak silinsin mi?",
    description: "Profilin ve tüm gönderilerin silinir. Bu işlem geri alınamaz.",
    confirmLabel: "Hesabı sil",
    tone: "danger",
    done: "Hesabın silindi. Ayrılmana üzüldük.",
    forgetDevice: true,
  },
};

export default function AccountActions({ userId }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [pendingAction, setPendingAction] = useState(null);
  const action = ACTIONS[pendingAction];

  // Clearing the session makes the app shell redirect to the sign-in page.
  const mutation = useMutation({
    mutationFn: (name) => ACTIONS[name].run(userId),
    onSuccess: (_, name) => {
      toast.success(ACTIONS[name].done);
      signOut(queryClient, { forgetDevice: ACTIONS[name].forgetDevice });
    },
  });

  const close = () => {
    if (mutation.isPending) return;
    setPendingAction(null);
    mutation.reset();
  };

  return (
    <section aria-labelledby="account-title" className="card p-5 sm:p-6">
      <h2 id="account-title" className="text-base font-semibold">
        Hesap
      </h2>
      <div className="mt-4 divide-y divide-line">
        <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-muted">
            Ara vermek istersen hesabını dondurabilirsin; verilerin saklanır.
          </p>
          <Button variant="secondary" className="shrink-0" onClick={() => setPendingAction("freeze")}>
            Hesabı dondur
          </Button>
        </div>
        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-muted">
            Hesabını silersen profilin ve gönderilerin kalıcı olarak kaldırılır.
          </p>
          <Button variant="dangerOutline" className="shrink-0" onClick={() => setPendingAction("delete")}>
            Hesabı sil
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(action)}
        onClose={close}
        onConfirm={() => mutation.mutate(pendingAction)}
        title={action?.title ?? ""}
        description={action?.description}
        confirmLabel={action?.confirmLabel}
        tone={action?.tone}
        pending={mutation.isPending}
        error={mutation.isError ? getErrorMessage(mutation.error) : undefined}
      />
    </section>
  );
}
