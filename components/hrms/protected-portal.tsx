"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/components/hrms/auth-provider";
import { PortalShell } from "@/components/hrms/portal-shell";
import { Spinner } from "@/components/ui/spinner";

export function ProtectedPortal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useAuth();

  useEffect(() => {
    if (status === "anonymous") {
      const next = encodeURIComponent(pathname || "/dashboard");
      router.replace(`/auth/sign-in?next=${next}`);
    }
  }, [pathname, router, status]);

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-5 py-4 text-sm text-muted-foreground shadow-sm">
          <Spinner className="size-5" />
          Securing portal access...
        </div>
      </div>
    );
  }

  return <PortalShell>{children}</PortalShell>;
}
