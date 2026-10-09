import { Geist } from "next/font/google";
import { themeInitScript } from "@/components/layout/ThemeToggle";
import Providers from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const description =
  "Actora; antrenman ve beslenme paylaşımları, kilo hedefi takibi ve vücut kitle endeksi hesaplama sunan bir fitness topluluğu uygulamasıdır.";

export const metadata = {
  title: { default: "Actora", template: "%s · Actora" },
  description,
  applicationName: "Actora",
  openGraph: {
    type: "website",
    siteName: "Actora",
    title: "Actora",
    description,
    locale: "tr_TR",
  },
  twitter: { card: "summary", title: "Actora", description },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1819" },
  ],
};

export default function RootLayout({ children }) {
  return (
    // The theme script adds the "dark" class before hydration, so the attribute may differ.
    <html lang="tr" className={geistSans.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
