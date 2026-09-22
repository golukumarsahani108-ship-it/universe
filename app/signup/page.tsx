"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import "./signup.css";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { error: signupError } =
      await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            full_name: name.trim(),
          },
        },
      });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    setSuccess(
      "Account created successfully. You can now login."
    );

    setLoading(false);

    setTimeout(() => {
      router.push("/login");
      router.refresh();
    }, 1200);
  }

  return (
    <main className="signup-page">

      <div className="signup-bg">
        <div className="signup-glow glow-one" />
        <div className="signup-glow glow-two" />

        <div className="signup-grid" />

        <div className="signup-circuit left-top" />
        <div className="signup-circuit right-bottom" />
      </div>


      <section className="signup-window">

        {/* TOP BAR */}

        <div className="signup-window-bar">

          <div className="signup-dots">
            <span className="dot-red" />
            <span className="dot-yellow" />
            <span className="dot-green" />
          </div>

          <div className="signup-window-title">
            MY LITTLE UNIVERSE
          </div>

          <div className="signup-secure">
            <span />
            SECURE CONNECTION
          </div>

        </div>


        {/* CONTENT */}

        <div className="signup-content">

          <div className="signup-card">

            {/* FORM */}

            <div className="signup-form-side">

              <div className="signup-form-inner">

                <div className="signup-label">
                  NEW ACCOUNT
                </div>

                <h1>
                  Create Account
                </h1>

                <div className="signup-line" />


                <form onSubmit={handleSignup}>

                  <div className="signup-input-group">

                    <label htmlFor="name">
                      NAME
                    </label>

                    <div className="signup-input">

                      <span>♙</span>

                      <input
                        id="name"
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) =>
                          setName(e.target.value)
                        }
                        autoComplete="name"
                      />

                    </div>

                  </div>


                  <div className="signup-input-group">

                    <label htmlFor="email">
                      EMAIL
                    </label>

                    <div className="signup-input">

                      <span>@</span>

                      <input
                        id="email"
                        type="email"
                        placeholder="Your email"
                        value={email}
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                        autoComplete="email"
                      />

                    </div>

                  </div>


                  <div className="signup-input-group">

                    <label htmlFor="password">
                      PASSWORD
                    </label>

                    <div className="signup-input">

                      <span>◆</span>

                      <input
                        id="password"
                        type="password"
                        placeholder="Create password"
                        value={password}
                        onChange={(e) =>
                          setPassword(e.target.value)
                        }
                        autoComplete="new-password"
                      />

                    </div>

                  </div>


                  <div className="signup-input-group">

                    <label htmlFor="confirm-password">
                      CONFIRM PASSWORD
                    </label>

                    <div className="signup-input">

                      <span>◆</span>

                      <input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) =>
                          setConfirmPassword(e.target.value)
                        }
                        autoComplete="new-password"
                      />

                    </div>

                  </div>


                  {error && (
                    <div className="signup-error">
                      {error}
                    </div>
                  )}


                  {success && (
                    <div className="signup-success">
                      {success}
                    </div>
                  )}


                  <button
                    type="submit"
                    className="signup-submit"
                    disabled={loading}
                  >
                    {loading
                      ? "Creating..."
                      : "Create Account"}
                  </button>

                </form>


                <div className="signup-login-link">

                  <span>
                    Already have an account?
                  </span>

                  <Link href="/login">
                    Login
                  </Link>

                </div>

              </div>

            </div>


            {/* WELCOME */}

            <div className="signup-welcome-side">

              <div className="signup-welcome-shape" />

              <div className="signup-welcome">

                <div className="signup-welcome-small">
                  MY LITTLE UNIVERSE
                </div>

                <h2>
                  YOUR
                  <br />
                  UNIVERSE
                  <br />
                  AWAITS.
                </h2>

                <div className="signup-welcome-line" />

                <p>
                  Create your account and start
                  <br />
                  building something beautiful.
                </p>

                <div className="signup-orbit">
                  <span />
                </div>

              </div>

            </div>

          </div>

        </div>


        {/* FOOTER */}

        <div className="signup-footer">

          <span>
            &lt;/&gt; signup.tsx
          </span>

          <span>
            MY LITTLE UNIVERSE
          </span>

          <span>
            ACCOUNT CREATION
          </span>

        </div>

      </section>

    </main>
  );
}