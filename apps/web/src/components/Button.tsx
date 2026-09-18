import React, { type MouseEventHandler, type ReactNode } from "react";
import { type IconProps } from "./Icons";

export type ButtonProps = {
  icon?: ReactNode;
  label: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  className?: string;
  variant?: "primary" | "secondary" | "danger";
};

const buttonVariants = {
  primary: {
    bg: "var(--buttonBg, #1b2942)",
    text: "var(--buttonText, #ffffff)",
    hoverBg: "var(--buttonHoverBg, #2a3a5a)",
    disabledBg: "var(--buttonDisabledBg, #333)",
    disabledText: "var(--buttonDisabledText, #666)",
  },
  secondary: {
    bg: "var(--buttonSecondaryBg, #2a3a5a)",
    text: "var(--buttonSecondaryText, #ffffff)",
    hoverBg: "var(--buttonSecondaryHoverBg, #3a4a6a)",
    disabledBg: "var(--buttonSecondaryDisabledBg, #444)",
    disabledText: "var(--buttonSecondaryDisabledText, #888)",
  },
  danger: {
    bg: "var(--buttonDangerBg, #8b0000)",
    text: "var(--buttonDangerText, #ffffff)",
    hoverBg: "var(--buttonDangerHoverBg, #a00000)",
    disabledBg: "var(--buttonDangerDisabledBg, #660000)",
    disabledText: "var(--buttonDangerDisabledText, #cc3333)",
  },
};

export const Button = ({
  icon,
  label,
  onClick,
  disabled = false,
  className = "",
  variant = "primary",
}: ButtonProps) => {
  const { bg, text, hoverBg, disabledBg, disabledText } =
    buttonVariants[variant];

  return (
    <button
      className={`modern-button ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
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
        minWidth: "120px",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = hoverBg;
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.4)";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = bg;
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.3)";
        }
      }}
    >
      {icon && (
        <span style={{ fontSize: "20px", display: "flex" }}>{icon}</span>
      )}
      <span>{label}</span>
    </button>
  );
};

export const DPadButton = ({
  icon,
  onClick,
  disabled = false,
  className = "",
}: {
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) => (
  <button
    className={`dpad-button ${className}`}
    onClick={onClick}
    disabled={disabled}
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "50px",
      height: "50px",
      borderRadius: "50%",
      background: "var(--buttonBg, #1b2942)",
      color: "var(--buttonText, #ffffff)",
      border: "none",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 0.1s ease",
      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.3)",
      opacity: disabled ? 0.5 : 1,
    }}
    onMouseDown={(e) => {
      if (!disabled) {
        e.currentTarget.style.transform = "scale(0.95)";
        e.currentTarget.style.boxShadow = "none";
      }
    }}
    onMouseUp={(e) => {
      if (!disabled) {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.3)";
      }
    }}
    onMouseLeave={(e) => {
      if (!disabled) {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.3)";
      }
    }}
  >
    {icon}
  </button>
);

export const CenterDPadButton = ({
  icon,
  label,
  onClick,
  disabled = false,
  className = "",
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) => (
  <button
    className={`dpad-center-button ${className}`}
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
      background: "var(--buttonBg, #1b2942)",
      color: "var(--buttonText, #ffffff)",
      border: "none",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 0.1s ease",
      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.3)",
      opacity: disabled ? 0.5 : 1,
    }}
    onMouseDown={(e) => {
      if (!disabled) {
        e.currentTarget.style.transform = "scale(0.95)";
        e.currentTarget.style.boxShadow = "none";
      }
    }}
    onMouseUp={(e) => {
      if (!disabled) {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.3)";
      }
    }}
    onMouseLeave={(e) => {
      if (!disabled) {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.3)";
      }
    }}
  >
    <span style={{ fontSize: "20px" }}>{icon}</span>
    <span style={{ fontSize: "10px", fontWeight: "bold" }}>{label}</span>
  </button>
);
