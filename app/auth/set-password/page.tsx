"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
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

function SetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setPassword } = useAuth();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [password, setPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await setPassword({ token, password });
      setSuccess(`Password set successfully for ${result.email}. You can sign in now.`);
      setTimeout(() => router.push("/auth/sign-in"), 800);
    } catch (setPasswordError) {
      setError(setPasswordError instanceof Error ? setPasswordError.message : "Unable to set password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eff6ff_0%,#f8fafc_100%)] px-4 py-10 dark:bg-[linear-gradient(180deg,#020617_0%,#111827_100%)]">
      <div className="mx-auto max-w-xl">
        <Card className="rounded-[2rem] border-border/60 bg-card/95 shadow-lg">
          <CardHeader>
            <CardTitle>Set account password</CardTitle>
            <CardDescription>
              This page completes feature 5 using the admin-generated password setup link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPasswordValue(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
              {!token && <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">Missing password setup token.</div>}
              {success && <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">{success}</div>}
              {error && <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
              <Button className="w-full" disabled={!token || submitting}>
                {submitting ? <Spinner className="size-4" /> : null}
                Save password
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Back to{" "}
              <Link href="/auth/sign-in" className="text-primary hover:underline">
                sign-in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-5 py-4 text-sm text-muted-foreground shadow-sm">
            <Spinner className="size-5" />
            Loading password setup...
          </div>
        </div>
      }
    >
      <SetPasswordContent />
    </Suspense>
  );
}
