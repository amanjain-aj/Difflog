import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DiffLog (difflog.dev) — Automated OpenAPI Changelogs & Doc Sync",
  description:
    "Stripe-grade API changelogs, generated deterministically from your Git commits and OpenAPI schemas via oasdiff and Groq LPU structured completions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090A0F] text-zinc-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}
