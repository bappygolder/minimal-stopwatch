import "./globals.css";
import type { ReactNode } from "react";

const themeScript = `
  (function() {
    try {
      var stored = window.localStorage.getItem('chrono-theme');
      var theme = (stored === 'light' || stored === 'dark')
        ? stored
        : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light');

      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      // fail silently – theme will be corrected on client
    }
  })();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          // This runs before React hydration to avoid a flash of the wrong theme.
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
      </head>
      <body className="bg-chrono-bg-page text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
