"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Copy, RefreshCw } from "lucide-react";

import { useAuth } from "@/components/hrms/auth-provider";
import type { AccessRequestRecord } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export default function AdminAccessRequestsPage() {
  const { user, getAccessRequests, approveAccessRequest, rejectAccessRequest } = useAuth();
  const [requests, setRequests] = useState<AccessRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const records = await getAccessRequests();
      setRequests(records);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load access requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRequests();
  }, []);

  const handleApprove = async (requestId: number) => {
    setMessage(null);
    setError(null);
    try {
      const updated = await approveAccessRequest(requestId);
      setRequests((current) => current.map((item) => (item.id === requestId ? updated : item)));
      setMessage(`Approved ${updated.work_email}. Password setup link is now available.`);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to approve request.");
    }
  };

  const handleReject = async (requestId: number) => {
    setMessage(null);
    setError(null);
    try {
      const updated = await rejectAccessRequest(requestId);
      setRequests((current) => current.map((item) => (item.id === requestId ? updated : item)));
      setMessage(`Rejected ${updated.work_email}.`);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to reject request.");
    }
  };

  const handleCopyLink = async (record: AccessRequestRecord) => {
    if (!record.debug_setup_url) return;
    const absoluteUrl = `${window.location.origin}${record.debug_setup_url}`;
    await navigator.clipboard.writeText(absoluteUrl);
    setMessage(`Copied password setup link for ${record.work_email}.`);
  };

  if (!user?.is_staff) {
    return (
      <Card className="rounded-[2rem] border-border/60 bg-card/95 shadow-lg">
        <CardHeader>
          <CardTitle>Admin access required</CardTitle>
          <CardDescription>
            The verification queue is available only to staff users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard">Return to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border/60 bg-card/95 p-8 shadow-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Features 2 to 5
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
              Access request verification queue
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
              Review pending requests, approve or reject them, and copy the generated password setup link for approved accounts.
            </p>
          </div>
          <Button variant="outline" onClick={() => void loadRequests()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </section>

      {message && <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">{message}</div>}
      {error && <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

      {loading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-5 py-4 text-sm text-muted-foreground">
          <Spinner className="size-5" />
          Loading access requests...
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((record) => (
            <Card key={record.id} className="rounded-[2rem] border-border/60 bg-card/95 shadow-sm">
              <CardHeader>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle className="text-xl">{record.work_email}</CardTitle>
                    <CardDescription>
                      {record.department_name} · {record.designation_name} · {record.employee_code}
                    </CardDescription>
                  </div>
                  <Badge variant={record.status === "approved" ? "default" : record.status === "rejected" ? "destructive" : "secondary"} className="rounded-full px-3 py-1 capitalize">
                    {record.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl bg-secondary/35 px-4 py-4 text-sm text-muted-foreground">
                  {record.justification}
                </div>
                <div className="flex flex-wrap gap-3">
                  {record.status === "pending" && (
                    <>
                      <Button onClick={() => void handleApprove(record.id)}>Approve request</Button>
                      <Button variant="outline" onClick={() => void handleReject(record.id)}>Reject request</Button>
                    </>
                  )}
                  {record.status === "approved" && record.debug_setup_url && (
                    <Button variant="outline" onClick={() => void handleCopyLink(record)}>
                      <Copy className="h-4 w-4" />
                      Copy password setup link
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {requests.length === 0 && (
            <Card className="rounded-[2rem] border-border/60 bg-card/95 shadow-sm">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No access requests yet.
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
