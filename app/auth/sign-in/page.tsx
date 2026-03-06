"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/components/hrms/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, login, setPendingEmail, getBootstrapState } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugOtpCode, setDebugOtpCode] = useState<string | null>(null);
  const [needsBootstrap, setNeedsBootstrap] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [router, status]);

  useEffect(() => {
    void getBootstrapState()
      .then((result) => setNeedsBootstrap(result.needs_bootstrap))
      .catch(() => setNeedsBootstrap(false));
  }, [getBootstrapState]);

  const next = searchParams.get("next") || "/dashboard";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setDebugOtpCode(null);
    try {
      const result = await login({ email, password });
      setPendingEmail(result.email, result.debug_otp_code);
      setDebugOtpCode(result.debug_otp_code || null);
      router.push(`/auth/verify-otp?next=${encodeURIComponent(next)}`);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eff6ff_0%,#f8fafc_100%)] px-4 py-10 dark:bg-[linear-gradient(180deg,#020617_0%,#111827_100%)]">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_420px]">
        <section className="rounded-[2rem] border border-border/60 bg-card/90 p-8 shadow-lg">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
            Password sign-in
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
            Sign in after approval
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
            Features 6 through 10 start here: password login, account lockout handling, OTP challenge, OTP resend, and session creation after verification.
          </p>
          {needsBootstrap && (
            <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-4 text-sm text-foreground">
              No admin account exists yet.
              {" "}
              <Link href="/auth/bootstrap-admin" className="font-medium text-primary hover:underline">
                Initialize the first admin from the web
              </Link>
              .
            </div>
          )}
          {debugOtpCode && (
            <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-4 text-sm text-amber-700 dark:text-amber-300">
              Development OTP preview: <span className="font-semibold">{debugOtpCode}</span>
            </div>
          )}
        </section>

        <Card className="rounded-[2rem] border-border/60 bg-card/95 shadow-lg">
          <CardHeader>
            <CardTitle>Account sign-in</CardTitle>
            <CardDescription>
              Connected to the native login endpoint.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="employee@northstar.local" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
              </div>
              {error && <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
              <Button className="w-full" disabled={submitting}>
                {submitting ? <Spinner className="size-4" /> : null}
                Continue to OTP
              </Button>
            </form>
            <div className="mt-4 flex items-center justify-between text-sm">
              <Link href="/auth/request-access" className="text-primary hover:underline">
                Request access
              </Link>
              <span className="text-muted-foreground">Password setup happens after admin approval</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-5 py-4 text-sm text-muted-foreground shadow-sm">
            <Spinner className="size-5" />
            Loading sign-in...
          </div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
