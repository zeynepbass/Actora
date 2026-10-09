"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Logo from "@/components/ui/Logo";
import Tabs, { TabPanel } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { useSession } from "./session";

const TABS = [
  { value: "login", label: "Giriş yap" },
  { value: "register", label: "Kayıt ol" },
];

export default function AuthScreen() {
  const router = useRouter();
  const toast = useToast();
  const session = useSession();
  const [tab, setTab] = useState("login");
  const [registeredEmail, setRegisteredEmail] = useState("");

  useEffect(() => {
    if (session?.token) router.replace("/workouts");
  }, [session, router]);

  const handleRegistered = (email) => {
    setRegisteredEmail(email);
    setTab("login");
    toast.success("Kayıt başarılı! Şimdi giriş yapabilirsin.");
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <Image
          src="/images/background.jpg"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Logo inverted />
          <div className="max-w-md">
            <p className="text-4xl font-semibold leading-tight tracking-tight">
              Hedefini belirle, ilerlemeni paylaş.
            </p>
            <p className="mt-4 text-base text-white/85">
              Antrenmanlarını ve beslenme notlarını toplulukla paylaş, kilo hedefini gün gün takip et.
            </p>
          </div>
        </div>
      </div>

      <main className="flex items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-sm">
          <Logo className="lg:hidden" />
          <h1 className="mt-8 text-2xl font-semibold tracking-tight lg:mt-0">
            {tab === "login" ? "Tekrar hoş geldin" : "Hesabını oluştur"}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {tab === "login"
              ? "Devam etmek için hesabına giriş yap."
              : "Topluluğa katılmak bir dakikadan kısa sürer."}
          </p>

          <Tabs
            id="auth"
            label="Üyelik"
            tabs={TABS}
            value={tab}
            onChange={setTab}
            className="mt-6 flex w-full"
          />
          <TabPanel group="auth" value={tab} className="mt-6">
            {tab === "login" ? (
              <LoginForm key={registeredEmail} initialEmail={registeredEmail} />
            ) : (
              <RegisterForm onRegistered={handleRegistered} />
            )}
          </TabPanel>
        </div>
      </main>
    </div>
  );
}
