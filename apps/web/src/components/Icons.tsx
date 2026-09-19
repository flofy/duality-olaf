import React from "react";
import type { SVGProps } from "react";

export type IconProps = {
  size?: number;
  color?: string;
  className?: string;
};

// Game element icons
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
    style={{ display: "block", margin: "0 auto", userSelect: "none" }}
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
    style={{ display: "block", margin: "0 auto", userSelect: "none" }}
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
    style={{ display: "block", margin: "0 auto", userSelect: "none" }}
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
    style={{ display: "block", margin: "0 auto", userSelect: "none" }}
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
    style={{ display: "block", margin: "0 auto", userSelect: "none" }}
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
    style={{ display: "block", margin: "0 auto", userSelect: "none" }}
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
      style={{ display: "block", margin: "0 auto", userSelect: "none" }}
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

// UI/Navigation icons - using SVGProps for flexibility
export function ArrowLeft(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      style={{ ...props.style, userSelect: "none" }}
    >
      <path d="M15 18L9 12L15 6" />
    </svg>
  );
}

export function ArrowRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      style={{ ...props.style, userSelect: "none" }}
    >
      <path d="M9 18L15 12L9 6" />
    </svg>
  );
}

export function ArrowUp(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      style={{ ...props.style, userSelect: "none" }}
    >
      <path d="M18 15L12 9L6 15" />
    </svg>
  );
}

export function ArrowDown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      style={{ ...props.style, userSelect: "none" }}
    >
      <path d="M6 9L12 15L18 9" />
    </svg>
  );
}

export function SwitchForm(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      style={{ ...props.style, userSelect: "none" }}
    >
      <path d="M12 2L2 7L12 12L22 7L12 2Z" />
      <path d="M2 17L12 22L22 17" />
      <path d="M2 12L12 17L22 12" />
    </svg>
  );
}

export function ResetIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      style={{ ...props.style, userSelect: "none" }}
    >
      <path d="M3 12C3 12 5 8 12 8C19 8 21 10 21 12C21 14 19 16 12 16C5 16 3 12 3 12Z" />
      <path d="M21 4V2C21 2 19 2 19 2" />
      <path d="M3 20V22C3 22 5 22 5 22" />
      <path d="M19 2C17 4 12 4 12 4" />
      <path d="M5 22C7 20 12 20 12 20" />
    </svg>
  );
}

export function Maximize(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      style={{ ...props.style, userSelect: "none" }}
    >
      <path d="M8 3H5C3.895 3 3 3.895 3 5V8" />
      <path d="M21 16V19C21 20.105 20.105 21 19 21H16" />
      <path d="M16 3H19C20.105 3 21 3.895 21 5V8" />
      <path d="M3 16V19C3 20.105 3.895 21 5 21H8" />
    </svg>
  );
}

export function Minimize(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      style={{ ...props.style, userSelect: "none" }}
    >
      <path d="M8 3V5H16V3H18" />
      <path d="M5 18H3V16H5V18Z" />
      <path d="M18 18H16V16H18V18Z" />
      <path d="M5 8H3V18H5V8Z" />
    </svg>
  );
}

export function Help(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      style={{ ...props.style, userSelect: "none" }}
    >
      <circle cx={12} cy={12} r={10} />
      <path d="M12 16V12" />
      <path d="M12 8H12.01" />
    </svg>
  );
}

export function ThemeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      style={{ ...props.style, userSelect: "none" }}
    >
      <path d="M12 3V16" />
      <path d="M12 21C17.5228 21 22 16.5228 22 11C22 5.47715 17.5228 1 12 1C6.47715 1 2 5.47715 2 11C2 16.5228 6.47715 21 12 21Z" />
      <path d="M3 12H21" />
      <path d="M12 3C12 3 14 5 14 11C14 17 12 19 12 19" />
    </svg>
  );
}

export function Skin(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      style={{ ...props.style, userSelect: "none" }}
    >
      <path d="M12 2L8 6L12 10L16 6L12 2Z" />
      <path d="M12 14L8 18L12 22L16 18L12 14Z" />
      <path d="M2 12L6 12" />
      <path d="M18 12L22 12" />
      <path d="M12 2L12 10" />
      <path d="M12 14L12 22" />
    </svg>
  );
}

export function Check(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      style={{ ...props.style, userSelect: "none" }}
    >
      <path d="M5 13L9 17L19 7" />
    </svg>
  );
}

export function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      style={{ ...props.style, userSelect: "none" }}
    >
      <path d="M6 6L18 18" />
      <path d="M18 6L6 18" />
    </svg>
  );
}


