"use client";

import { useRouter } from "next/navigation";
import PageShell from "@/component/layout/PageShell";
import GlassCard from "@/component/glass/GlassCard";
import GlassButton from "@/component/glass/GlassButton";

export default function SurprisePage() {
  const router = useRouter();

  return (
   <PageShell
  title="Surprise"
  description="Create a little surprise experience ✨"
>
      <div className="surprise-home">
        <GlassCard className="surprise-home-card">
          <div className="surprise-home-icon">🎁</div>

          <span className="surprise-home-kicker">
            A LITTLE SOMETHING
          </span>

          <h1>
            Create a little
            <span> Surprise ♡</span>
          </h1>

          <p>
            Create a beautiful little surprise and share it
            with someone through a private link.
          </p>

          <GlassButton
            active
            onClick={() => router.push("/surprise/customize")}
          >
            Customize ✨
          </GlassButton>
        </GlassCard>
      </div>
    </PageShell>
  );
}