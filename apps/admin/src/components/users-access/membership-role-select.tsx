import type { NonOwnerRole } from "@/types/business-membership";

const ROLE_LABELS: Record<NonOwnerRole, string> = {
  admin: "Administrador",
  cashier: "Cajero",
  seller: "Vendedor",
  inventory: "Inventario",
  viewer: "Solo lectura",
};

type Props = {
  id: string;
  value: NonOwnerRole;
  roles: readonly NonOwnerRole[];
  onChange: (role: NonOwnerRole) => void;
  disabled?: boolean;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
};

export default function MembershipRoleSelect({
  id,
  value,
  roles,
  onChange,
  disabled = false,
  ariaInvalid = false,
  ariaDescribedBy,
}: Props) {
  return (
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value as NonOwnerRole)}
      disabled={disabled}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedBy}
      className="flex h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {roles.map((role) => (
        <option key={role} value={role} className="bg-zinc-950">
          {ROLE_LABELS[role]}
        </option>
      ))}
    </select>
  );
}
