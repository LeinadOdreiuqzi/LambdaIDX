import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { TerminalToaster } from "@/components/shared/terminal-toaster";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SpeculationRules } from "@/components/shared/speculation-rules";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ACCESSIBILITY_INIT_SCRIPT = `
(() => {
  try {
    const html = document.documentElement;
    const savedTheme = localStorage.getItem("lambdaidx-theme");
    const savedFontSize = localStorage.getItem("lambdaidx-font-size");

    let theme;
    if (savedTheme === "light" || savedTheme === "dark") {
      theme = savedTheme;
    } else {
      // Detect system theme preference
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      theme = systemDark ? "dark" : "light";
    }

    const fontSize = savedFontSize === "sm" || savedFontSize === "lg" ? savedFontSize : "md";

    html.dataset.theme = theme;
    html.dataset.fontSize = fontSize;
    html.classList.toggle("dark", theme === "dark");
  } catch {
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = systemDark ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.fontSize = "md";
    document.documentElement.classList.toggle("dark", theme === "dark");
  }
})();
`;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://lambdaidx.dpdns.org");

export const metadata: Metadata = {
  title: {
    default: "LambdaIDX — Infraestructura de Conocimiento",
    template: "%s | LambdaIDX",
  },
  description:
    "Repositorio unificado de investigación y lectura de alta eficiencia para las Ciencias Fundamentales.",
  metadataBase: new URL(siteUrl),
  icons: {
    icon: "/icon.svg",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "LambdaIDX — Infraestructura de Conocimiento",
    description:
      "Repositorio unificado de investigación y lectura de alta eficiencia para las Ciencias Fundamentales.",
    url: siteUrl,
    siteName: "LambdaIDX",
    images: [
      {
        url: "/api/og?title=LambdaIDX&excerpt=Repositorio%20unificado%20de%20investigacion%20jerarquica",
        width: 1200,
        height: 630,
        alt: "LambdaIDX Knowledge Base",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LambdaIDX — Infraestructura de Conocimiento",
    description:
      "Repositorio unificado de investigación y lectura de alta eficiencia para las Ciencias Fundamentales.",
    images: [
      "/api/og?title=LambdaIDX&excerpt=Repositorio%20unificado%20de%20investigacion%20jerarquica",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Script id="lambdaidx-accessibility-init" strategy="beforeInteractive">
          {ACCESSIBILITY_INIT_SCRIPT}
        </Script>
        {children}
        <TerminalToaster />
        <SpeedInsights />
        <SpeculationRules />
      </body>
    </html>
  );
}
