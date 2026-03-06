"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  CalendarRange,
  ChartColumn,
  Clock3,
  FileText,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Mail,
  Megaphone,
  MessagesSquare,
  MonitorCog,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";

import { useAuth } from "@/components/hrms/auth-provider";
import { cn } from "@/lib/utils";
import { portalNavSections } from "@/lib/hrms-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const iconMap = {
  "badge-check": BadgeCheck,
  "briefcase-business": BriefcaseBusiness,
  "calendar-days": CalendarDays,
  "calendar-range": CalendarRange,
  "chart-column": ChartColumn,
  "clock-3": Clock3,
  "file-text": FileText,
  "layout-dashboard": LayoutDashboard,
  "list-todo": ListTodo,
  mail: Mail,
  megaphone: Megaphone,
  "messages-square": MessagesSquare,
  "shield-check": ShieldCheck,
  users: Users,
  wallet: Wallet,
} as const;

export function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_35%,#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_top,#1d4ed8_0%,transparent_25%),linear-gradient(180deg,#020617_0%,#111827_40%,#020617_100%)]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-4 md:px-6">
        <aside className="hidden w-80 shrink-0 rounded-[2rem] border border-border/60 bg-card/85 p-6 shadow-xl backdrop-blur xl:block">
          <div className="space-y-3 border-b border-border/60 pb-6">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                Native HRMS
              </Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                React + Django
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-muted-foreground">
                Northstar
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-foreground">
                Employee Management Portal
              </h1>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              Self-owned HR, work management, approvals, chat, mail, calendar, and documents stack.
            </p>
          </div>

          <nav className="mt-6 space-y-6">
            {portalNavSections.map((section) => (
              <div key={section.title}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  {section.title}
                </p>
                <div className="space-y-2">
                  {section.items.map((item) => {
                    const Icon = iconMap[item.icon as keyof typeof iconMap];
                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-start gap-3 rounded-2xl border px-4 py-3 transition-colors",
                          active
                            ? "border-primary/30 bg-primary/10 text-foreground"
                            : "border-transparent bg-secondary/40 text-muted-foreground hover:border-border/70 hover:bg-secondary/70 hover:text-foreground"
                        )}
                      >
                        <span className={cn("mt-0.5 rounded-xl p-2", active ? "bg-primary text-primary-foreground" : "bg-background")}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-medium">{item.label}</span>
                          <span className="mt-1 block text-xs leading-5">{item.description}</span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <header className="rounded-[2rem] border border-border/60 bg-card/85 px-6 py-5 shadow-lg backdrop-blur">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Native collaboration stack with no third-party productivity provider dependencies.
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-foreground">
                  Portal foundation and module scaffolding
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-full px-3 py-1">Access request + OTP auth</Badge>
                <Badge variant="outline" className="rounded-full px-3 py-1">Project calendars</Badge>
                <Badge variant="outline" className="rounded-full px-3 py-1">Approval-driven task flow</Badge>
                {user?.is_staff && (
                  <Button variant="outline" size="sm" asChild className="rounded-full">
                    <Link href="/admin/access-requests">
                      <MonitorCog className="h-4 w-4" />
                      Admin Queue
                    </Link>
                  </Button>
                )}
                <Button variant="outline" size="sm" asChild className="rounded-full">
                  <Link href="/admin/sessions">Sessions</Link>
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full" onClick={() => void logout()}>
                  <LogOut className="h-4 w-4" />
                  {user?.email || "Sign out"}
                </Button>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
