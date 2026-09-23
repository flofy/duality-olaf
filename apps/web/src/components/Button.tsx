import React, { type MouseEventHandler, type ReactNode } from "react";
import { type IconProps } from "./Icons";

type ButtonProps = {
  icon?: ReactNode;
  label?: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  className?: string;
  variant?: "primary" | "secondary" | "danger";
  "aria-label"?: string;
  children?: ReactNode;
};

const buttonVariants = {
  primary: {
    bg: "#1b2942",
    text: "#ffffff",
    hoverBg: "#2a3a5a",
    disabledBg: "#333",
    disabledText: "#666",
  },
  secondary: {
    bg: "#2a3a5a",
    text: "#ffffff",
    hoverBg: "#3a4a6a",
    disabledBg: "#444",
    disabledText: "#888",
  },
  danger: {
    bg: "#8b0000",
    text: "#ffffff",
    hoverBg: "#a00000",
    disabledBg: "#660000",
    disabledText: "#cc3333",
  },
};

export const Button = ({
  icon,
  label = "",
  onClick,
  disabled = false,
  className = "",
  variant = "primary",
  "aria-label": ariaLabel,
  children,
}: ButtonProps) => {
  const { bg, text, hoverBg, disabledBg, disabledText } =
    buttonVariants[variant];
  return (
    <button
      className={`modern-button ${className}`}
      onClick={(event) => {
        // Pointer activation is handled directly on pointerup when supplied.
        // Keep click for keyboard/assistive activation (detail === 0) without
        // firing a second time after a touch/mouse pointerup.
        if (onPointerUp && event.detail !== 0) return;
        onClick(event);
      }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "12px 20px",
        borderRadius: "8px",
        background: disabled ? disabledBg : bg,
        color: disabled ? disabledText : text,
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s ease",
        fontSize: "16px",
        fontWeight: "bold",
        textTransform: "uppercase",
        letterSpacing: "1px",
        boxShadow: disabled ? "none" : "0 2px 5px rgba(0, 0, 0, 0.3)",
        opacity: disabled ? 0.7 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = hoverBg;
          e.currentTarget.style.transform = "translateY(-2px)";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = bg;
          e.currentTarget.style.transform = "translateY(0)";
        }
      }}
    >
      {icon && (
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </span>
      )}
      {label && <span>{label}</span>}
      {children}
    </button>
  );
};

type DPadButtonProps = {
  icon: ReactNode;
  onClick: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  className?: string;
};
export const DPadButton = ({
  icon,
  onClick,
  disabled = false,
  className = "",
}: DPadButtonProps) => {
  return (
    <button
      className={`dpad-button ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "48px",
        height: "48px",
        borderRadius: "8px",
        background: "rgba(255, 255, 255, 0.1)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s ease",
        color: "var(--text, #fff)",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
          e.currentTarget.style.transform = "scale(1.1)";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
          e.currentTarget.style.transform = "scale(1)";
        }
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        {icon}
      </span>
    </button>
  );
};

type CenterDPadButtonProps = {
  icon: ReactNode;
  label: ReactNode;
  onClick: MouseEventHandler<HTMLButtonElement>;
  onPointerDown?: React.PointerEventHandler<HTMLButtonElement>;
  onPointerUp?: React.PointerEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  className?: string;
};
export const CenterDPadButton = ({
  icon,
  label,
  onClick,
  onPointerDown,
  onPointerUp,
  disabled = false,
  className = "",
}: CenterDPadButtonProps) => {
  return (
    <button
      className={`center-dpad-button ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        background: "rgba(255, 255, 255, 0.1)",
        border: "2px solid rgba(255, 255, 255, 0.3)",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s ease",
        color: "var(--text, #fff)",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
          e.currentTarget.style.transform = "scale(1.1)";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
          e.currentTarget.style.transform = "scale(1)";
        }
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
        }}
      >
        {icon}
      </span>
      <span style={{ fontSize: "10px", fontWeight: "bold" }}>{label}</span>
    </button>
  );
};
