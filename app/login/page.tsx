"use client";

import {
  Suspense,
  useEffect,
  useState,
} from "react";
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

  const [mode, setMode] = useState<Mode>("welcome");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session?.user) {
        router.replace("/me");
      }
    }

    checkSession();

    return () => {
      mounted = false;
    };
  }, [router, supabase]);

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
  const hasError = searchParams.get("error");

  /* ================================
     WELCOME
  ================================= */

  if (mode === "welcome") {
    return (
      <main className="auth-page">
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
            onClick={() => setMode("signup")}
          >
            <span>Create Account</span>

            <span className="auth-arrow">
              →
            </span>
          </button>

          <button
            type="button"
            className="auth-login-link"
            onClick={() => setMode("login")}
          >
            Already have an account?
            <strong> Sign In</strong>
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
                onClick={() => setMode("login")}
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
                onClick={() => setMode("signup")}
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