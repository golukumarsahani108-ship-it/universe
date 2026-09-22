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

    if (!username.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email: username.trim(),
        password,
      });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    router.push("/surprise");
    router.refresh();
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
                      USERNAME
                    </label>

                    <div className="login-input">

                      <span className="input-icon">
                        ♙
                      </span>

                      <input
                        id="username"
                        type="email"
                        placeholder="Username"
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