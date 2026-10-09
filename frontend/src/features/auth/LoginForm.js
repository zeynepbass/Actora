"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import { InputField } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { getErrorMessage } from "@/lib/apiClient";
import { loginUser } from "./api";
import { setSession } from "./session";

export default function LoginForm({ initialEmail = "" }) {
  const toast = useToast();
  const [form, setForm] = useState({ email: initialEmail, parola: "" });

  const mutation = useMutation({
    mutationFn: loginUser,
    // Storing the session is enough: the auth screen redirects once one exists.
    onSuccess: ({ token, kullanici, message }) => {
      setSession({ token, kullanici });
      toast.success(message || "Giriş başarılı");
    },
  });

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
        <Alert>{getErrorMessage(mutation.error, "Giriş yapılamadı. Bilgilerinizi kontrol edin.")}</Alert>
      )}
      <InputField
        label="E-posta"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="ornek@mail.com"
        required
        value={form.email}
        onChange={handleChange}
      />
      <InputField
        label="Parola"
        type="password"
        name="parola"
        autoComplete="current-password"
        required
        value={form.parola}
        onChange={handleChange}
      />
      <Button type="submit" fullWidth loading={mutation.isPending}>
        {mutation.isPending ? "Giriş yapılıyor…" : "Giriş yap"}
      </Button>
    </form>
  );
}
