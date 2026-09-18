import React, { type ReactNode } from "react";

export type ButtonProps = {
  icon?: ReactNode;
  label?: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  variant?: "primary" | "secondary" | "danger";
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
  children,
}: ButtonProps) => {
  const { bg, text, hoverBg, disabledBg, disabledText } =
    buttonVariants[variant];

  return (
    <button
      className={`modern-button ${className}`}
      onClick={onClick}
      disabled={disabled}
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

// DPadButton - for directional pad buttons (arrows)
export type DPadButtonProps = {
  icon: ReactNode;
  onClick: () => void;
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

// CenterDPadButton - for the center button in the D-pad (like CHANGER)
export type CenterDPadButtonProps = {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
};

export const CenterDPadButton = ({
  icon,
  label,
  onClick,
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
