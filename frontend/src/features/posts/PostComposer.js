/* eslint-disable @next/next/no-img-element -- local blob preview, not a remote image */
"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import { InputField, TextareaField } from "@/components/ui/Field";
import ImagePicker from "@/components/ui/ImagePicker";
import { useToast } from "@/components/ui/Toast";
import { getErrorMessage, getFieldErrors } from "@/lib/apiClient";
import { validateImageFile } from "@/lib/media";
import { useObjectUrl } from "@/lib/useObjectUrl";
import { createPost, postsQueryKey } from "./api";

const COPY = {
  post: {
    title: "Gönderi paylaş",
    titleLabel: "Başlık",
    descriptionLabel: "Açıklama",
    submit: "Paylaş",
  },
  // Shared when a goal period ends: what the user ate, how they moved.
  achievement: {
    title: "Hedef sonucunu paylaş",
    description: "Hedef sürecinde neler yaptığını toplulukla paylaş.",
    titleLabel: "Neler yedin?",
    descriptionLabel: "Yemekte nelere dikkat ettin?",
    submit: "Yayınla",
  },
};

const EMPTY_FORM = { baslik: "", aciklama: "", kacAdim: "" };

export default function PostComposer({ open, onClose, variant = "post", onPublished }) {
  const copy = COPY[variant];
  const isAchievement = variant === "achievement";
  const toast = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const previewUrl = useObjectUrl(file);

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: postsQueryKey });
      toast.success("Gönderin paylaşıldı");
      setForm(EMPTY_FORM);
      setFile(null);
      onPublished?.(post);
      onClose();
    },
  });
  const fieldErrors = getFieldErrors(mutation.error);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleFile = (selected) => {
    if (!selected) return;
    const problem = validateImageFile(selected);
    setFileError(problem);
    if (!problem) setFile(selected);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const problem = validateImageFile(file);
    if (problem) {
      setFileError(problem);
      return;
    }

    const data = new FormData();
    data.append("baslik", form.baslik);
    data.append("aciklama", form.aciklama);
    if (isAchievement) data.append("kacAdim", form.kacAdim);
    data.append("resim", file);
    mutation.mutate(data);
  };

  const handleClose = () => {
    if (!mutation.isPending) onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} title={copy.title} description={copy.description}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {mutation.isError && (
          <Alert>{getErrorMessage(mutation.error, "Gönderi paylaşılamadı.")}</Alert>
        )}
        <InputField
          label={copy.titleLabel}
          name="baslik"
          required
          maxLength={120}
          value={form.baslik}
          onChange={handleChange}
          error={fieldErrors.baslik}
        />
        {isAchievement && (
          <InputField
            label="Günlük kaç adım attın?"
            name="kacAdim"
            type="number"
            inputMode="numeric"
            min={0}
            max={200000}
            step={1}
            required
            value={form.kacAdim}
            onChange={handleChange}
            error={fieldErrors.kacAdim}
          />
        )}
        <TextareaField
          label={copy.descriptionLabel}
          name="aciklama"
          required
          maxLength={2000}
          value={form.aciklama}
          onChange={handleChange}
          error={fieldErrors.aciklama}
        />

        {previewUrl && (
          <img
            src={previewUrl}
            alt="Seçilen görselin önizlemesi"
            className="max-h-56 w-full rounded-xl border border-line object-cover"
          />
        )}
        <ImagePicker
          label={file ? "Görseli değiştir" : "Görsel seç"}
          fileName={file?.name}
          error={fileError}
          onSelect={handleFile}
        />

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={handleClose} disabled={mutation.isPending}>
            Vazgeç
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            {mutation.isPending ? "Gönderiliyor…" : copy.submit}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
