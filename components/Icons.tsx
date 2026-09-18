import type { SVGProps } from "react";

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