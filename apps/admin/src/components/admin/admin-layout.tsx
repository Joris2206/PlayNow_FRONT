"use client";

import { useState } from "react";

import AdminHeader from "@/components/admin/admin-header";
import AdminSidebar from "@/components/admin/admin-sidebar";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-72">
        <AdminHeader
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <main className="min-h-[calc(100vh-5rem)] bg-zinc-950 px-5 py-6 sm:px-8 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}