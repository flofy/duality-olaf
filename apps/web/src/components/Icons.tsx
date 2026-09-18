import React from "react";

export type IconProps = {
  size?: number;
  color?: string;
  className?: string;
};

// Spike
export const Spike = ({ size = 24, color = "#ff4444", className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Spike">
    <path d="M12 2L14 8H20L16 12L18 18L12 14L6 18L8 12L4 8H10L12 2Z" fill={color} />
    <path d="M12 4L13 7H19L17 9L18 13L12 11L6 13L8 9L4 7H9L12 4Z" fill="#cc0000" />
  </svg>
);