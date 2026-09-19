import React from "react";

export type IconProps = {
  size?: number;
  color?: string;
  className?: string;
};

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

export const Spike = ({
  size = 24,
  color = "#ff4444",
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
      d="M12 2L14 8H20L16 12L18 18L12 14L6 18L8 12L4 8H10L12 2Z"
      fill={color}
    />
    <path
      d="M12 4L13 7H19L17 9L18 13L12 11L6 13L8 9L4 7H9L12 4Z"
      fill="#cc0000"
    />
    <path d="M12 2L12 4" stroke="#880000" strokeWidth="1.5" />
  </svg>
);

export const Ball = ({
  size = 24,
  color = "#4aa3ff",
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
    <circle cx="12" cy="14" r="10" fill="#3a8bc8" />
    <circle cx="12" cy="12" r="10" fill={color} />
    <circle cx="10" cy="10" r="4" fill="white" opacity={0.7} />
    <circle cx="14" cy="8" r="2" fill="white" opacity={0.9} />
    <circle cx="12" cy="12" r="10" stroke="#2a6bc1" strokeWidth="0.5" />
  </svg>
);

export const Square = ({
  size = 24,
  color = "#ffd447",
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
    <rect x="3" y="3" width="18" height="18" rx="2" fill="#d4a840" />
    <rect x="2" y="2" width="20" height="20" rx="2" fill={color} />
    <rect
      x="4"
      y="4"
      width="16"
      height="16"
      rx="1"
      fill="white"
      opacity={0.3}
    />
    <rect x="2" y="2" width="20" height="2" rx="1" fill="white" opacity={0.5} />
    <rect x="2" y="2" width="2" height="20" rx="1" fill="white" opacity={0.5} />
    <rect
      x="2"
      y="2"
      width="20"
      height="20"
      rx="2"
      stroke="#e6b830"
      strokeWidth="0.5"
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
    {!isOpen && <circle cx="12" cy="12" r="0.5" fill="#ffd447" />}
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
    <path d="M12 2V4" stroke={color} strokeWidth="2" />
    <path d="M12 20V22" stroke={color} strokeWidth="2" />
    <path d="M2 12H4" stroke={color} strokeWidth="2" />
    <path d="M20 12H22" stroke={color} strokeWidth="2" />
    <path d="M4.93 4.93L6.36 6.36" stroke={color} strokeWidth="1.5" />
    <path d="M17.64 17.64L19.07 19.07" stroke={color} strokeWidth="1.5" />
    <path d="M4.93 19.07L6.36 17.64" stroke={color} strokeWidth="1.5" />
    <path d="M17.64 6.36L19.07 4.93" stroke={color} strokeWidth="1.5" />
    <radialGradient
      id="teleporterGlow"
      cx="12"
      cy="12"
      r="8"
      gradientUnits="userSpaceOnUse"
    >
      <stop offset="0%" stopColor={color} stopOpacity="0.8" />
      <stop offset="100%" stopColor={color} stopOpacity="0" />
    </radialGradient>
    <circle cx="12" cy="12" r="8" fill="url(#teleporterGlow)" />
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
      <rect
        x="7"
        y="7"
        width="10"
        height="10"
        rx="1"
        fill={color}
        opacity={0.6}
      />
      <circle cx="12" cy="12" r="3" fill={color} />
      <text
        x="12"
        y="15"
        fontSize="10"
        textAnchor="middle"
        fill="white"
        fontWeight="bold"
      >
        {glyph}
      </text>
      <circle cx="12" cy="10" r="1" fill="white" opacity={0.8} />
    </svg>
  );
};

export const ArrowUp = ({
  size = 24,
  color = "#fff",
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
    <path d="M12 19V5" stroke={color} strokeWidth="2" />
    <path d="M5 12L12 5L19 12" stroke={color} strokeWidth="2" />
  </svg>
);

export const ArrowDown = ({
  size = 24,
  color = "#fff",
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
    <path d="M12 5V19" stroke={color} strokeWidth="2" />
    <path d="M19 12L12 19L5 12" stroke={color} strokeWidth="2" />
  </svg>
);

export const ArrowLeft = ({
  size = 24,
  color = "#fff",
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
    <path d="M19 12H5" stroke={color} strokeWidth="2" />
    <path d="M12 19L5 12L12 5" stroke={color} strokeWidth="2" />
  </svg>
);

export const ArrowRight = ({
  size = 24,
  color = "#fff",
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
    <path d="M5 12H19" stroke={color} strokeWidth="2" />
    <path d="M12 5L19 12L12 19" stroke={color} strokeWidth="2" />
  </svg>
);

export const SwitchForm = ({
  size = 24,
  color = "#fff",
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
    <circle cx="8" cy="12" r="4" fill={color} />
    <circle cx="8" cy="12" r="1" fill="white" opacity={0.8} />
    <rect x="13" y="10" width="6" height="6" rx="1" fill={color} />
    <rect
      x="14"
      y="11"
      width="2"
      height="2"
      rx="0.5"
      fill="white"
      opacity={0.8}
    />
    <path d="M10 12H13" stroke={color} strokeWidth="2" />
    <path d="M11 11L12 12L11 13" stroke={color} strokeWidth="1.5" />
  </svg>
);

export const ResetIcon = ({
  size = 24,
  color = "#fff",
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
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Flèche circulaire (recommencer). */}
    <path d="M20 12a8 8 0 1 1-2.34-5.66" stroke={color} strokeWidth="2" />
    <path d="M20 3v4h-4" stroke={color} strokeWidth="2" />
  </svg>
);

export const GridIcon = ({
  size = 24,
  color = "#fff",
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
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Grille 3×3 (mode d'affichage du plateau). */}
    <rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="2"
      stroke={color}
      strokeWidth="2"
    />
    <path d="M9 3v18M15 3v18M3 9h18M3 15h18" stroke={color} strokeWidth="2" />
  </svg>
);

export const Maximize = ({
  size = 24,
  color = "#fff",
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
    strokeLinecap="round"
  >
    <path d="M8 3H5a2 2 0 0 0-2 2v3" stroke={color} strokeWidth="2" />
    <path d="M16 3h3a2 2 0 0 1 2 2v3" stroke={color} strokeWidth="2" />
    <path d="M21 16v3a2 2 0 0 1-2 2h-3" stroke={color} strokeWidth="2" />
    <path d="M8 21H5a2 2 0 0 1-2-2v-3" stroke={color} strokeWidth="2" />
  </svg>
);

export const Minimize = ({
  size = 24,
  color = "#fff",
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
    strokeLinecap="round"
  >
    <path d="M8 3v3a2 2 0 0 1-2 2H3" stroke={color} strokeWidth="2" />
    <path d="M16 3v3a2 2 0 0 0 2 2h3" stroke={color} strokeWidth="2" />
    <path d="M8 21v-3a2 2 0 0 0-2-2H3" stroke={color} strokeWidth="2" />
    <path d="M16 21v-3a2 2 0 0 1 2-2h3" stroke={color} strokeWidth="2" />
  </svg>
);

export const Help = ({ size = 24, color = "#fff", className }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: "block", margin: "0 auto" }}
    strokeLinecap="round"
  >
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <path
      d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
      stroke={color}
      strokeWidth="2"
    />
    <path d="M12 17h.01" stroke={color} strokeWidth="2" />
  </svg>
);

export const ThemeIcon = ({
  size = 24,
  color = "#fff",
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
    strokeLinecap="round"
  >
    <circle cx="12" cy="12" r="4" stroke={color} strokeWidth="2" />
    <path d="M12 2v2" stroke={color} strokeWidth="2" />
    <path d="M12 20v2" stroke={color} strokeWidth="2" />
    <path d="M4.93 4.93l1.41 1.41" stroke={color} strokeWidth="2" />
    <path d="M17.66 17.66l1.41 1.41" stroke={color} strokeWidth="2" />
    <path d="M2 12h2" stroke={color} strokeWidth="2" />
    <path d="M20 12h2" stroke={color} strokeWidth="2" />
    <path d="M6.34 17.66l-1.41 1.41" stroke={color} strokeWidth="2" />
    <path d="M19.07 4.93l-1.41 1.41" stroke={color} strokeWidth="2" />
  </svg>
);

export const Skin = ({ size = 24, color = "#fff", className }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: "block", margin: "0 auto" }}
    strokeLinecap="round"
  >
    <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" />
    <path d="M4 21a8 8 0 0 1 16 0" stroke={color} strokeWidth="2" />
  </svg>
);
