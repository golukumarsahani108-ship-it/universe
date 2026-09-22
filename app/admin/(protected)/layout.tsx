import { requireAdmin } from "@/lib/admin-auth";
import AdminShell from "@/component/admin/AdminShell";
import "../websites/templates/templates.css";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return <AdminShell>{children}</AdminShell>;
}