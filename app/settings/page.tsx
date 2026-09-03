"use client";

import { useState } from "react";

import PageShell from "@/component/layout/PageShell";
import GlassCard from "@/component/glass/GlassCard";
import GlassBadge from "@/component/glass/GlassBadge";
import FeatureCustomizer from "@/component/settings/feature-customizer";
import { useFeatures } from "@/component/settings/feature-store";
import SectionCustomizer from "@/component/settings/section-customizer";

export default function SettingsPage() {
  const {
  features,
  toggleFeature,
  updateFeatureItems,
  updateFeatureSections,
} = useFeatures();

  const [customizingId, setCustomizingId] =
    useState<string | null>(null);

  const [glassIntensity, setGlassIntensity] =
    useState(true);

  const [blurEffects, setBlurEffects] =
    useState(true);

  const [animations, setAnimations] =
    useState(true);

  const [cursorGlow, setCursorGlow] =
    useState(true);

  const [particles, setParticles] =
    useState(true);

  const [notifications, setNotifications] =
    useState(true);

  const customizingFeature = features.find(
    (feature) => feature.id === customizingId
  );

  return (
    <PageShell
      eyebrow="My Little Universe"
      title="Settings"
      description="Customize your universe exactly the way you want."
    >
      <div className="settings-stack">

        {/* FEATURES */}

        <GlassCard>
          <GlassBadge>FEATURES</GlassBadge>

          <div className="settings-heading">
            <h2>My Universe</h2>

            <p>
              Turn features on or off, or customize
              what appears inside them.
            </p>
          </div>

          <div className="settings-features">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="feature-setting"
              >
                <div className="feature-icon">
                  {feature.icon}
                </div>

                <div className="feature-info">
                  <h3>{feature.name}</h3>

                  <p>
                    {feature.enabled
                      ? "Feature is visible in your universe."
                      : "Feature is currently hidden."}
                  </p>
                </div>

                <button
                  type="button"
                  className="settings-action"
                  onClick={() =>
                    setCustomizingId(feature.id)
                  }
                >
                  Customize
                </button>

                <button
                  type="button"
                  className={`toggle ${
                    feature.enabled
                      ? "toggle-on"
                      : ""
                  }`}
                  aria-label={`Turn ${feature.name} ${
                    feature.enabled ? "off" : "on"
                  }`}
                  onClick={() =>
                    toggleFeature(feature.id)
                  }
                >
                  <span />
                </button>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* APPEARANCE */}

        <GlassCard>
          <GlassBadge>APPEARANCE</GlassBadge>

          <div className="settings-heading">
            <h2>Spatial Glass</h2>

            <p>
              Control the visual experience of your
              universe.
            </p>
          </div>

          <div className="settings-features">

            <SettingToggle
              icon="◈"
              title="Glass Intensity"
              description="Control the strength of glass surfaces."
              enabled={glassIntensity}
              onToggle={() =>
                setGlassIntensity(!glassIntensity)
              }
            />

            <SettingToggle
              icon="◌"
              title="Blur Effects"
              description="Enable glass blur and depth."
              enabled={blurEffects}
              onToggle={() =>
                setBlurEffects(!blurEffects)
              }
            />

            <SettingToggle
              icon="✦"
              title="Animations"
              description="Enable subtle floating motion."
              enabled={animations}
              onToggle={() =>
                setAnimations(!animations)
              }
            />

            <SettingToggle
              icon="☼"
              title="Cursor Glow"
              description="Follow the pointer with soft light."
              enabled={cursorGlow}
              onToggle={() =>
                setCursorGlow(!cursorGlow)
              }
            />

            <SettingToggle
              icon="✧"
              title="Particles"
              description="Show ambient universe particles."
              enabled={particles}
              onToggle={() =>
                setParticles(!particles)
              }
            />

          </div>
        </GlassCard>

        {/* NOTIFICATIONS */}

        <GlassCard>
          <GlassBadge>NOTIFICATIONS</GlassBadge>

          <div className="settings-row">
            <div>
              <h2>Notification Center</h2>

              <p>
                Birthday, study, goal and reminder
                notifications.
              </p>
            </div>

            <button
              type="button"
              className={`toggle ${
                notifications ? "toggle-on" : ""
              }`}
              onClick={() =>
                setNotifications(!notifications)
              }
            >
              <span />
            </button>
          </div>
        </GlassCard>

        {/* PRIVACY */}

        <GlassCard>
          <GlassBadge>PRIVACY</GlassBadge>

          <div className="settings-heading">
            <h2>Private Universe</h2>

            <p>
              Your personal space should stay personal.
            </p>
          </div>

          <div className="settings-coming">
            🔒 Private mode and secure database
            protection will be connected with
            Supabase later.
          </div>
        </GlassCard>

        {/* DATA */}

        <GlassCard>
          <GlassBadge>DATA</GlassBadge>

          <div className="settings-heading">
            <h2>My Data</h2>

            <p>
              Your current feature configuration is
              saved locally in this version.
            </p>
          </div>

          <div className="settings-coming">
            💾 Local settings active
          </div>
        </GlassCard>

      </div>

      {/* CUSTOMIZE MODAL */}

      {customizingFeature && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal glass">

            <div className="modal-header">
              <div>
                <div className="eyebrow">
                  CUSTOMIZE FEATURE
                </div>

                <h2>
                  {customizingFeature.icon}{" "}
                  {customizingFeature.name}
                </h2>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() =>
                  setCustomizingId(null)
                }
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <FeatureCustomizer
              featureName={customizingFeature.name}
              featureIcon={customizingFeature.icon}
              items={customizingFeature.items ?? []}
              onItemsChange={(items) =>
                updateFeatureItems(
                  customizingFeature.id,
                  items
                )
              }
            />
            {customizingFeature.sections &&
  customizingFeature.sections.length > 0 && (
    <SectionCustomizer
      featureName={customizingFeature.name}
      featureIcon={customizingFeature.icon}
      sections={customizingFeature.sections}
      onSectionsChange={(sections) =>
        updateFeatureSections(
          customizingFeature.id,
          sections
        )
      }
    />
  )}


          </div>
        </div>
      )}
    </PageShell>
  );
}


/* =========================================
   SETTING TOGGLE
========================================= */

type SettingToggleProps = {
  icon: string;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
};

function SettingToggle({
  icon,
  title,
  description,
  enabled,
  onToggle,
}: SettingToggleProps) {
  return (
    <div className="feature-setting">

      <div className="feature-icon">
        {icon}
      </div>

      <div className="feature-info">
        <h3>{title}</h3>

        <p>{description}</p>
      </div>

      <button
        type="button"
        className={`toggle ${
          enabled ? "toggle-on" : ""
        }`}
        onClick={onToggle}
      >
        <span />
      </button>

    </div>
  );
}