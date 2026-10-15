"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import "./login.css";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const loginId = username.trim();
    if (!loginId || !password) {
      setError("Please enter your username/email and password.");
      return;
    }

    setLoading(true);

    try {
      // Keep email-based accounts working; username accounts use the
      // existing server route so their internal Supabase email stays private.
      if (loginId.includes("@")) {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: loginId,
          password,
        });

        if (loginError) {
          setError("Invalid login credentials");
          setLoading(false);
          return;
        }
      } else {
        const response = await fetch("/api/auth/username-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: loginId, password }),
        });
        const result = await response.json();

        if (!response.ok) {
          setError(result.error || "Invalid login credentials");
          setLoading(false);
          return;
        }
      }

      router.push("/surprise");
      router.refresh();
    } catch {
      setError("Unable to log in right now. Please try again.");
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setLoading(true);

    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=%2Fsurprise`,
      },
    });

    if (googleError) {
      setError(googleError.message);
      setLoading(false);
    }
  }

  return (
    <main className="login-page">

      {/* =========================================
          BACKGROUND
      ========================================= */}

      <div className="login-bg">

        <div className="red-glow glow-1" />
        <div className="red-glow glow-2" />
        <div className="red-glow glow-3" />

        <div className="circuit circuit-left-top">
          <span />
          <span />
          <span />
        </div>

        <div className="circuit circuit-left-bottom">
          <span />
          <span />
          <span />
        </div>

        <div className="circuit circuit-right-top">
          <span />
          <span />
          <span />
        </div>

        <div className="circuit circuit-right-bottom">
          <span />
          <span />
          <span />
        </div>

        <div className="vertical-line line-left" />
        <div className="vertical-line line-right" />

        <div className="background-particles">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>

      </div>


      {/* =========================================
          MAIN WINDOW
      ========================================= */}

      <section className="login-window">

        {/* TOP BAR */}

        <div className="window-bar">

          <div className="window-dots">
            <span className="window-dot red" />
            <span className="window-dot yellow" />
            <span className="window-dot green" />
          </div>

          <div className="window-name">
            MY LITTLE UNIVERSE
          </div>

          <div className="window-status">
            <span />
            SECURE CONNECTION
          </div>

        </div>


        {/* =========================================
            LOGIN CONTENT
        ========================================= */}

        <div className="login-content">

          <div className="login-card">


            {/* LEFT LOGIN SIDE */}

            <div className="login-form-side">

              <div className="form-inner">

                <div className="form-top-label">
                  ACCOUNT ACCESS
                </div>

                <h1>
                  Login
                </h1>

                <div className="form-line" />


                <form onSubmit={handleLogin}>

                  {/* USERNAME */}

                  <div className="input-group">

                    <label htmlFor="username">
                      USERNAME / EMAIL
                    </label>

                    <div className="login-input">

                      <span className="input-icon">
                        ♙
                      </span>

                      <input
                        id="username"
                        type="text"
                        placeholder="Username or email"
                        value={username}
                        onChange={(e) =>
                          setUsername(e.target.value)
                        }
                        autoComplete="email"
                      />

                    </div>

                  </div>


                  {/* PASSWORD */}

                  <div className="input-group">

                    <label htmlFor="password">
                      PASSWORD
                    </label>

                    <div className="login-input">

                      <span className="input-icon">
                        ♙
                      </span>

                      <input
                        id="password"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) =>
                          setPassword(e.target.value)
                        }
                        autoComplete="current-password"
                      />

                    </div>

                  </div>


                  {/* ERROR */}

                  {error && (
                    <div className="login-error">
                      {error}
                    </div>
                  )}


                  {/* BUTTON */}

                  <button
                    type="submit"
                    className="login-submit"
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>

                  <div className="google-divider" aria-hidden="true">
                    <span />
                    <small>OR CONTINUE WITH</small>
                    <span />
                  </div>

                  <button
                    type="button"
                    className="google-login-button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                  >
                    <svg
                      className="google-logo"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.98 46.98 31.9 46.98 24.55z"/>
                      <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.14 1.45-4.88 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    Continue with Google
                  </button>

                </form>


                {/* SIGNUP */}

                <div className="form-links">

                  <span>
                    Don't own an account?
                  </span>

                  <Link href="/signup">
                    Sign up
                  </Link>

                </div>

                <Link
                  href="/forgot-password"
                  className="forgot-link"
                >
                  Forgot Password?
                </Link>

              </div>

            </div>


            {/* =====================================
                RIGHT WELCOME SIDE
            ===================================== */}

            <div className="welcome-side">

              <div className="welcome-shape" />

              <div className="welcome-content">

                <div className="welcome-small">
                  MY LITTLE UNIVERSE
                </div>

                <h2>
                  WELCOME
                  <br />
                  BACK!
                </h2>

                <div className="welcome-divider" />

                <p>
                  To keep connected with us please
                  <br />
                  login with your personal info.
                </p>

                <div className="welcome-orbit">
                  <span className="orbit-dot" />
                </div>

              </div>

            </div>

          </div>

        </div>


        {/* =========================================
            CODE FOOTER
        ========================================= */}

        <div className="code-footer">

          <div className="code-header">

            <div className="code-file">
              <span className="html-symbol">
                &lt;/&gt;
              </span>

              login.tsx
            </div>

            <div className="code-actions">
              <span>LOGIN PAGE</span>
              <b>VS</b>
              <span>FOLLOW FOR MORE</span>
            </div>

          </div>


          <div className="code-body">

            <div className="code-line">
              <span className="number">01</span>
              <span className="purple">import</span>{" "}
              <span className="white">
                {"{"}
              </span>{" "}
              <span className="yellow">
                useState
              </span>{" "}
              <span className="white">
                {"}"}
              </span>{" "}
              <span className="purple">
                from
              </span>{" "}
              <span className="green">
                &quot;react&quot;
              </span>
            </div>

            <div className="code-line">
              <span className="number">02</span>
              <span className="purple">import</span>{" "}
              <span className="white">
                {"{"}
              </span>{" "}
              <span className="yellow">
                Link
              </span>{" "}
              <span className="white">
                {"}"}
              </span>{" "}
              <span className="purple">
                from
              </span>{" "}
              <span className="green">
                &quot;next/link&quot;
              </span>
            </div>

            <div className="code-line empty">
              <span className="number">03</span>
            </div>

            <div className="code-line">
              <span className="number">04</span>
              <span className="purple">
                const
              </span>{" "}
              <span className="blue">
                Login
              </span>{" "}
              <span className="white">
                =
              </span>{" "}
              <span className="pink">
                ()
              </span>{" "}
              <span className="purple">
                =&gt;
              </span>{" "}
              <span className="white">
                {"{"}
              </span>
            </div>

            <div className="code-line indent">
              <span className="number">05</span>
              <span className="purple">
                return
              </span>{" "}
              <span className="white">
                (
              </span>
            </div>

            <div className="code-line indent-2">
              <span className="number">06</span>
              <span className="red-code">
                &lt;UniverseLogin /&gt;
              </span>
            </div>

            <div className="code-line indent">
              <span className="number">07</span>
              <span className="white">
                )
              </span>
            </div>

            <div className="code-line">
              <span className="number">08</span>
              <span className="white">
                {"}"}
              </span>
            </div>

          </div>

        </div>

      </section>


      {/* =========================================
          PAGE BRAND
      ========================================= */}

      <div className="page-brand">
        <span className="brand-dot" />
        MY LITTLE UNIVERSE
      </div>

      <div className="page-version">
        v1.0
      </div>

    </main>
  );
}