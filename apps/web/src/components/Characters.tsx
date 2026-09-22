import type { IconProps } from "./Icons";

type CharacterExpression =
  | "happy"
  | "neutral"
  | "surprised"
  | "angry"
  | "tired"
  | "defeated";
type CharacterProps = IconProps & { expression?: CharacterExpression };

function Face({
  expression,
  square = false,
}: {
  expression: CharacterExpression;
  square?: boolean;
}) {
  if (expression === "defeated")
    return (
      <>
        <path
          d="M7.3 8.7 10.1 11.5M10.1 8.7 7.3 11.5M13.9 8.7 16.7 11.5M16.7 8.7 13.9 11.5"
          stroke="#172554"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <path
          d="M9 16c1.8-1.2 4.2-1.2 6 0"
          stroke="#172554"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </>
    );
  return (
    <>
      <ellipse cx="8.6" cy="10.8" rx="2.05" ry="2.2" fill="#fff" />
      <ellipse cx="15.4" cy="10.8" rx="2.05" ry="2.2" fill="#fff" />
      <circle cx="9" cy="11" r="1.05" fill="#172554" />
      <circle cx="15" cy="11" r="1.05" fill="#172554" />
      <circle cx="9.35" cy="10.75" r=".35" fill="#fff" />
      <circle cx="15.35" cy="10.75" r=".35" fill="#fff" />
      {expression === "happy" && (
        <path
          d="M8.5 14.4c1.8 2 5.2 2 7 0"
          stroke="#172554"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      )}
      {expression === "surprised" && (
        <circle cx="12" cy="15" r="1.5" fill="#172554" />
      )}
      {expression === "neutral" && (
        <path
          d="M9.5 15h5"
          stroke="#172554"
          strokeWidth="1"
          strokeLinecap="round"
        />
      )}
      {expression === "tired" && (
        <path
          d="M9.5 15h5"
          stroke="#172554"
          strokeWidth="1"
          strokeLinecap="round"
        />
      )}
      {expression === "angry" && (
        <>
          <path
            d="M6.8 8.2 10 9.2M14 9.2l3.2-1"
            stroke="#172554"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M9 15.5c1.7-.8 4.3-.8 6 0"
            stroke="#172554"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        </>
      )}
      {square && (
        <path
          d="M5.5 5.5h2"
          stroke="#fff"
          strokeWidth="1"
          strokeLinecap="round"
          opacity=".45"
        />
      )}
    </>
  );
}
const characterStyle = {
  display: "block",
  position: "absolute" as const,
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
};

export function BallCharacter({
  size = 48,
  color = "#35a9ff",
  expression = "neutral",
  className,
}: CharacterProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={characterStyle}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="ballCharacterGradient" cx="30%" cy="25%">
          <stop offset="0" stopColor="#bff1ff" />
          <stop offset=".22" stopColor={color} />
          <stop offset="1" stopColor="#1769c2" />
        </radialGradient>
      </defs>
      <ellipse cx="12" cy="21" rx="6" ry="1.3" fill="#0b3b73" opacity=".28" />
      <g className="ball-character-legs">
        <path
          className="ball-character-leg-left"
          d="M6.3 17.2c-1.1 1.8-.5 3.1.8 3.5 1.3.4 2.1-.7 2.3-2.1"
          fill={color}
          stroke="#12529a"
          strokeWidth=".55"
        />
        <path
          className="ball-character-leg-right"
          d="M17.7 17.2c1.1 1.8.5 3.1-.8 3.5-1.3.4-2.1-.7-2.3-2.1"
          fill={color}
          stroke="#12529a"
          strokeWidth=".55"
        />
      </g>
      <path
        d="M10 3.4c.4-1.2 1.5-1.8 2.5-.9-.2 1.1-.7 1.9-1.7 2.4"
        fill="#4fc3ff"
        stroke="#12529a"
        strokeWidth=".45"
      />
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="url(#ballCharacterGradient)"
        stroke="#12529a"
        strokeWidth=".6"
      />
      <ellipse
        cx="8.2"
        cy="6.6"
        rx="2.5"
        ry="1.35"
        fill="#fff"
        opacity=".55"
        transform="rotate(-25 8.2 6.6)"
      />
      <Face expression={expression} />
      {(expression === "happy" || expression === "surprised") && (
        <>
          <circle cx="5.9" cy="13.9" r="1" fill="#ff8ba7" opacity=".65" />
          <circle cx="18.1" cy="13.9" r="1" fill="#ff8ba7" opacity=".65" />
        </>
      )}
    </svg>
  );
}

export function SquareCharacter({
  size = 48,
  color = "#ffd447",
  expression = "neutral",
  className,
}: CharacterProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={characterStyle}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="squareCharacterGradient"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop stopColor="#fff09a" />
          <stop offset=".28" stopColor={color} />
          <stop offset="1" stopColor="#e7a916" />
        </linearGradient>
      </defs>
      <ellipse cx="12" cy="21" rx="6.5" ry="1.3" fill="#805c0b" opacity=".25" />
      <path
        d="M6.2 17.8c-.3 2 .3 3 1.6 3.1 1.1.1 1.8-.7 1.8-2.1M17.8 17.8c.3 2-.3 3-1.6 3.1-1.1.1-1.8-.7-1.8-2.1"
        fill={color}
        stroke="#9b6808"
        strokeWidth=".55"
      />
      <path
        d="M12 3.2 15 1.8v2.9"
        fill="#ffc928"
        stroke="#9b6808"
        strokeWidth=".55"
        strokeLinejoin="round"
      />
      <rect
        x="2.2"
        y="3"
        width="19.6"
        height="17"
        rx="4"
        fill="url(#squareCharacterGradient)"
        stroke="#9b6808"
        strokeWidth=".65"
      />
      <path
        d="M4 5h7"
        stroke="#fff"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity=".5"
      />
      <Face expression={expression} square />
      {(expression === "happy" || expression === "surprised") && (
        <>
          <circle cx="5" cy="14" r=".9" fill="#ff9b45" opacity=".55" />
          <circle cx="19" cy="14" r=".9" fill="#ff9b45" opacity=".55" />
        </>
      )}
    </svg>
  );
}
