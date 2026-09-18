import { useState, type CSSProperties } from "react";
import { useNavigate } from "react-router";
import { XIcon, ThemeIcon as Theme, Skin, Help } from "./components/Icons";
import { Button } from "./components/Button";

export function BurgerMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setOpen(!open);
  const closeMenu = () => setOpen(false);

  const navigateTo = (path: string) => {
    navigate(path);
    closeMenu();
  };

  const menuStyle: CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    padding: "20px",
  };

  const buttonStyle: CSSProperties = {
    width: "100%",
    maxWidth: "300px",
    padding: "12px 20px",
    fontSize: "16px",
  };

  return (
    <>
      <Button
        icon={<>
          <svg
            viewBox="0 0 24 24"
            width={20}
            height={20}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            style={{ userSelect: "none" }}
          >
            <path d="M3 12H21" />
            <path d="M3 6H21" />
            <path d="M3 18H21" />
          </svg>
        </>}
        label="MENU"
        onClick={toggleMenu}
        variant="secondary"
        className="burger-button"
        aria-label="Ouvrir le menu"
        aria-expanded={open}
      />

      {open && (
        <div className="burger-overlay" style={menuStyle} onClick={closeMenu}>
          <div
            className="burger-menu-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              width: "100%",
              maxWidth: "300px",
            }}
          >
            <button
              className="close-button"
              onClick={closeMenu}
              style={{
                alignSelf: "flex-end",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                userSelect: "none",
              }}
              aria-label="Fermer"
            >
              <XIcon size={24} />
            </button>

            <Button
              icon={<Theme size={18} />}
              label="THEME"
              onClick={() => navigateTo("/config")}
              variant="secondary"
              style={buttonStyle}
            />

            <Button
              icon={<Skin size={18} />}
              label="SKIN"
              onClick={() => navigateTo("/config")}
              variant="secondary"
              style={buttonStyle}
            />

            <Button
              icon={<Help size={18} />}
              label="AIDE"
              onClick={() => navigateTo("/help")}
              variant="secondary"
              style={buttonStyle}
            />

            <Button
              label="MONDES"
              onClick={() => navigateTo("/menu")}
              variant="secondary"
              style={buttonStyle}
            />
          </div>
        </div>
      )}
    </>
  );
}