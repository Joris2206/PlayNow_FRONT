import AuthGuard from "@/components/auth/auth-guard";
import BusinessAccessBoundary from "@/components/auth/business-access-boundary";
import AdminRouteGuard from "@/components/auth/admin-route-guard";
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
        <BusinessAccessBoundary>
          <AdminLayout>
            <AdminRouteGuard>
              {children}
            </AdminRouteGuard>
          </AdminLayout>
        </BusinessAccessBoundary>
      </AuthGuard>
    </AuthProvider>
  );
}
