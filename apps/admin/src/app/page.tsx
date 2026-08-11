"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

import { tokenStorage } from "@/lib/token-storage";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const refreshToken =
      tokenStorage.getRefreshToken();

    if (refreshToken) {
      router.replace("/dashboard");
      return;
    }

    router.replace("/login");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
      <div className="flex flex-col items-center gap-4">
        <LoaderCircle className="h-8 w-8 animate-spin text-red-500" />

        <p className="text-sm text-zinc-400">
          Verificando sesión...
        </p>
      </div>
    </main>
  );
}