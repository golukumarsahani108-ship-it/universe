"use client";

import { useRouter } from "next/navigation";
import PageShell from "@/component/layout/PageShell";
import SurpriseCustomizer from "@/component/surprise/SurpriseCustomizer";
import type { SurpriseData } from "@/component/surprise/surprise-types";

export default function SurpriseCustomizePage() {
  const router = useRouter();

  return (
    <PageShell
      title="Customize Surprise"
      description="The original surprise design stays fixed. You only provide your own content, images, password and music."
      backHref="/surprise"
      backLabel="Back to Surprise"
    >
      <SurpriseCustomizer
        onContinue={(data: SurpriseData) => {
          localStorage.setItem(
            "my-universe-surprise",
            JSON.stringify(data)
          );

          router.push("/surprise/preview");
        }}
      />
    </PageShell>
  );
}
