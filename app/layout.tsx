import type { Metadata } from "next";
import "./globals.css";

import { FeatureProvider } from "@/component/settings/feature-store";
import { AIProvider } from "@/component/ai/AIProvider";
import { AICompanion } from "@/component/ai/AICompanion";

export const metadata: Metadata = {
  title: "My Little Universe",
  description: "My personal little universe",

  verification: {
    google: "Y4l5rBxsgUhSXu61725pmp-dznYNRViLp5brs9mr0vI",
  },

  manifest: "/manifest.webmanifest",

  icons: {
    icon: [
      {
        url: "/icon/pookie-icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icon/pookie-icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },

  appleWebApp: {
    capable: true,
    title: "My Little Universe",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <FeatureProvider>
          <AIProvider>
            {children}
            <AICompanion />
          </AIProvider>
        </FeatureProvider>
      </body>
    </html>
  );
}