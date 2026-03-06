import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, ShieldCheck, Users } from "lucide-react";

import { dashboardHighlights, dashboardStats } from "@/lib/hrms-data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border/60 bg-card/90 p-8 shadow-lg">
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Implementation foundation
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
              Native HRMS portal scaffolded around the task-manager reference
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
              The current implementation establishes the portal shell, auth entry flows, route-based module surfaces,
              and a Django backend foundation for approval-based access, RBAC, employee records, projects, tasks, calendar, and auditability.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/tasks/workspace">
                  Open Task Workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/auth/request-access">View Access Request Flow</Link>
              </Button>
            </div>
          </div>

          <Card className="rounded-[2rem] border-border/60 bg-secondary/35 shadow-none">
            <CardHeader>
              <CardTitle className="text-lg">Priority tracks</CardTitle>
              <CardDescription>What this foundation is optimizing for first.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboardHighlights.map((highlight) => (
                <div key={highlight} className="rounded-2xl border border-border/60 bg-card/70 px-4 py-3 text-sm text-foreground">
                  {highlight}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat, index) => {
          const Icon = [Users, Clock3, ShieldCheck, CheckCircle2][index];
          return (
            <Card key={stat.label} className="rounded-[2rem] border-border/60 bg-card/90 shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardDescription>{stat.label}</CardDescription>
                  <CardTitle className="mt-3 text-3xl">{stat.value}</CardTitle>
                </div>
                <span className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">{stat.note}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
