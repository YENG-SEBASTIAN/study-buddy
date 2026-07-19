import Image from "next/image";

type AkosuaAvatarProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses: Record<NonNullable<AkosuaAvatarProps["size"]>, string> = {
  sm: "h-6 w-6",
  md: "h-7 w-7",
  lg: "h-16 w-16",
};

const sizePx: Record<NonNullable<AkosuaAvatarProps["size"]>, number> = {
  sm: 24,
  md: 28,
  lg: 64,
};

export default function AkosuaAvatar({ size = "md", className = "" }: AkosuaAvatarProps) {
  return (
    <span
      className={`relative inline-flex shrink-0 overflow-hidden rounded-full ring-2 ring-white dark:ring-slate-900 ${sizeClasses[size]} ${className}`}
    >
      <Image
        src="/logo-icon.png"
        alt="Akosua"
        fill
        sizes={`${sizePx[size]}px`}
        className="object-cover"
      />
    </span>
  );
}
