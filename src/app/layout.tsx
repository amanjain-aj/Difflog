import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DiffLog (difflog.dev) — Automated OpenAPI Changelogs & Doc Sync",
  description:
    "Stripe-grade API changelogs, generated deterministically from your Git commits and OpenAPI schemas via oasdiff and structured AI completions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-[#090A0F] dark:text-zinc-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-600 dark:selection:text-indigo-200 transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
