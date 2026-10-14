"use client";

import { useRouter } from "next/navigation";
import PageShell from "@/component/layout/PageShell";
import GlassCard from "@/component/glass/GlassCard";
import GlassButton from "@/component/glass/GlassButton";
import "./birthday.css";

export default function BirthdayTemplateClient() {
  const router = useRouter();

  const chooseBuiltInTemplate = (
    template: "birthday-01"
  ) => {
    localStorage.setItem("birthday-template", template);

    router.push(
      `/surprise/customize?template=${template}`
    );
  };

  return (
    <PageShell
      title="Birthday"
      description="Create your special birthday surprise."
    >
      <main className="birthday-template-page">

        <div className="birthday-template-header">
          <span>🎂 BIRTHDAY EDITION</span>

          <h1>
            Choose your
            <span> Birthday Surprise ♡</span>
          </h1>

          <p>
Your original birthday surprise is ready to customize.
          </p>
        </div>

        <div className="birthday-template-grid">

          <GlassCard className="birthday-template-card">


            <div className="template-preview original-preview">
              <div className="preview-glow" />

              <div className="preview-window">
                <div className="preview-dots">
                  <i />
                  <i />
                  <i />
                </div>

                <div className="preview-content">
                  <small>
                    A LITTLE SOMETHING
                  </small>

                  <strong>
                    FOR MY POOKIE ♡
                  </strong>

                  <span>
                    There&apos;s a surprise waiting
                    for you.
                  </span>

                  <div className="preview-button">
                    open your surprise ♡
                  </div>
                </div>
              </div>
            </div>

            <div className="template-info">
              <h2>
                Original Birthday Surprise
              </h2>

              <p>
                The original little-universe
                birthday experience with memories,
                letter, flowers, music and surprises.
              </p>

              <GlassButton
                active
                onClick={() =>
                  chooseBuiltInTemplate(
                    "birthday-01"
                  )
                }
              >
                Continue →
              </GlassButton>
            </div>
          </GlassCard>


        </div>

        <button
          className="birthday-back-button"
          onClick={() =>
            router.push("/surprise")
          }
        >
          ← Back
        </button>

      </main>
    </PageShell>
  );
}