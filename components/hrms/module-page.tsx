import Link from "next/link";
import { ArrowRight, Layers3, ShieldCheck, Sparkles } from "lucide-react";

import { moduleDefinitions, type PortalModuleKey } from "@/lib/hrms-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ModulePage({ moduleKey }: { moduleKey: PortalModuleKey }) {
  const module = moduleDefinitions[moduleKey];

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border/60 bg-card/90 p-8 shadow-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                {module.phase}
              </Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                {module.subtitle}
              </Badge>
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
              {module.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
              {module.summary}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {module.quickActions.map((action) => (
              <Button key={action.href} asChild>
                <Link href={action.href}>
                  {action.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="rounded-[2rem] border-border/60 bg-card/90 shadow-sm xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Focus Areas
            </CardTitle>
            <CardDescription>
              The first implementation slice this module should cover.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {module.focusAreas.map((item) => (
              <div key={item} className="rounded-2xl bg-secondary/40 px-4 py-3 text-sm text-foreground">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-border/60 bg-card/90 shadow-sm xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers3 className="h-4 w-4 text-primary" />
              Workflows
            </CardTitle>
            <CardDescription>
              Core user flows that shape backend APIs and frontend navigation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {module.workflows.map((item) => (
              <div key={item} className="rounded-2xl border border-border/60 px-4 py-3 text-sm text-muted-foreground">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-border/60 bg-card/90 shadow-sm xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Roles and Entities
            </CardTitle>
            <CardDescription>
              Data boundaries and permissions expected for this module.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {module.roles.map((role) => (
                <Badge key={role} variant="outline" className="rounded-full px-3 py-1">
                  {role}
                </Badge>
              ))}
            </div>
            <div className="space-y-2">
              {module.entities.map((entity) => (
                <div key={entity} className="rounded-2xl bg-muted/50 px-4 py-3 text-sm font-medium text-foreground">
                  {entity}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
