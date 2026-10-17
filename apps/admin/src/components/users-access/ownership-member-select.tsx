import type { BusinessMembershipListItem } from "@/types/business-membership";

type Props = {
  id: string;
  value: string;
  memberships: readonly BusinessMembershipListItem[];
  onChange: (value: string) => void;
  disabled?: boolean;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
  placeholder: string;
};

export default function OwnershipMemberSelect({
  id,
  value,
  memberships,
  onChange,
  disabled = false,
  ariaInvalid = false,
  ariaDescribedBy,
  placeholder,
}: Props) {
  return (
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedBy}
      className="flex h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <option value="" className="bg-zinc-950">{placeholder}</option>
      {memberships.map((membership) => (
        <option
          key={membership.public_id}
          value={membership.public_id}
          className="bg-zinc-950"
        >
          {membership.user_full_name || membership.user_email} · {membership.role_display}
        </option>
      ))}
    </select>
  );
}
