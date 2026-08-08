import AuthGuard from "@/components/auth/auth-guard";
import AdminLayout from "@/components/admin/admin-layout";

type ProtectedLayoutProps = {
  children: React.ReactNode;
};

export default function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  return (
    <AuthGuard>
      <AdminLayout>
        {children}
      </AdminLayout>
    </AuthGuard>
  );
}