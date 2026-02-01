import Link from "next/link";

type SocialIconProps = {
  href: string;
  icon: string;
  color?: string;
  hoverColor?: string
  size?: string;
};

export function SocialIcon({
  href,
  icon,
  color = "bg-gray-400",
  hoverColor = "hover:bg-gray-600",
  size = "h-10 w-10",
}: SocialIconProps) {
  return (
    <Link
      href={href}
      target="_blank"
    >
      <div
        className={`transition ${size} ${color} ${hoverColor}`}
        style={{
          WebkitMask: `url(${icon}) no-repeat center`,
          WebkitMaskSize: "contain",
          mask: `url(${icon}) no-repeat center`,
          maskSize: "contain",
        }}
      />
    </Link>
  );
}
