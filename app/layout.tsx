import type { Metadata } from "next";
import "./globals.css";

import { FeatureProvider } from "@/component/settings/feature-store";
import { AIProvider } from "@/component/ai/AIProvider";
import { AICompanion } from "@/component/ai/AICompanion";

export const metadata: Metadata = {
  title: "My Little Universe",
  description: "My personal little universe",

  manifest: "/manifest.webmanifest",

  icons: {
    icon: [
      {
        url: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/icon-512.png",
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