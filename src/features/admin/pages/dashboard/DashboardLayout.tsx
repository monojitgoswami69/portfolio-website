import { AuthenticatedLayout } from "@/features/admin/components/auth/AuthenticatedLayout";
import { AppShell } from "@/features/admin/components/ui/AppShell";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthenticatedLayout>
      <AppShell>{children}</AppShell>
    </AuthenticatedLayout>
  );
}
