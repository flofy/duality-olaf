import React from "react";

export type IconProps = {
  size?: number;
  color?: string;
  className?: string;
};

// Spike
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
    aria-label="Pique"
  >
    <path
      d="M12 2L14 8H20L16 12L18 18L12 14L6 18L8 12L4 8H10L12 2Z"
      fill={color}
    />
    <path
      d="M12 4L13 7H19L17 9L18 13L12 11L6 13L8 9L4 7H9L12 4Z"
      fill="#cc0000"
    />
    <path d="M12 2L10 6H14L12 2Z" fill="#ff8888" opacity={0.7} />
  </svg>
);

// Ball
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
    aria-label="Boule"
  >
    <circle cx="12" cy="12" r="10" fill={color} />
    <circle cx="10" cy="10" r="2" fill="white" opacity={0.8} />
    <circle cx="12" cy="12" r="4" fill="white" opacity={0.2} />
  </svg>
);

// Square
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
    aria-label="Carré"
  >
    <rect x="2" y="2" width="20" height="20" rx="2" fill={color} />
    <rect
      x="4"
      y="4"
      width="16"
      height="16"
      rx="1"
      fill="white"
      opacity={0.2}
    />
    <rect
      x="2"
      y="2"
      width="20"
      height="20"
      rx="2"
      stroke="#ffeeaa"
      strokeWidth="0.5"
    />
  </svg>
);

// Star
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
    aria-label="Étoile"
  >
    <path d="M12 2L14.5 9.5L22 10.5L16 14L17.5 21L12 18L6.5 21L8 14L2 10.5L9.5 9.5L12 2Z" />
  </svg>
);

// Door
export interface DoorProps extends IconProps {
  isOpen?: boolean;
}
export const Door = ({
  size = 24,
  color = "#7a5c3d",
  isOpen = false,
  className,
}: DoorProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label={isOpen ? "Porte ouverte" : "Porte fermée"}
  >
    <rect x="6" y="2" width="12" height="20" rx="1" fill={color} />
    <circle cx="16" cy="12" r="1" fill="#ffd447" />
    <rect x="8" y="8" width="8" height="8" rx="1" fill="#4a3728" />
    {!isOpen && (
      <rect x="8" y="10" width="8" height="4" rx="1" fill="#3a2718" />
    )}
  </svg>
);

// Teleporter
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
    aria-label="Téléporteur"
  >
    <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="2" />
    <circle cx="12" cy="12" r="4" stroke={color} strokeWidth="2" />
    <circle cx="12" cy="12" r="1" fill={color} />
  </svg>
);

// SwitchIcon
export interface SwitchIconProps extends IconProps {
  form?: "ball" | "square" | "either";
}
export const SwitchIcon = ({
  size = 24,
  color = "#ffd447",
  form = "either",
  className,
}: SwitchIconProps) => {
  const glyph = form === "ball" ? "●" : form === "square" ? "■" : "⌁";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="6"
        y="6"
        width="12"
        height="12"
        rx="2"
        fill={color}
        opacity={0.3}
      />
      <circle cx="12" cy="12" r="4" fill={color} />
      <text x="12" y="15" fontSize="8" textAnchor="middle" fill="white">
        {glyph}
      </text>
    </svg>
  );
};

// Arrows
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
    aria-label="Flèche vers le haut"
  >
    <path d="M12 19V5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path
      d="M5 12L12 5L19 12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
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
    aria-label="Flèche vers le bas"
  >
    <path d="M12 5V19" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path
      d="M19 12L12 19L5 12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
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
    aria-label="Flèche vers la gauche"
  >
    <path d="M19 12H5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path
      d="M12 19L5 12L12 5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
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
    aria-label="Flèche vers la droite"
  >
    <path d="M5 12H19" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path
      d="M12 5L19 12L12 19"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

// Action Icons
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
    aria-label="Changer de forme"
  >
    <circle cx="8" cy="12" r="3" fill={color} />
    <rect x="13" y="9" width="6" height="6" rx="1" fill={color} />
    <path d="M10 12H13" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path
      d="M11 11L12 12L11 13"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
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
    aria-label="Réinitialiser"
  >
    <path
      d="M21.5 2V8H15.5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M21.5 15C21.5 19.6863 18.1863 23 13.5 23C8.81371 23 5.5 19.6863 5.5 15C5.5 10.3137 8.81371 7 13.5 7"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M15.5 15H21.5V21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
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
    aria-label="Plein écran"
  >
    <rect x="3" y="3" width="7" height="7" stroke={color} strokeWidth="2" />
    <rect x="14" y="3" width="7" height="7" stroke={color} strokeWidth="2" />
    <rect x="14" y="14" width="7" height="7" stroke={color} strokeWidth="2" />
    <rect x="3" y="14" width="7" height="7" stroke={color} strokeWidth="2" />
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
    aria-label="Quitter le plein écran"
  >
    <rect x="4" y="4" width="6" height="6" stroke={color} strokeWidth="2" />
    <line x1="10" y1="4" x2="4" y2="4" stroke={color} strokeWidth="2" />
    <line x1="4" y1="4" x2="4" y2="10" stroke={color} strokeWidth="2" />
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
    aria-label="Aide"
  >
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <path d="M12 16V12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path
      d="M12 8H12.01"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="12" cy="20" r="1" fill={color} />
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
    aria-label="Changer de thème"
  >
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <path
      d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="4 4"
    />
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
    aria-label="Changer de peau"
  >
    <rect
      x="6"
      y="6"
      width="12"
      height="12"
      rx="2"
      stroke={color}
      strokeWidth="2"
    />
    <circle cx="9" cy="9" r="1" fill={color} />
    <circle cx="15" cy="9" r="1" fill={color} />
    <path d="M9 15H15" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const Lock = ({ size = 24, color = "#fff", className }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Niveau verrouillé"
  >
    <rect
      x="3"
      y="10"
      width="18"
      height="12"
      rx="2"
      stroke={color}
      strokeWidth="2"
    />
    <circle cx="12" cy="16" r="1" fill={color} />
    <path
      d="M7 10V8C7 5.79086 8.79086 4 11 4H13C15.2091 4 17 5.79086 17 8V10"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const Check = ({ size = 24, color = "#fff", className }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Niveau terminé"
  >
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <path
      d="M9 12L11 14L15 10"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
