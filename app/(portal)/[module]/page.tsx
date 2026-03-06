import { notFound } from "next/navigation";

import { ModulePage } from "@/components/hrms/module-page";
import { validPortalModules, type PortalModuleKey } from "@/lib/hrms-data";

export const dynamicParams = false;

export function generateStaticParams() {
  return validPortalModules.map((module) => ({ module }));
}

export default async function PortalModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;

  if (!validPortalModules.includes(module as PortalModuleKey)) {
    notFound();
  }

  return <ModulePage moduleKey={module as PortalModuleKey} />;
}
