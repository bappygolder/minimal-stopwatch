import "./globals.css";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-chrono-bg-page text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
