"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

import { tokenStorage } from "@/lib/token-storage";

type AuthGuardProps = {
  children: React.ReactNode;
};

export default function AuthGuard({
  children,
}: AuthGuardProps) {
  const router = useRouter();

  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const refreshToken =
      tokenStorage.getRefreshToken();

    if (!refreshToken) {
      tokenStorage.clearTokens();

      router.replace("/login");

      return;
    }

    setIsChecking(false);
  }, [router]);

  if (isChecking) {
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

  return children;
}