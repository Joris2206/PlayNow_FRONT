"use client";

import {
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import { useAuth } from "@/providers/auth-provider";

import { Button } from "@/components/ui/button";

type AuthGuardProps = {
  children: React.ReactNode;
};

export default function AuthGuard({
  children,
}: AuthGuardProps) {
  const { status, retry } = useAuth();

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <LoaderCircle className="h-8 w-8 animate-spin text-red-500" />

          <p className="text-sm text-zinc-400">
            Verificando sesión...
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-white">
        <div className="max-w-md text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-400" />

          <h1 className="mt-4 text-lg font-medium">
            No pudimos validar tu sesión
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            El servicio no está disponible temporalmente. Conservamos tu sesión para que puedas reintentar.
          </p>

          <Button
            type="button"
            variant="outline"
            onClick={retry}
            className="mt-5 border-white/10 bg-transparent text-white hover:bg-white/5"
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return children;
}
