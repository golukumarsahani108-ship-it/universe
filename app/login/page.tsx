"use client";

import {
  Suspense,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "welcome" | "login" | "signup";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [mode, setMode] =
    useState<Mode>("welcome");
  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session?.user) {
        const redirect =
          searchParams.get("redirect") || "/me";

        const safeRedirect =
          redirect.startsWith("/") &&
          !redirect.startsWith("//")
            ? redirect
            : "/me";

        router.replace(safeRedirect);
      }
    }

    checkSession();

    return () => {
      mounted = false;
    };
  }, [router, supabase, searchParams]);

  async function continueWithGoogle() {
    if (loading) return;

    setLoading(true);

    const redirect =
      searchParams.get("redirect") || "/";

    const safeRedirect =
      redirect.startsWith("/") &&
      !redirect.startsWith("//")
        ? redirect
        : "/";

    const callbackUrl = new URL(
      "/api/auth/callback",
      window.location.origin
    );

    callbackUrl.searchParams.set(
      "next",
      safeRedirect
    );

    const { error } =
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl.toString(),

          queryParams: {
            prompt: "select_account",
          },
        },
      });

    if (error) {
      console.error(error);
      setLoading(false);
    }
  }

  const hasError =
    searchParams.get("error");

  /* ================================
     WELCOME
  ================================= */

  if (mode === "welcome") {
    return (
      <main className="auth-page">

        <Link
          href="/"
          className="auth-back-home"
        >
          ← Back to Home
        </Link>

        <div className="auth-welcome-card">

          <div className="auth-welcome-orb">
            ✨
          </div>

          <div className="auth-welcome-label">
            START YOUR JOURNEY
          </div>

          <h1>
            Hello,
            <br />
            Universe!
          </h1>

          <p>
            Don't have an account?
            <br />
            Create your own little space.
          </p>

          <button
            type="button"
            className="auth-primary-button"
            onClick={() =>
              setMode("signup")
            }
          >
            <span>
              Create Account
            </span>

            <span className="auth-arrow">
              →
            </span>
          </button>

          <button
            type="button"
            className="auth-login-link"
            onClick={() =>
              setMode("login")
            }
          >
            Already have an account?
            <strong>
              {" "}Sign In
            </strong>
          </button>

        </div>

      </main>
    );
  }

  /* ================================
     LOGIN / SIGNUP
  ================================= */

  return (
    <main className="auth-page">

      <Link
        href="/"
        className="auth-back-home"
      >
        ← Back to Home
      </Link>

      <div
        className={`auth-container ${
          mode === "login"
            ? "login-active"
            : "signup-active"
        }`}
      >

        {/* LOGIN */}

        <section className="auth-form-panel auth-login-form">

          <div className="auth-form-content">

            <div className="auth-small-title">
              MY LITTLE UNIVERSE
            </div>

            <div className="auth-form-orb">
              🌌
            </div>

            <h1>
              Welcome Back
            </h1>

            <p className="auth-subtitle">
              Come back to your little universe.
            </p>

            <button
              type="button"
              className="google-button"
              onClick={continueWithGoogle}
              disabled={loading}
            >
              <span className="google-icon" aria-hidden="true">
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="#4285F4"
      d="M21.35 12.27c0-.79-.07-1.55-.23-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z"
    />
    <path
      fill="#34A853"
      d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.75 9.75 0 0 0 12 21.75Z"
    />
    <path
      fill="#FBBC05"
      d="M6.54 13.83A5.86 5.86 0 0 1 6.23 12c0-.64.11-1.26.31-1.83V7.64H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.05 4.36l3.24-2.53Z"
    />
    <path
      fill="#EA4335"
      d="M12 6.14c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.2 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.7 5.39l3.24 2.53C7.31 7.86 9.46 6.14 12 6.14Z"
    />
  </svg>
</span>

              <span>
                {loading
                  ? "Connecting..."
                  : "Continue with Google"}
              </span>
            </button>

            {hasError && (
              <div className="auth-message">
                Google sign in could not be completed.
                Please try again.
              </div>
            )}

            <div className="auth-trust">
              🔒 Secure sign in with Google
            </div>

          </div>

        </section>

        {/* SIGNUP */}

        <section className="auth-form-panel auth-signup-form">

          <div className="auth-form-content">

            <div className="auth-small-title">
              START YOUR JOURNEY
            </div>

            <div className="auth-form-orb signup-orb">
              ✨
            </div>

            <h1>
              Create Account
            </h1>

            <p className="auth-subtitle">
              Create your own little universe.
            </p>

            <button
              type="button"
              className="google-button"
              onClick={continueWithGoogle}
              disabled={loading}
            >
              <span className="google-icon">
                G
              </span>

              <span>
                {loading
                  ? "Connecting..."
                  : "Continue with Google"}
              </span>
            </button>

            {hasError && (
              <div className="auth-message">
                Google sign in could not be completed.
                Please try again.
              </div>
            )}

            <div className="auth-benefits">

              <div className="auth-benefit">
                <span>✦</span>
                <span>
                  Your own personal universe
                </span>
              </div>

              <div className="auth-benefit">
                <span>✦</span>
                <span>
                  Keep your memories & dreams
                </span>
              </div>

              <div className="auth-benefit">
                <span>✦</span>
                <span>
                  Build your journey your way
                </span>
              </div>

            </div>

          </div>

        </section>

        {/* SLIDER */}

        <div className="auth-slider">

          {mode === "signup" ? (

            <div className="auth-slider-content">

              <div className="auth-slider-orb">
                🌌
              </div>

              <div className="auth-slider-label">
                WELCOME BACK
              </div>

              <h2>
                Welcome
                <br />
                Back!
              </h2>

              <p>
                Already have an account?
                <br />
                Continue your journey.
              </p>

              <button
                type="button"
                className="auth-outline-button"
                onClick={() =>
                  setMode("login")
                }
              >
                <span>←</span>
                Sign In
              </button>

            </div>

          ) : (

            <div className="auth-slider-content">

              <div className="auth-slider-orb">
                ✨
              </div>

              <div className="auth-slider-label">
                START YOUR JOURNEY
              </div>

              <h2>
                Hello,
                <br />
                Universe!
              </h2>

              <p>
                Don't have an account?
                <br />
                Create your own little space.
              </p>

              <button
                type="button"
                className="auth-outline-button"
                onClick={() =>
                  setMode("signup")
                }
              >
                Create Account
                <span>→</span>
              </button>

            </div>

          )}

        </div>

      </div>

    </main>
  );
}

/* =================================
   PAGE
================================= */

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}