import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mnemoboard",
  description: "Zapamiętywanie z mnemotechnikami: plansze, karteczki, słowa-obrazy.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
