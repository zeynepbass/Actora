"use client";

import Alert from "./Alert";
import Button from "./Button";
import Dialog from "./Dialog";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel = "Vazgeç",
  tone = "primary",
  pending = false,
  error,
}) {
  return (
    <Dialog open={open} onClose={onClose} title={title} description={description} size="sm">
      {error && <Alert className="mb-4">{error}</Alert>}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose} disabled={pending}>
          {cancelLabel}
        </Button>
        <Button variant={tone} onClick={onConfirm} loading={pending}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
