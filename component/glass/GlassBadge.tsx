import type { ReactNode } from "react";

type GlassBadgeProps = {
  children: ReactNode;
  className?: string;
};

export default function GlassBadge({
  children,
  className = "",
}: GlassBadgeProps) {
  return (
    <span className={`glass-badge ${className}`}>
      {children}
    </span>
  );
}