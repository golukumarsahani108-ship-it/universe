"use client";

type GlassButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
};

export default function GlassButton({
  children,
  onClick,
  active = false,
  type = "button",
  className = "",
  disabled = false,
}: GlassButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`glass-button ${
        active ? "glass-button-active" : ""
      } ${className}`}
    >
      {children}
    </button>
  );
}