import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "M. Timer",
  description: "A minimal, distraction-free stopwatch app.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-chrono-bg-page text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
