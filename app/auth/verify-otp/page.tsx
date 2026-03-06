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
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyOtp, resendOtp, getPendingEmail, getPendingOtpCode, setPendingEmail, status } = useAuth();
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const [debugOtpCode, setDebugOtpCode] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
      return;
    }
    const pendingEmail = getPendingEmail();
    if (!pendingEmail) {
      router.replace("/auth/sign-in");
      return;
    }
    setEmail(pendingEmail);
    setDebugOtpCode(getPendingOtpCode());
  }, [getPendingEmail, getPendingOtpCode, router, status]);

  const next = searchParams.get("next") || "/dashboard";

  const handleVerify = async () => {
    if (!email) return;
    setSubmitting(true);
    setError(null);
    try {
      await verifyOtp({ email, otp });
      router.replace(next);
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : "Unable to verify OTP.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setError(null);
    try {
      const result = await resendOtp({ email });
      setPendingEmail(email, result.debug_otp_code);
      setDebugOtpCode(result.debug_otp_code || null);
    } catch (resendError) {
      setError(resendError instanceof Error ? resendError.message : "Unable to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eff6ff_0%,#f8fafc_100%)] px-4 py-10 dark:bg-[linear-gradient(180deg,#020617_0%,#111827_100%)]">
      <div className="mx-auto max-w-xl">
        <Card className="rounded-[2rem] border-border/60 bg-card/95 shadow-lg">
          <CardHeader>
            <CardTitle>Verify email OTP</CardTitle>
            <CardDescription>
              Complete sign-in to unlock the HRMS portal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-2xl border border-border/60 bg-secondary/35 px-4 py-4 text-sm leading-6 text-muted-foreground">
              Enter the six-digit code sent to <span className="font-medium text-foreground">{email || "your email"}</span>.
            </div>
            {debugOtpCode && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-4 text-sm text-amber-700 dark:text-amber-300">
                Development OTP preview: <span className="font-semibold">{debugOtpCode}</span>
              </div>
            )}
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            {error && <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
            <div className="flex flex-col gap-3">
              <Button onClick={() => void handleVerify()} disabled={otp.length !== 6 || submitting}>
                {submitting ? <Spinner className="size-4" /> : null}
                Verify and enter portal
              </Button>
              <Button variant="outline" onClick={() => void handleResend()} disabled={resending}>
                {resending ? <Spinner className="size-4" /> : null}
                Resend OTP
              </Button>
              <Button variant="link" asChild>
                <Link href="/auth/sign-in">Back to sign-in</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-5 py-4 text-sm text-muted-foreground shadow-sm">
            <Spinner className="size-5" />
            Loading OTP verification...
          </div>
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}
