import { LoaderCircle } from "lucide-react";

type SpinnerProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-10 w-10",
};

export default function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <LoaderCircle
      role="status"
      aria-label="Loading"
      className={`animate-spin text-amber-500 dark:text-amber-400 ${sizeClasses[size]} ${className}`}
    />
  );
}
