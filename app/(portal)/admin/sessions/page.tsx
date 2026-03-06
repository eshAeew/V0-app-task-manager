"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/components/hrms/auth-provider";
import type { AuthSession } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export default function SessionsPage() {
  const { getSessions, user } = useAuth();
  const [sessions, setSessions] = useState<AuthSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getSessions()
      .then((result) => setSessions(result))
      .catch((sessionError) => setError(sessionError instanceof Error ? sessionError.message : "Unable to load sessions."))
      .finally(() => setLoading(false));
  }, [getSessions]);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border/60 bg-card/95 p-8 shadow-lg">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
          Feature 9
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          Session management
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
          View active portal sessions for <span className="font-medium text-foreground">{user?.email}</span>.
        </p>
      </section>

      {error && <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

      {loading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-5 py-4 text-sm text-muted-foreground">
          <Spinner className="size-5" />
          Loading sessions...
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <Card key={session.id} className="rounded-[2rem] border-border/60 bg-card/95 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">{session.user_agent || "Unknown device"}</CardTitle>
                    <CardDescription>
                      IP: {session.ip_address || "Unavailable"}
                    </CardDescription>
                  </div>
                  {session.is_current ? (
                    <Badge className="rounded-full px-3 py-1">Current session</Badge>
                  ) : (
                    <Badge variant="outline" className="rounded-full px-3 py-1">Other session</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm text-muted-foreground">
                <p>Started: {new Date(session.created_at).toLocaleString()}</p>
                <p>Last seen: {new Date(session.last_seen_at).toLocaleString()}</p>
                <p>Status: {session.revoked_at ? `Revoked at ${new Date(session.revoked_at).toLocaleString()}` : "Active"}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
