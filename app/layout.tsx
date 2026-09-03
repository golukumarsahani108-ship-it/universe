import type { Metadata } from "next";
import "./globals.css";

import { FeatureProvider } from "@/component/settings/feature-store";
import { AIProvider } from "@/component/ai/AIProvider";
import { AICompanion } from "@/component/ai/AICompanion";

export const metadata: Metadata = {
  title: "My Little Universe",
  description: "My personal little universe",
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