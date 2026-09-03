"use client";

import { FormEvent, useState } from "react";
import PageShell from "@/component/layout/PageShell";
import GlassCard from "@/component/glass/GlassCard";
import GlassButton from "@/component/glass/GlassButton";
import GlassInput from "@/component/glass/GlassInput";

type SupportType = "Feature Request" | "Bug Report" | "Support" | "Other";

const supportTypes: {
  value: SupportType;
  label: string;
  icon: string;
  description: string;
}[] = [
  {
    value: "Feature Request",
    label: "Feature Request",
    icon: "💡",
    description: "Koi naya page ya feature add karwana hai?",
  },
  {
    value: "Bug Report",
    label: "Bug Report",
    icon: "🐛",
    description: "Koi bug ya problem mil gayi?",
  },
  {
    value: "Support",
    label: "Support",
    icon: "💬",
    description: "Kisi existing feature mein help chahiye?",
  },
  {
    value: "Other",
    label: "Other",
    icon: "📝",
    description: "Kuch aur batana hai?",
  },
];

export default function SupportPage() {
  const [type, setType] = useState<SupportType>("Feature Request");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSuccess("");
    setError("");

    if (!message.trim()) {
      setError("Please apna message likho.");
      return;
    }

    if (message.trim().length < 5) {
      setError("Message thoda detail mein likho.");
      return;
    }

    try {
      setSending(true);

      const response = await fetch("/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          message: message.trim(),
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Message send nahi ho paya.");
      }

      setSuccess(
        "Message successfully send ho gaya. Thank you! 💙"
      );

      setMessage("");
      setEmail("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Message send nahi ho paya."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <PageShell
      eyebrow="SUPPORT"
      title="Support Space 💬"
      description="Koi naya feature, naya page, bug ya suggestion ho — yahin message bhejo."
    >
      <div className="support-page-layout">
        {/* HERO */}
        <GlassCard className="support-hero">
          <div className="support-hero-icon">
            <svg
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M20 11.5C20 15.6421 16.4183 19 12 19C10.8704 19 9.79423 18.776 8.82843 18.3726L4 20L5.57492 16.3464C4.58731 15.018 4 13.3427 4 11.5C4 7.35786 7.58172 4 12 4C16.4183 4 20 7.35786 20 11.5Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 11.5H8.01M12 11.5H12.01M16 11.5H16.01"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div>
            <span className="support-eyebrow">NEED SOMETHING?</span>

            <h2>Tell me what you need ✨</h2>

            <p>
              Agar My Little Universe mein koi naya page, feature,
              improvement ya bug fix chahiye, message bhej do.
            </p>
          </div>
        </GlassCard>

        {/* REQUEST TYPES */}
        <section className="support-types-grid">
          {supportTypes.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`support-type-card ${
                type === item.value ? "active" : ""
              }`}
              onClick={() => setType(item.value)}
            >
              <span className="support-type-icon">{item.icon}</span>

              <span className="support-type-title">
                {item.label}
              </span>

              <span className="support-type-description">
                {item.description}
              </span>
            </button>
          ))}
        </section>

        {/* FORM */}
        <GlassCard className="support-form-card">
          <div className="support-form-header">
            <div>
              <span className="support-form-label">
                SELECTED REQUEST
              </span>

              <h2>
                {supportTypes.find(
                  (item) => item.value === type
                )?.icon}{" "}
                {type}
              </h2>
            </div>

            <span className="support-status-dot" />
          </div>

          <form onSubmit={handleSubmit} className="support-form">
            <GlassInput
              label="Your Email (optional)"
              placeholder="yourname@gmail.com"
              type="email"
              value={email}
              onChange={setEmail}
            />

            <label className="support-textarea-wrap">
              <span>Your Message</span>

              <textarea
                className="support-textarea"
                placeholder={
                  type === "Feature Request"
                    ? "Example: Mujhe ek new page chahiye jahan main..."
                    : type === "Bug Report"
                    ? "Example: Calendar page par..."
                    : type === "Support"
                    ? "Example: Mujhe is feature ko use karne mein..."
                    : "Apna message yahan likho..."
                }
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                maxLength={3000}
                rows={8}
              />

              <small>{message.length}/3000</small>
            </label>

            {success && (
              <div className="support-feedback success">
                ✓ {success}
              </div>
            )}

            {error && (
              <div className="support-feedback error">
                ! {error}
              </div>
            )}

            <GlassButton
              type="submit"
              disabled={sending}
              className="support-send-button"
            >
              {sending ? "Sending..." : "Send Message →"}
            </GlassButton>
          </form>
        </GlassCard>

        {/* INFO */}
        <GlassCard className="support-info-card">
          <div className="support-info-icon">🌌</div>

          <div>
            <h3>Keep building your universe</h3>

            <p>
              Tumhare ideas aur bug reports ko isi support space
              ke through bheja ja sakta hai.
            </p>
          </div>
        </GlassCard>
      </div>
    </PageShell>
  );
}