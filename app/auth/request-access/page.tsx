"use client";

import Link from "next/link";
import { useState } from "react";

import { authFlowSteps } from "@/lib/hrms-data";
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
import { Textarea } from "@/components/ui/textarea";

export default function RequestAccessPage() {
  const { requestAccess } = useAuth();
  const [form, setForm] = useState({
    work_email: "",
    employee_code: "",
    department_name: "",
    designation_name: "",
    justification: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setSuccess(null);
    setError(null);
    try {
      const result = await requestAccess(form);
      setSuccess(`Access request created for ${result.work_email}. Wait for admin approval before setting your password.`);
      setForm({
        work_email: "",
        employee_code: "",
        department_name: "",
        designation_name: "",
        justification: "",
      });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Failed to submit access request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eff6ff_0%,#f8fafc_100%)] px-4 py-10 dark:bg-[linear-gradient(180deg,#020617_0%,#111827_100%)]">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_420px]">
        <section className="rounded-[2rem] border border-border/60 bg-card/90 p-8 shadow-lg">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
            Access onboarding
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
            Request access to the company portal
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
            This is the live entry point for feature 1. After submission, the request appears in the admin verification queue for approval or rejection.
          </p>

          <div className="mt-8 space-y-3">
            {authFlowSteps.map((step, index) => (
              <div key={step} className="flex items-start gap-4 rounded-2xl border border-border/60 bg-secondary/35 px-4 py-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </div>
                <p className="pt-1 text-sm text-foreground">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <Card className="rounded-[2rem] border-border/60 bg-card/95 shadow-lg">
          <CardHeader>
            <CardTitle>Access request form</CardTitle>
            <CardDescription>
              Connected to the native Django access-request endpoint.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="work-email">Company email</Label>
                <Input id="work-email" value={form.work_email} onChange={(e) => updateField("work_email", e.target.value)} placeholder="employee@northstar.local" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employee-id">Employee ID</Label>
                <Input id="employee-id" value={form.employee_code} onChange={(e) => updateField("employee_code", e.target.value)} placeholder="NS-EMP-1042" required />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" value={form.department_name} onChange={(e) => updateField("department_name", e.target.value)} placeholder="Engineering" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input id="designation" value={form.designation_name} onChange={(e) => updateField("designation_name", e.target.value)} placeholder="Project Manager" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for access</Label>
                <Textarea id="reason" value={form.justification} onChange={(e) => updateField("justification", e.target.value)} placeholder="Describe your role and why you need portal access." className="min-h-32" required />
              </div>
              {success && <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">{success}</div>}
              {error && <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
              <Button className="w-full" disabled={submitting}>
                {submitting ? <Spinner className="size-4" /> : null}
                Submit access request
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already approved?{" "}
              <Link href="/auth/sign-in" className="text-primary hover:underline">
                Sign in here
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
