"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from "lucide-react";

import { authService } from "@/services/auth-service";
import { HttpError } from "@/lib/http";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async (
      credentials: Parameters<
        typeof authService.login
      >[0]
    ) => {
      await queryClient.cancelQueries();
      queryClient.removeQueries();

      return authService.login(credentials);
    },

    onSuccess: () => {
      router.replace("/dashboard");
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    loginMutation.mutate({
      email: email.trim(),
      password,
    });
  }

  function getErrorMessage() {
    if (!loginMutation.error) {
      return null;
    }

    if (loginMutation.error instanceof HttpError) {
      if (loginMutation.error.status === 401) {
        return "Correo electrónico o contraseña incorrectos.";
      }

      return loginMutation.error.message;
    }

    return "No fue posible iniciar sesión. Intenta nuevamente.";
  }

  const errorMessage = getErrorMessage();

  return (
    <div>
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium text-red-500">
          Bienvenido de vuelta
        </p>

        <h2 className="text-3xl font-semibold tracking-tight text-white">
          Iniciar sesión
        </h2>

        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Ingresa tus credenciales para acceder al panel administrativo.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-zinc-300"
          >
            Correo electrónico
          </label>

          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="correo@playnow.com"
              autoComplete="email"
              required
              disabled={loginMutation.isPending}
              className="h-12 border-white/10 bg-white/5 pl-10 text-white placeholder:text-zinc-600 focus-visible:border-red-500 focus-visible:ring-red-500/20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-zinc-300"
          >
            Contraseña
          </label>

          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
              required
              disabled={loginMutation.isPending}
              className="h-12 border-white/10 bg-white/5 pl-10 pr-11 text-white placeholder:text-zinc-600 focus-visible:border-red-500 focus-visible:ring-red-500/20"
            />

            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-200"
              aria-label={
                showPassword
                  ? "Ocultar contraseña"
                  : "Mostrar contraseña"
              }
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {errorMessage}
          </div>
        )}

        <Button
          type="submit"
          disabled={loginMutation.isPending}
          className="h-12 w-full bg-red-500 font-medium text-white shadow-lg shadow-red-500/10 transition hover:bg-red-600"
        >
          {loginMutation.isPending ? (
            <>
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            "Iniciar sesión"
          )}
        </Button>
      </form>

      <div className="mt-8 border-t border-white/10 pt-6">
        <p className="text-center text-xs leading-5 text-zinc-600">
          Acceso exclusivo para usuarios autorizados de PlayNow.
        </p>
      </div>
    </div>
  );
}
