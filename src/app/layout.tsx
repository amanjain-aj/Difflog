import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DiffLog (difflog.dev) — The API Release Communication Platform",
  description:
    "Never ship silent breaking API changes again. DiffLog automatically diffs schemas in CI, alerts on breaking contract mutations, and publishes Stripe-grade changelogs with RSS feeds.",
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
