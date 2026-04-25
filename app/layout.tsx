import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

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

export const metadata: Metadata = {
  title: {
    default: "LambdaIDX — Knowledge Infrastructure",
    template: "%s | LambdaIDX",
  },
  description: "High-performance knowledge engine for deep hierarchies and premium reading experiences.",
  metadataBase: new URL("https://lambdaidx.com"),
  icons: {
    icon: "/icon.svg",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "LambdaIDX",
    description: "Engineering-first wisdom management for the modern era.",
    url: "https://lambdaidx.com",
    siteName: "LambdaIDX",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
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
      <body className="min-h-full flex flex-col">
        <Script id="lambdaidx-accessibility-init" strategy="beforeInteractive">
          {ACCESSIBILITY_INIT_SCRIPT}
        </Script>
        {children}
      </body>
    </html>
  );
}
