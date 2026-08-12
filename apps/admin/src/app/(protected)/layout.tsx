import AuthGuard from "@/components/auth/auth-guard";
import AdminLayout from "@/components/admin/admin-layout";
import AuthProvider from "@/providers/auth-provider";

type ProtectedLayoutProps = {
  children: React.ReactNode;
};

export default function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  return (
    <AuthProvider>
      <AuthGuard>
        <AdminLayout>
          {children}
        </AdminLayout>
      </AuthGuard>
    </AuthProvider>
  );
}
