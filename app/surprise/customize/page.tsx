"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import PageShell from "@/component/layout/PageShell";
import SurpriseCustomizer from "@/component/surprise/SurpriseCustomizer";
import type { SurpriseData } from "@/component/surprise/surprise-types";

export default function SurpriseCustomizePage() {
  const router = useRouter();

  const [surpriseData, setSurpriseData] =
    useState<SurpriseData | null>(null);

  return (
    <PageShell
      title="Customize Surprise"
      description="Only text, images, password and music can be customized."
      backHref="/"
      backLabel="Back to Home"
    >
      <SurpriseCustomizer
        onContinue={(data) => {
          setSurpriseData(data);

          localStorage.setItem(
            "my-universe-surprise",
            JSON.stringify(data)
          );

          router.push("/surprise/preview");
        }}
      />

      {surpriseData && (
        <div className="surprise-save-ready">
          <span>✓</span>
          <p>Your surprise is ready for preview.</p>
        </div>
      )}
    </PageShell>
  );
}