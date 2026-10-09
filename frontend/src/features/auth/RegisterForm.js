"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import { InputField, SelectField } from "@/components/ui/Field";
import { getErrorMessage, getFieldErrors } from "@/lib/apiClient";
import { registerUser } from "./api";
import { ROLE_OPTIONS, ROLES } from "./roles";

const MIN_PASSWORD_LENGTH = 8;

export default function RegisterForm({ onRegistered }) {
  const [form, setForm] = useState({ adSoyad: "", email: "", parola: "", rol: ROLES[0] });

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => onRegistered(form.email),
  });
  const fieldErrors = getFieldErrors(mutation.error);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    mutation.mutate(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mutation.isError && (
        <Alert>{getErrorMessage(mutation.error, "Kayıt tamamlanamadı. Bilgilerinizi kontrol edin.")}</Alert>
      )}
      <SelectField
        label="Rol"
        name="rol"
        options={ROLE_OPTIONS}
        value={form.rol}
        onChange={handleChange}
        error={fieldErrors.rol}
      />
      <InputField
        label="Ad soyad"
        name="adSoyad"
        autoComplete="name"
        required
        minLength={2}
        maxLength={80}
        value={form.adSoyad}
        onChange={handleChange}
        error={fieldErrors.adSoyad}
      />
      <InputField
        label="E-posta"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="ornek@mail.com"
        required
        value={form.email}
        onChange={handleChange}
        error={fieldErrors.email}
      />
      <InputField
        label="Parola"
        type="password"
        name="parola"
        autoComplete="new-password"
        required
        minLength={MIN_PASSWORD_LENGTH}
        hint={`En az ${MIN_PASSWORD_LENGTH} karakter`}
        value={form.parola}
        onChange={handleChange}
        error={fieldErrors.parola}
      />
      <Button type="submit" fullWidth loading={mutation.isPending}>
        {mutation.isPending ? "Kayıt yapılıyor…" : "Kayıt ol"}
      </Button>
    </form>
  );
}
