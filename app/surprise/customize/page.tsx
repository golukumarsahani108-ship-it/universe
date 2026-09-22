"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import SurpriseCustomizer from "@/component/surprise/SurpriseCustomizer";
import BirthdayBoxCustomizer from "@/component/surprise/BirthdayBoxCustomizer";
import DynamicTemplateCustomizer from "@/component/surprise/DynamicTemplateCustomizer";
import PageShell from "@/component/layout/PageShell";

function CustomizeContent() {
  const searchParams = useSearchParams();

  const template =
    searchParams.get("template") || "birthday-01";

  const isBoxTemplate =
    template === "birthday-02";

  const isBuiltInTemplate =
    template === "birthday-01" ||
    template === "birthday-02";

  if (!isBuiltInTemplate) {
    return (
      <PageShell
        title="Customize Your Website"
        description="Make this uploaded website yours ✨"
        className="dynamic-template-shell"
      >
        <DynamicTemplateLoader templateId={template} />
      </PageShell>
    );
  }

  return (
    <PageShell
      title={
        isBoxTemplate
          ? "THE BOX — Birthday Edition"
          : "Birthday Surprise"
      }
      description={
        isBoxTemplate
          ? "Customize your secret birthday box ✨"
          : "Create your little birthday surprise ✨"
      }
    >
      {isBoxTemplate ? (
        <BirthdayBoxCustomizer
          onContinue={(data) => {
            localStorage.setItem(
              "my-universe-surprise",
              JSON.stringify({
                ...data,
                template: "birthday-02",
              })
            );

            window.location.href =
              "/surprise/preview?template=birthday-02";
          }}
        />
      ) : (
        <SurpriseCustomizer
          onContinue={(data) => {
            localStorage.setItem(
              "my-universe-surprise",
              JSON.stringify({
                ...data,
                template: "birthday-01",
              })
            );

            window.location.href =
              "/surprise/preview?template=birthday-01";
          }}
        />
      )}
    </PageShell>
  );
}

function DynamicTemplateLoader({ templateId }: { templateId: string }) {
  const [template, setTemplate] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/templates/${encodeURIComponent(templateId)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Template not found.");
        setTemplate(data.template);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load template."));
  }, [templateId]);

  if (error) {
    return <div className="rounded-3xl border border-red-400/20 bg-red-500/10 p-6 text-sm text-red-100">{error}</div>;
  }

  if (!template) {
    return <div className="flex min-h-[300px] items-center justify-center text-sm text-white/50">Loading uploaded website…</div>;
  }

  return (
    <DynamicTemplateCustomizer
      template={template}
      onContinue={(data) => {
        localStorage.setItem("my-universe-surprise", JSON.stringify(data));
        window.location.href = `/surprise/preview?template=${encodeURIComponent(template.id)}`;
      }}
    />
  );
}

export default function CustomizePage() {
  return (
    <Suspense
      fallback={
        <PageShell
          title="Customize Your Surprise"
          description="Loading your little universe..."
        >
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <div className="mb-3 text-3xl animate-pulse">
                ✨
              </div>

              <p className="text-sm text-white/60">
                Loading your surprise...
              </p>
            </div>
          </div>
        </PageShell>
      }
    >
      <CustomizeContent />
    </Suspense>
  );
}