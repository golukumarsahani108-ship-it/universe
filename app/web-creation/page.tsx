"use client";

import { useRouter } from "next/navigation";
import PageShell from "@/component/layout/PageShell";
import GlassCard from "@/component/glass/GlassCard";
import GlassButton from "@/component/glass/GlassButton";

export default function WebCreationPage() {
  const router = useRouter();

  return (
    <PageShell title="Web Creation ✨">
      <div className="web-creation-page">
        {/* Hero */}
        <GlassCard className="web-creation-hero">
          <div className="web-creation-hero-glow" />

          <div className="web-creation-hero-content">
            <div className="web-creation-icon">✨</div>

            <div>
              <span className="web-creation-kicker">
                CREATE SOMETHING SPECIAL
              </span>

              <h1>Create Your Universe</h1>

              <p>
                Create a beautiful personalized experience for someone
                special and share it with them through a live link.
              </p>
            </div>

            <GlassButton
              active
              onClick={() => router.push("/create-universe")}
              className="web-creation-main-button"
            >
              ✨ Create Your Universe
            </GlassButton>
          </div>
        </GlassCard>

        {/* Quick actions */}
        <section className="web-creation-grid">
          <GlassCard
            className="web-creation-action-card"
            onClick={() => router.push("/create-universe")}
          >
            <div className="web-creation-action-icon">✨</div>

            <h2>Create New</h2>

            <p>
              Start a completely new personalized Universe from scratch.
            </p>

            <span className="web-creation-arrow">→</span>
          </GlassCard>

          <GlassCard className="web-creation-action-card">
            <div className="web-creation-action-icon">🌌</div>

            <h2>My Universes</h2>

            <p>
              View, edit, publish and share the Universes you have created.
            </p>

            <span className="web-creation-arrow">→</span>
          </GlassCard>

          <GlassCard className="web-creation-action-card">
            <div className="web-creation-action-icon">🎨</div>

            <h2>Templates</h2>

            <p>
              Explore beautiful experiences for birthdays, friends,
              family and special occasions.
            </p>

            <span className="web-creation-arrow">→</span>
          </GlassCard>
        </section>

        {/* How it works */}
        <GlassCard className="web-creation-how">
          <div className="web-creation-section-heading">
            <span>HOW IT WORKS</span>
            <h2>From an idea to a live Universe ✨</h2>
          </div>

          <div className="web-creation-steps">
            <CreationStep
              number="01"
              icon="💭"
              title="Tell us about it"
              text="Choose the occasion, person and everything you want to say."
            />

            <CreationStep
              number="02"
              icon="📸"
              title="Add your memories"
              text="Upload photos, messages, music, surprises and more."
            />

            <CreationStep
              number="03"
              icon="🎨"
              title="Make it yours"
              text="Choose the design, pages, animations and experience."
            />

            <CreationStep
              number="04"
              icon="🔗"
              title="Publish & share"
              text="Get a unique live link and send it to someone special."
            />
          </div>
        </GlassCard>

        {/* Occasions */}
        <GlassCard className="web-creation-occasions">
          <div className="web-creation-section-heading">
            <span>ANY MOMENT</span>
            <h2>Made for every special occasion</h2>
          </div>

          <div className="web-creation-occasion-list">
            <Occasion icon="🎂" text="Birthday" />
            <Occasion icon="👫" text="Friendship Day" />
            <Occasion icon="🧿" text="Raksha Bandhan" />
            <Occasion icon="💍" text="Anniversary" />
            <Occasion icon="💒" text="Wedding" />
            <Occasion icon="👩" text="Mother" />
            <Occasion icon="👨" text="Father" />
            <Occasion icon="👭" text="Sister" />
            <Occasion icon="👬" text="Brother" />
            <Occasion icon="❤️" text="Special Person" />
            <Occasion icon="🎓" text="Graduation" />
            <Occasion icon="✨" text="Anything" />
          </div>
        </GlassCard>

        {/* Final CTA */}
        <GlassCard className="web-creation-final-cta">
          <div className="web-creation-final-glow" />

          <div>
            <span>YOUR STORY. YOUR UNIVERSE.</span>

            <h2>
              Give someone a little universe
              <br />
              of their own. ✨
            </h2>
          </div>

          <GlassButton
            active
            onClick={() => router.push("/create-universe")}
          >
            Start Creating →
          </GlassButton>
        </GlassCard>
      </div>
    </PageShell>
  );
}

function CreationStep({
  number,
  icon,
  title,
  text,
}: {
  number: string;
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="web-creation-step">
      <div className="web-creation-step-top">
        <span className="web-creation-step-number">{number}</span>
        <span className="web-creation-step-icon">{icon}</span>
      </div>

      <h3>{title}</h3>

      <p>{text}</p>
    </div>
  );
}

function Occasion({
  icon,
  text,
}: {
  icon: string;
  text: string;
}) {
  return (
    <div className="web-creation-occasion">
      <span>{icon}</span>
      <small>{text}</small>
    </div>
  );
}