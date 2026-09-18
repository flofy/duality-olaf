import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  label?: string;
  variant?: "primary" | "secondary";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { icon, label, variant = "primary", className = "", disabled = false, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={`button ${variant} ${className}`.trim()}
        disabled={disabled}
        style={{ userSelect: "none" }}
        {...props}
      >
        {icon && <span className="button-icon">{icon}</span>}
        {label && <span className="button-label">{label}</span>}
      </button>
    );
  },
);

Button.displayName = "Button";

export interface DPadButtonProps {
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

export function DPadButton({ icon, onClick, disabled = false }: DPadButtonProps) {
  return (
    <button
      className="dpad-button"
      onClick={onClick}
      disabled={disabled}
      style={{ userSelect: "none" }}
      aria-label="Direction"
    >
      {icon}
    </button>
  );
}

export function CenterDPadButton({
  icon,
  label,
  onClick,
  disabled = false,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      className="center-dpad-button"
      onClick={onClick}
      disabled={disabled}
      style={{ userSelect: "none" }}
      aria-label={label}
    >
      <span className="center-dpad-icon">{icon}</span>
      <span className="center-dpad-label">{label}</span>
    </button>
  );
}