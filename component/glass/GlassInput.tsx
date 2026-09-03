"use client";

type GlassInputProps = {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: string;
  className?: string;
};

export default function GlassInput({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  className = "",
}: GlassInputProps) {
  return (
    <label className={`glass-input-wrap ${className}`}>
      {label && <span>{label}</span>}

      <input
        className="glass-input"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </label>
  );
}