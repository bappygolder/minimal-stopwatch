'use client';

import { useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase-client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type AuthGateProps = {
  children: (props: { user: User | null }) => ReactNode;
};

export function AuthGate({ children }: AuthGateProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If Supabase is not configured yet, skip auth gating so the
  // app still works in local/demo mode.
  const supa = supabase;

  useEffect(() => {
    if (!supa) {
      setLoading(false);
      return;
    }

    const setup = async () => {
      const { data, error } = await supa.auth.getSession();
      if (!error) {
        setUser(data.session?.user ?? null);
      }
      setLoading(false);
    };

    void setup();

    const { data } = supa.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [supa]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supa) return;

    setSubmitting(true);
    setError(null);

    try {
      if (mode === "sign-in") {
        const { error } = await supa.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supa.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err?.message ?? "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (!supa) {
    // Env not set yet – render children without auth.
    return <>{children({ user: null })}</>;
  }

  if (loading) {
    return (
      <div className="h-screen bg-chrono-bg-page flex items-center justify-center">
        <span className="text-chrono-fg-muted text-sm">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen bg-chrono-bg-page flex items-center justify-center px-4">
        <Card className="w-full max-w-sm px-6 py-5 bg-card/90">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground tracking-wide uppercase">
              Chrono<span className="font-normal text-chrono-fg-muted">Minimal</span>
            </h2>
            <button
              type="button"
              onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
              className="text-xs text-chrono-fg-muted hover:text-foreground underline-offset-4 hover:underline"
            >
              {mode === "sign-in" ? "Need an account?" : "Have an account?"}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="block text-xs text-chrono-fg-muted">Email</label>
              <Input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs text-chrono-fg-muted">Password</label>
              <Input
                type="password"
                autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 mt-1">{error}</p>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full mt-2"
            >
              {submitting
                ? mode === "sign-in"
                  ? "Signing in..."
                  : "Signing up..."
                : mode === "sign-in"
                  ? "Sign in"
                  : "Sign up"}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return <>{children({ user })}</>;
}
