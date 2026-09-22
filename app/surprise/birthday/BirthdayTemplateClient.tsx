"use client";

import { useRouter } from "next/navigation";
import PageShell from "@/component/layout/PageShell";
import GlassCard from "@/component/glass/GlassCard";
import GlassButton from "@/component/glass/GlassButton";
import "./birthday.css";

type DynamicTemplate = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  thumbnail_url: string | null;
  thumbnail_path: string | null;
  package_path: string;
  entry_path: string;
  schema: unknown;
  status: string;
  version: string;
};

type Props = {
  templates: DynamicTemplate[];
};

export default function BirthdayTemplateClient({
  templates,
}: Props) {
  const router = useRouter();

  const chooseBuiltInTemplate = (
    template: "birthday-01" | "birthday-02"
  ) => {
    localStorage.setItem("birthday-template", template);

    router.push(
      `/surprise/customize?template=${template}`
    );
  };

  const chooseDynamicTemplate = (
    template: DynamicTemplate
  ) => {
    localStorage.setItem(
      "birthday-template",
      template.id
    );

    router.push(
      `/surprise/customize?template=${encodeURIComponent(
        template.id
      )}`
    );
  };

  return (
    <PageShell
      title="Birthday"
      description="Choose the birthday surprise world you want to create ✨"
    >
      <main className="birthday-template-page">

        <div className="birthday-template-header">
          <span>🎂 BIRTHDAY EDITION</span>

          <h1>
            Choose your
            <span> Birthday Surprise ♡</span>
          </h1>

          <p>
            Pick a little world for their special day.
            You can customize everything after choosing a design.
          </p>
        </div>

        <div className="birthday-template-grid">

          {/* OPTION 01 */}

          <GlassCard className="birthday-template-card">
            <div className="template-number">
              01
            </div>

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
              <span className="template-label">
                OPTION 01
              </span>

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
                Choose Option 01 →
              </GlassButton>
            </div>
          </GlassCard>


          {/* OPTION 02 */}

          <GlassCard className="birthday-template-card">
            <div className="template-number">
              02
            </div>

            <div className="template-preview box-preview">
              <div className="box-orbit orbit-one" />
              <div className="box-orbit orbit-two" />

              <div className="birthday-box">
                <div className="box-lid">
                  <span>♡</span>
                </div>

                <div className="box-body">
                  <small>BIRTHDAY</small>
                  <strong>THE BOX</strong>
                  <span>SECRET EDITION</span>
                </div>
              </div>

              <div className="floating-star star-one">
                ✦
              </div>

              <div className="floating-star star-two">
                ✧
              </div>

              <div className="floating-star star-three">
                ·
              </div>
            </div>

            <div className="template-info">
              <span className="template-label">
                OPTION 02
              </span>

              <h2>
                THE BOX — Birthday Edition
              </h2>

              <p>
                A different interactive birthday
                journey with private access, hidden
                fragments, mirror, frequency, archive,
                message and final wish.
              </p>

              <GlassButton
                active
                onClick={() =>
                  chooseBuiltInTemplate(
                    "birthday-02"
                  )
                }
              >
                Choose Option 02 →
              </GlassButton>
            </div>
          </GlassCard>


          {/* ADMIN UPLOADED TEMPLATES */}

          {templates.map((template, index) => (
            <GlassCard
              key={template.id}
              className="birthday-template-card"
            >
              <div className="template-number">
                {String(index + 3).padStart(2, "0")}
              </div>

              <div className="template-preview dynamic-preview">

                {template.thumbnail_url ? (
                  <img
                    src={template.thumbnail_url}
                    alt={template.name}
                    className="dynamic-template-image"
                  />
                ) : (
                  <div className="dynamic-template-placeholder">
                    <span>✦</span>

                    <strong>
                      {template.name}
                    </strong>

                    <small>
                      BIRTHDAY TEMPLATE
                    </small>
                  </div>
                )}

              </div>

              <div className="template-info">

                <span className="template-label">
                  NEW TEMPLATE
                </span>

                <h2>
                  {template.name}
                </h2>

                <p>
                  {template.description ||
                    "A little birthday world created for your special surprise."}
                </p>

                <GlassButton
                  active
                  onClick={() =>
                    chooseDynamicTemplate(
                      template
                    )
                  }
                >
                  Choose This Design →
                </GlassButton>

              </div>
            </GlassCard>
          ))}

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