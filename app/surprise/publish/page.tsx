"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import PageShell from "@/component/layout/PageShell";
import GlassButton from "@/component/glass/GlassButton";

export default function SurprisePublishPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [publishedUrl, setPublishedUrl] = useState("");

  useEffect(() => {
    async function publish() {
      try {
        const stored = localStorage.getItem(
          "my-universe-surprise"
        );

        if (!stored) {
          setError("No surprise data found.");
          setLoading(false);
          return;
        }

        const surprise = JSON.parse(stored);

        setPublishing(true);

        const response = await fetch(
          "/api/surprise/publish",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ surprise }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "Publish failed."
          );
        }

        const fullUrl = `${window.location.origin}${result.url}`;

        setPublishedUrl(fullUrl);
        setLoading(false);
        setPublishing(false);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Could not publish surprise."
        );

        setLoading(false);
        setPublishing(false);
      }
    }

    publish();
  }, []);

  async function copyLink() {
    if (!publishedUrl) return;

    await navigator.clipboard.writeText(publishedUrl);
    alert("Surprise link copied ✨");
  }

  async function shareLink() {
    if (!publishedUrl) return;

    if (navigator.share) {
      await navigator.share({
        title: "A Little Surprise ♡",
        text: "I made a little surprise for you.",
        url: publishedUrl,
      });
      return;
    }

    await copyLink();
  }

  if (loading || publishing) {
    return (
      <PageShell
        eyebrow="CREATE SURPRISE"
        title="Publishing your surprise ✨"
        description="Just creating your private shareable universe..."
        backHref="/create-universe"
        backLabel="Back to Create Surprise"
      >
        <div className="surprise-publish-card glass">
          <div className="surprise-publish-icon">
            ✨
          </div>

          <h2>Creating your surprise...</h2>

          <p>
            Your images, music and pages are being connected.
          </p>

          <div className="surprise-publish-loader">
            <span />
            <span />
            <span />
          </div>
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell
        eyebrow="CREATE SURPRISE"
        title="Couldn’t publish"
        description={error}
        backHref="/surprise/preview"
        backLabel="Back to Preview"
      >
        <div className="surprise-publish-card glass">
          <div className="surprise-publish-icon">
            ♡
          </div>

          <h2>Something went wrong</h2>

          <p>{error}</p>

          <GlassButton
            active
            onClick={() =>
              router.push("/surprise/preview")
            }
          >
            Back to Preview
          </GlassButton>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="SURPRISE READY"
      title="Your surprise is live ✨"
      description="Anyone with this link can open the surprise."
      backHref="/"
      backLabel="Back to Home"
    >
      <div className="surprise-publish-card glass">
        <div className="surprise-publish-success">
          ✓
        </div>

        <h2>Published successfully ♡</h2>

        <p>
          Your unique surprise link has been created.
        </p>

        <div className="surprise-publish-link">
          {publishedUrl}
        </div>

        <div className="surprise-publish-actions">
          <GlassButton
            active
            onClick={copyLink}
          >
            Copy Link
          </GlassButton>

          <GlassButton onClick={shareLink}>
            Share
          </GlassButton>

          <GlassButton
            onClick={() =>
              router.push(publishedUrl.replace(window.location.origin, ""))
            }
          >
            Open Surprise
          </GlassButton>
        </div>
      </div>
    </PageShell>
  );
}