"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function BootstrapAdminPage() {
  const router = useRouter();
  const { bootstrapAdmin, getBootstrapState } = useAuth();
  const [needsBootstrap, setNeedsBootstrap] = useState<boolean | null>(null);
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getBootstrapState()
      .then((result) => setNeedsBootstrap(result.needs_bootstrap))
      .catch(() => setNeedsBootstrap(false));
  }, [getBootstrapState]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const user = await bootstrapAdmin(form);
      setSuccess(`Admin bootstrap complete for ${user.email}. You can sign in now.`);
      setTimeout(() => router.push("/auth/sign-in"), 800);
    } catch (bootstrapError) {
      setError(bootstrapError instanceof Error ? bootstrapError.message : "Unable to initialize admin.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eff6ff_0%,#f8fafc_100%)] px-4 py-10 dark:bg-[linear-gradient(180deg,#020617_0%,#111827_100%)]">
      <div className="mx-auto max-w-xl">
        <Card className="rounded-[2rem] border-border/60 bg-card/95 shadow-lg">
          <CardHeader>
            <CardTitle>Initialize first admin</CardTitle>
            <CardDescription>
              One-time bootstrap for the approval queue and portal administration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {needsBootstrap === false ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-border/60 bg-secondary/35 px-4 py-4 text-sm text-muted-foreground">
                  An admin account already exists for this system.
                </div>
                <Button asChild className="w-full">
                  <Link href="/auth/sign-in">Go to sign-in</Link>
                </Button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full name</Label>
                  <Input id="full-name" value={form.full_name} onChange={(e) => setForm((current) => ({ ...current, full_name: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Admin email</Label>
                  <Input id="email" value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={form.password} onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))} required />
                </div>
                {success && <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">{success}</div>}
                {error && <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
                <Button className="w-full" disabled={submitting || needsBootstrap === null}>
                  {submitting ? <Spinner className="size-4" /> : null}
                  Create admin account
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
