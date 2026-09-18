import React from "react";

export type IconProps = {
  size?: number;
  color?: string;
  className?: string;
};

const iconStyle = {
  display: "block",
  margin: "0 auto",
  userSelect: "none" as const,
};

export const XIcon = ({ size = 24, color = "#fff", className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={iconStyle}>
    <path d="M18 6L6 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M6 6L18 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const Check = ({ size = 24, color = "#4CAF50", className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={iconStyle}>
    <path d="M5 13L9 17L19 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);