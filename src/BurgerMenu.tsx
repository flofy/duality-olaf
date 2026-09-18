import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "./components/Button";
import {
  Help,
  ThemeIcon as Theme,
  Skin,
  Maximize,
  ArrowLeft,
} from "./components/Icons";

export function BurgerMenu() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      icon: <ArrowLeft size={18} />,
      label: "MONDES",
      path: "/menu",
      variant: "secondary" as const,
    },
    {
      icon: (
        <div style={{ display: "flex", gap: "4px" }}>
          <Theme size={16} />
          <Skin size={16} />
        </div>
      ),
      label: "THÈME - SKIN",
      path: "/config",
      variant: "secondary" as const,
    },
    {
      icon: <Help size={18} />,
      label: "AIDE",
      path: "/help",
      variant: "secondary" as const,
    },
    {
      icon: <Maximize size={18} />,
      label: "PLEIN ÉCRAN",
      path: "/fullscreen",
      variant: "secondary" as const,
    },
  ];

  return (
    <>
      <button
        className="burger-menu-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu"
        aria-expanded={isOpen}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "block", margin: "0 auto" }}
        >
          <path
            d="M3 12H21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M3 6H21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M3 18H21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="burger-menu-overlay" onClick={() => setIsOpen(false)}>
          <div
            className="burger-menu-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="burger-menu-close"
              onClick={() => setIsOpen(false)}
              aria-label="Fermer"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Croix avec barres horizontales et verticales (alignées sur les 3 traits du menu) */}
                <path
                  d="M6 12H18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M12 6V18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <div className="burger-menu-items">
              {menuItems.map((item, index) => (
                <Button
                  key={index}
                  icon={item.icon}
                  label={item.label}
                  onClick={() => {
                    if (item.path) {
                      navigate(item.path);
                    }
                    setIsOpen(false);
                  }}
                  variant={item.variant}
                  className="burger-menu-item"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
