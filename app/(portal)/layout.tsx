import { ProtectedPortal } from "@/components/hrms/protected-portal";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedPortal>{children}</ProtectedPortal>;
}
