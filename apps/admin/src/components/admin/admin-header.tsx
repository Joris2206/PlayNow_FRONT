"use client";

import {
  LogOut,
  Menu,
  UserRound,
} from "lucide-react";

import { authService } from "@/services/auth-service";
import BusinessSwitcher, {
  getRoleLabel,
} from "@/components/admin/business-switcher";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";

type AdminHeaderProps = {
  onOpenSidebar: () => void;
};

export default function AdminHeader({
  onOpenSidebar,
}: AdminHeaderProps) {
  const {
    user,
    isLoading,
    activeMembership,
    isPlatformAdmin,
  } = useAuth();

  function handleLogout() {
    void authService.logout();
  }

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/10 bg-zinc-950/80 px-5 backdrop-blur-xl sm:px-8">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onOpenSidebar}
          className="text-zinc-400 hover:bg-white/5 hover:text-white lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {isLoading ? (
          <p className="text-sm text-zinc-500">
            Cargando...
          </p>
        ) : (
          <BusinessSwitcher />
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 sm:flex">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
            <UserRound className="h-4 w-4" />
          </div>

          <div className="pr-2">
            <p className="text-sm text-zinc-500">
              {isLoading
                ? "Cargando..."
                : user?.full_name ?? "??"}
            </p>

            <p className="text-sm text-zinc-500">
              {isLoading
                ? "Cargando..."
                : isPlatformAdmin
                  ? activeMembership
                    ? `Administrador de plataforma · ${getRoleLabel(activeMembership.role)}`
                    : "Administrador de plataforma"
                  : activeMembership
                    ? getRoleLabel(activeMembership.role)
                    : "No definido"}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          title="Cerrar sesión"
          className="text-zinc-400 hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
