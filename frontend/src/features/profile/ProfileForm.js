"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Alert from "@/components/ui/Alert";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { InputField, TextareaField } from "@/components/ui/Field";
import ImagePicker from "@/components/ui/ImagePicker";
import { useToast } from "@/components/ui/Toast";
import { updateSessionUser } from "@/features/auth/session";
import { postsQueryKey } from "@/features/posts/api";
import { getErrorMessage, getFieldErrors } from "@/lib/apiClient";
import { validateImageFile } from "@/lib/media";
import { useObjectUrl } from "@/lib/useObjectUrl";
import { updateUser } from "./api";
import { userQueryKey } from "./useCurrentUser";

const FIELDS = ["adSoyad", "email", "kullaniciAdi", "weight", "height", "deneyim", "hedefKg", "kacGun"];

const toFormState = (user) =>
  Object.fromEntries(FIELDS.map((field) => [field, user[field] ? String(user[field]) : ""]));

function FormSection({ title, description, children }) {
  return (
    <fieldset className="card p-5 sm:p-6">
      <legend className="float-left mb-1 w-full text-base font-semibold">{title}</legend>
      {description && <p className="clear-both text-sm text-ink-muted">{description}</p>}
      <div className="clear-both grid gap-4 pt-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export default function ProfileForm({ user }) {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(() => toFormState(user));
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const previewUrl = useObjectUrl(file);

  const mutation = useMutation({
    mutationFn: (data) => updateUser(user.id, data),
    onSuccess: ({ kullanici }) => {
      queryClient.setQueryData(userQueryKey(user.id), kullanici);
      queryClient.invalidateQueries({ queryKey: postsQueryKey });
      updateSessionUser({ adSoyad: kullanici.adSoyad, email: kullanici.email });
      toast.success("Profilin güncellendi");
      router.push("/workouts");
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
    const data = new FormData();
    FIELDS.forEach((field) => data.append(field, form[field]));
    if (file) data.append("resim", file);
    mutation.mutate(data);
  };

  const field = (name) => ({
    name,
    value: form[name],
    onChange: handleChange,
    error: fieldErrors[name],
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormSection title="Kişisel bilgiler">
        <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
          <Avatar name={form.adSoyad} src={previewUrl ?? user.resim} size="lg" />
          <ImagePicker
            label={user.resim || file ? "Fotoğrafı değiştir" : "Fotoğraf yükle"}
            fileName={file?.name}
            error={fileError}
            onSelect={handleFile}
          />
        </div>
        <InputField label="Ad soyad" autoComplete="name" required minLength={2} maxLength={80} {...field("adSoyad")} />
        <InputField label="Kullanıcı adı" autoComplete="username" maxLength={40} {...field("kullaniciAdi")} />
        <InputField label="E-posta" type="email" autoComplete="email" required className="sm:col-span-2" {...field("email")} />
        <InputField label="Kilo (kg)" type="number" inputMode="decimal" min={20} max={400} step="0.1" placeholder="Örn: 60" {...field("weight")} />
        <InputField label="Boy (cm)" type="number" inputMode="decimal" min={50} max={260} step="0.1" placeholder="Örn: 170" {...field("height")} />
        <TextareaField label="Deneyim" maxLength={1000} placeholder="Spor geçmişinden kısaca bahset" className="sm:col-span-2" {...field("deneyim")} />
      </FormSection>

      <FormSection
        title="Kilo hedefi"
        description="Hedefi değiştirdiğinde süre bugünden itibaren yeniden başlar."
      >
        <InputField label="Hedef kilo (kg)" type="number" inputMode="decimal" min={20} max={400} step="0.1" {...field("hedefKg")} />
        <InputField label="Hedef süre (gün)" type="number" inputMode="numeric" min={1} max={3650} step={1} {...field("kacGun")} />
      </FormSection>

      {mutation.isError && <Alert>{getErrorMessage(mutation.error, "Profil güncellenemedi.")}</Alert>}
      <div className="flex justify-end">
        <Button type="submit" loading={mutation.isPending} className="w-full sm:w-auto">
          {mutation.isPending ? "Kaydediliyor…" : "Değişiklikleri kaydet"}
        </Button>
      </div>
    </form>
  );
}
