"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import GlassCard from "@/component/glass/GlassCard";
import GlassButton from "@/component/glass/GlassButton";

type ProfileData = {
  name: string;
  bio: string;
  birthday: string;
  location: string;
  image: string;
};

const DEFAULT_PROFILE: ProfileData = {
  name: "",
  bio: "",
  birthday: "",
  location: "",
  image: "",
};

export default function MePage() {
  const router = useRouter();
  const supabase = createClient();

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [googleName, setGoogleName] = useState("");
  const [googleAvatar, setGoogleAvatar] = useState("");

  const [profile, setProfile] =
    useState<ProfileData>(DEFAULT_PROFILE);

  const [draft, setDraft] =
    useState<ProfileData>(DEFAULT_PROFILE);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        router.replace("/login?redirect=%2Fme");
        return;
      }

      const metadata = user.user_metadata ?? {};

      const providerName =
        metadata.full_name ||
        metadata.name ||
        "";

      const providerAvatar =
        metadata.avatar_url ||
        metadata.picture ||
        "";

      setUserId(user.id);
      setEmail(user.email ?? "");
      setGoogleName(providerName);
      setGoogleAvatar(providerAvatar);

      const storageKey =
        `my-little-universe-me-user-${user.id}`;

      const saved = localStorage.getItem(storageKey);

      let savedProfile = DEFAULT_PROFILE;

      if (saved) {
        try {
          const parsed = JSON.parse(saved);

          savedProfile = {
            ...DEFAULT_PROFILE,
            ...parsed,
          };
        } catch {
          savedProfile = DEFAULT_PROFILE;
        }
      }

      const finalProfile = {
        ...savedProfile,
        name:
          savedProfile.name ||
          providerName ||
          "My Universe",
      };

      setProfile(finalProfile);
      setDraft(finalProfile);
      setLoading(false);
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  const saveProfile = () => {
    if (!userId) return;

    setSaving(true);

    const storageKey =
      `my-little-universe-me-user-${userId}`;

    localStorage.setItem(
      storageKey,
      JSON.stringify(draft)
    );

    setProfile(draft);
    setEditing(false);
    setSaving(false);
  };

  const cancelEditing = () => {
    setDraft(profile);
    setEditing(false);
  };

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please choose an image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be smaller than 2MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setDraft((current) => ({
        ...current,
        image: String(reader.result),
      }));
    };

    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setDraft((current) => ({
      ...current,
      image: "",
    }));
  };

  const logout = async () => {
    await supabase.auth.signOut({
      scope: "local",
    });

    router.replace("/login");
    router.refresh();
  };

  const displayName =
    profile.name ||
    googleName ||
    "My Little Universe";

  const displayAvatar =
    profile.image ||
    googleAvatar;

  if (loading) {
    return (
      <main className="me-page">
        <div className="me-loading glass">
          <div className="me-loading-orb">✦</div>
          <h2>Opening your universe...</h2>
          <p>Please wait a moment.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="me-page">

      {/* BACK */}
      <Link
        href="/"
        className="me-back glass"
      >
        ← Back to Universe
      </Link>

      {/* HERO */}
      <section className="me-hero glass">

        <div className="me-hero-glow" />

        <div className="me-profile-area">

          <div className="me-avatar-wrap">

            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt="Profile"
                className="me-avatar"
              />
            ) : (
              <div className="me-avatar me-avatar-fallback">
                {displayName
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

            {editing && (
              <label className="me-avatar-edit">
                +
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  hidden
                />
              </label>
            )}
          </div>

          <div className="me-hero-text">

            <span className="me-eyebrow">
              ✦ MY UNIVERSE
            </span>

            <h1>{displayName}</h1>

            <p className="me-email">
              {email}
            </p>

            <p className="me-bio-preview">
              {profile.bio ||
                "A little space that belongs entirely to you."}
            </p>

          </div>
        </div>

        <div className="me-hero-actions">
          {!editing ? (
            <GlassButton
              onClick={() => setEditing(true)}
              active
            >
              ✏️ Edit Profile
            </GlassButton>
          ) : (
            <>
              <GlassButton
                onClick={saveProfile}
                active
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "✓ Save Changes"}
              </GlassButton>

              <GlassButton
                onClick={cancelEditing}
              >
                Cancel
              </GlassButton>
            </>
          )}
        </div>
      </section>

      {/* EDIT PROFILE */}
      {editing && (
        <section className="me-edit-section">

          <GlassCard className="me-edit-card">

            <div className="me-section-heading">
              <div>
                <span className="me-mini-label">
                  PERSONAL DETAILS
                </span>

                <h2>Edit your profile</h2>

                <p>
                  Keep your little universe up to date.
                </p>
              </div>
            </div>

            <div className="me-form-grid">

              <label className="me-field">
                <span>Name</span>

                <input
                  value={draft.name}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      name: event.target.value,
                    })
                  }
                  placeholder="Your name"
                />
              </label>

              <label className="me-field">
                <span>Location</span>

                <input
                  value={draft.location}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      location: event.target.value,
                    })
                  }
                  placeholder="Where you are from"
                />
              </label>

              <label className="me-field">
                <span>Birthday</span>

                <input
                  type="date"
                  value={draft.birthday}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      birthday: event.target.value,
                    })
                  }
                />
              </label>

              <label className="me-field me-field-full">
                <span>About you</span>

                <textarea
                  value={draft.bio}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      bio: event.target.value,
                    })
                  }
                  placeholder="Write something about yourself..."
                  maxLength={300}
                />

                <small>
                  {draft.bio.length}/300
                </small>
              </label>

            </div>

            <div className="me-photo-actions">

              <label className="me-upload-button">
                📷 Change Profile Photo

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  hidden
                />
              </label>

              {draft.image && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="me-remove-photo"
                >
                  Remove photo
                </button>
              )}

            </div>

          </GlassCard>
        </section>
      )}

      {/* ACCOUNT */}
      <section className="me-section">

        <div className="me-section-title">
          <span>ACCOUNT</span>
          <h2>Your space</h2>
        </div>

        <div className="me-account-grid">

          <GlassCard className="me-account-card">

            <div className="me-card-icon">
              🔐
            </div>

            <div>
              <span className="me-card-label">
                CONNECTED ACCOUNT
              </span>

              <h3>Google Account</h3>

              <p>
                {email}
              </p>
            </div>

            <span className="me-connected">
              ● Connected
            </span>

          </GlassCard>

          <GlassCard className="me-account-card">

            <div className="me-card-icon">
              ✨
            </div>

            <div>
              <span className="me-card-label">
                PROFILE
              </span>

              <h3>Your identity</h3>

              <p>
                Your personal details stay connected
                to this account.
              </p>
            </div>

          </GlassCard>

        </div>
      </section>

      {/* QUICK SPACE */}
      <section className="me-section">

        <div className="me-section-title">
          <span>YOUR UNIVERSE</span>
          <h2>Explore your space</h2>
        </div>

        <div className="me-links-grid">

          <Link
            href="/memories"
            className="me-link-card glass"
          >
            <span>🧠</span>
            <div>
              <strong>Memories</strong>
              <small>Little moments worth keeping</small>
            </div>
            <b>→</b>
          </Link>

          <Link
            href="/dreams"
            className="me-link-card glass"
          >
            <span>🌙</span>
            <div>
              <strong>Dreams</strong>
              <small>Things you want to experience</small>
            </div>
            <b>→</b>
          </Link>

          <Link
            href="/goals"
            className="me-link-card glass"
          >
            <span>🎯</span>
            <div>
              <strong>Goals</strong>
              <small>Things you're working toward</small>
            </div>
            <b>→</b>
          </Link>

          <Link
            href="/journey"
            className="me-link-card glass"
          >
            <span>🧭</span>
            <div>
              <strong>My Journey</strong>
              <small>Your story so far</small>
            </div>
            <b>→</b>
          </Link>

          <Link
            href="/favorites"
            className="me-link-card glass"
          >
            <span>⭐</span>
            <div>
              <strong>Favorites</strong>
              <small>Things you love</small>
            </div>
            <b>→</b>
          </Link>

          <Link
            href="/ideas"
            className="me-link-card glass"
          >
            <span>💡</span>
            <div>
              <strong>Ideas</strong>
              <small>Your thoughts and sparks</small>
            </div>
            <b>→</b>
          </Link>

        </div>
      </section>

      {/* PERSONAL NOTE */}
      <section className="me-note glass">

        <div className="me-note-orb">
          ✦
        </div>

        <div>
          <span>
            A NOTE FOR YOU
          </span>

          <h2>
            This is your little universe.
          </h2>

          <p>
            Keep your memories, dreams, goals,
            ideas and little moments here.
          </p>
        </div>

      </section>

      {/* LOGOUT */}
      <section className="me-logout-section">

        <GlassCard className="me-logout-card">

          <div>
            <span className="me-card-label">
              ACCOUNT
            </span>

            <h3>Sign out of your universe</h3>

            <p>
              You can come back anytime with your
              Google account.
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="me-logout-button"
          >
            Logout
          </button>

        </GlassCard>

      </section>

      <div className="me-footer-space" />

    </main>
  );
}