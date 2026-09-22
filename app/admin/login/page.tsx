"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const supabase = createClient();

    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError) {
      setError("Invalid admin credentials.");
      setLoading(false);
      return;
    }

    /*
     * Do not decide admin status in the browser.
     *
     * The dashboard performs the real server-side admin check.
     */
    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <main className="admin-login-page min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 admin-login-ambient" />

      <div className="relative w-full max-w-md">
        <div className="admin-login-card rounded-[30px] p-8">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.3em] admin-login-kicker">
              My Little Universe
            </p>

            <h1 className="mt-3 text-3xl font-semibold">
              Admin Portal
            </h1>

            <p className="mt-2 text-sm admin-login-muted">
              Secure platform administration
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm admin-login-label mb-2">
                Email
              </label>

              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="admin-login-input"
                placeholder="Admin email"
              />
            </div>

            <div>
              <label className="block text-sm admin-login-label mb-2">
                Password
              </label>

              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="admin-login-input"
                placeholder="Password"
              />
            </div>

            {error && (
              <div className="admin-login-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="admin-login-submit"
            >
              {loading ? "Signing in..." : "Sign in to Admin"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}