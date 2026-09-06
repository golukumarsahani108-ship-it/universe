import type { ReactNode } from "react";

type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

export default function GlassCard({
  children,
  className = "",
}: GlassCardProps) {
  return (
    <div className={`glass glass-card ${className}`}>
      {children}
    </div>
  );
}