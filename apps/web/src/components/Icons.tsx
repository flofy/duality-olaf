import React from "react";

export type IconProps = { size?: number; color?: string; className?: string };

export const XIcon = ({ size = 24, color = "#fff", className }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: "block", margin: "0 auto" }}
  >
    <path d="M18 6L6 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M6 6L18 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const Fire = ({
  size = 24,
  color = "#ff7a18",
  className,
}: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: "block", margin: "0 auto" }}
  >
    <path
      d="M12.4 2.5c.9 3.2-.8 4.9-2.4 6.5-1.5 1.5-2.8 3-2.8 5.5A5.8 5.8 0 0 0 13 20.2c3.7-.4 5.9-3.1 5.9-6.5 0-2.7-1.5-5.2-3.8-7.7.1 2.1-.6 3.3-1.8 4.1.3-2.8-.1-5.1-.9-7.6Z"
      fill={color}
    />
    <path
      d="M12.4 11.2c.7 1.3.5 2.2-.1 3.1-.5.7-.8 1.4-.8 2.2 0 1.5 1 2.5 2.5 2.5 1.6 0 2.6-1.1 2.6-2.7 0-1.3-.7-2.5-1.8-3.6.1 1-.2 1.6-.8 2-.1-1.3-.5-2.3-1.6-3.5Z"
      fill="#ffe08a"
    />
  </svg>
);

export const Star = ({
  size = 24,
  color = "#ffd700",
  className,
}: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: "block", margin: "0 auto" }}
  >
    <path d="M12 2L14.5 9.5L22 10.5L16 14L17.5 21L12 18L6.5 21L8 14L2 10.5L9.5 9.5L12 2Z" />
    <path
      d="M12 4L13 8L16 8L14 11L15 15L12 13L9 15L10 11L8 8L11 8L12 4Z"
      fill="white"
      opacity={0.3}
    />
  </svg>
);

export const Door = ({
  size = 24,
  color = "#7a5c3d",
  isOpen = false,
  className,
}: IconProps & { isOpen?: boolean }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: "block", margin: "0 auto" }}
  >
    <rect x="6" y="2" width="12" height="20" rx="1" fill={color} />
    <rect x="8" y="4" width="8" height="16" rx="1" fill="#5d432c" />
    <circle cx="16" cy="12" r="1" fill="#ffd447" />
    {!isOpen && (
      <rect x="8" y="10" width="8" height="4" rx="1" fill="#3a2718" />
    )}
    {!isOpen && <circle cx="12" cy="12" r=".5" fill="#ffd447" />}
    {isOpen && <path d="M8 10L10 8L12 10" stroke="#5d432c" strokeWidth="1" />}
  </svg>
);

export const Teleporter = ({
  size = 24,
  color = "#9b59b6",
  className,
}: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: "block", margin: "0 auto" }}
  >
    <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="2" />
    <circle cx="12" cy="12" r="4" stroke={color} strokeWidth="2" />
    <circle cx="12" cy="12" r="1" fill={color} />
    <path
      d="M12 2V4M12 20V22M2 12H4M20 12H22M4.93 4.93L6.36 6.36M17.64 17.64L19.07 19.07M4.93 19.07L6.36 17.64M17.64 6.36L19.07 4.93"
      stroke={color}
      strokeWidth="1.5"
    />
  </svg>
);

export const SwitchIcon = ({
  size = 24,
  color = "#ffd447",
  form = "either",
  className,
}: IconProps & { form?: "ball" | "square" | "either" }) => {
  const glyph = form === "ball" ? "●" : form === "square" ? "■" : "⌁";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "block", margin: "0 auto" }}
    >
      <rect
        x="6"
        y="6"
        width="12"
        height="12"
        rx="2"
        fill={color}
        opacity={0.4}
      />
      <circle cx="12" cy="12" r="3" fill={color} />
      <text x="12" y="15" fontSize="10" textAnchor="middle" fill="white">
        {glyph}
      </text>
    </svg>
  );
};
export const ArrowUp = ({
  size = 24,
  color = "#fff",
  className,
}: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path
      d="M12 19V5M5 12l7-7 7 7"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />
  </svg>
);
export const ArrowDown = ({
  size = 24,
  color = "#fff",
  className,
}: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path
      d="M12 5v14m-7-7 7 7 7-7"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />
  </svg>
);
export const ArrowLeft = ({
  size = 24,
  color = "#fff",
  className,
}: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path d="M19 12H5m7-7-7 7 7 7" stroke={color} strokeWidth="2" fill="none" />
  </svg>
);
export const ArrowRight = ({
  size = 24,
  color = "#fff",
  className,
}: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path
      d="M5 12h14m-7-7 7 7-7 7"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />
  </svg>
);
export const SwitchForm = ({
  size = 24,
  color = "#fff",
  className,
}: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <circle cx="8" cy="12" r="4" fill={color} />
    <rect x="13" y="10" width="6" height="6" rx="1" fill={color} />
    <path d="M10 12h3" stroke={color} strokeWidth="2" />
  </svg>
);
export const ResetIcon = ({
  size = 24,
  color = "#fff",
  className,
}: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path
      d="M20 12a8 8 0 1 1-2.34-5.66M20 3v4h-4"
      stroke={color}
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);
export const GridIcon = ({
  size = 24,
  color = "#fff",
  className,
}: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path
      d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"
      stroke={color}
      fill="none"
    />
  </svg>
);
