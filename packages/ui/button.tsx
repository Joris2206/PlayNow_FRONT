import * as React from "react"

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary"
}

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const base = "px-4 py-2 rounded-2xl font-medium transition"
  const styles =
    variant === "primary"
      ? "bg-black text-white hover:opacity-90"
      : "bg-white text-black border hover:bg-neutral-100"
  return <button className={`${base} ${styles} ${className}`} {...props} />
}