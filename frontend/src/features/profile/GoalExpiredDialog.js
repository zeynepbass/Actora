"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/Toast";
import PostComposer from "@/features/posts/PostComposer";
import { getErrorMessage } from "@/lib/apiClient";
import { resetGoal } from "./api";
import { getGoalProgress } from "./goal";
import { useCurrentUser, userQueryKey } from "./useCurrentUser";

/**
 * Shown once the goal period is over. The user either shares the outcome as a
 * post or skips it; both paths clear the goal so a new one can be set.
 */
export default function GoalExpiredDialog() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const [step, setStep] = useState("prompt");

  const reset = useMutation({
    mutationFn: () => resetGoal(user.id),
    onSuccess: ({ kullanici }) => {
      queryClient.setQueryData(userQueryKey(user.id), kullanici);
      setStep("prompt");
      toast.success("Hedefin kapatıldı. Profilinden yeni bir hedef belirleyebilirsin.");
    },
    // Back to the prompt, which shows the error and lets the user retry.
    onError: () => setStep("prompt"),
  });

  if (!user || !getGoalProgress(user)?.expired) return null;

  return (
    <>
      <Dialog
        open={step === "prompt"}
        onClose={() => {
          if (step === "prompt" && !reset.isPending) setStep("dismissed");
        }}
        title="Hedef süren doldu"
        description={`${user.kacGun} günlük hedef sürecin tamamlandı. Sonucunu toplulukla paylaşmak ister misin?`}
        size="sm"
      >
        {reset.isError && <Alert className="mb-4">{getErrorMessage(reset.error, "Hedef sıfırlanamadı.")}</Alert>}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" loading={reset.isPending} onClick={() => reset.mutate()}>
            Paylaşma
          </Button>
          <Button disabled={reset.isPending} onClick={() => setStep("compose")}>
            Gönderi olarak paylaş
          </Button>
        </div>
      </Dialog>

      <PostComposer
        variant="achievement"
        open={step === "compose"}
        onClose={() => setStep((current) => (current === "compose" ? "prompt" : current))}
        onPublished={() => {
          setStep("publishing");
          reset.mutate();
        }}
      />
    </>
  );
}
