import { useState, useEffect, type CSSProperties } from "react";
import { useNavigate } from "react-router";
import {
  getAvailableSkinPreferences,
  getSkinPreference,
  normalizeSkinPreference,
  setSkinPreference,
  skinLabels,
  type SkinPreference,
} from "./skins";
import { cycleTheme, getActiveThemeName, getTheme, hexToCss } from "./theme";
import { Button } from "./components/Button";
import { ArrowLeft, ArrowRight, SwitchForm, ThemeIcon as Theme, Skin } from "./components/Icons";

export function ConfigScreen() {
  const navigate = useNavigate();
  const [themeName, setThemeName] = useState(() => getActiveThemeName());
  const [skinPreference, setSkinPreferenceState] = useState<SkinPreference>(() =>
    normalizeSkinPreference(getSkinPreference()),
  );
  const availableSkins = getAvailableSkinPreferences();

  const cycleThemeForward = () => {
    cycleTheme(1);
    setThemeName(getActiveThemeName());
  };

  const cycleThemeBackward = () => {
    cycleTheme(-1);
    setThemeName(getActiveThemeName());
  };

  const handleSkinChange = (skin: SkinPreference) => {
    setSkinPreference(skin);
    setSkinPreferenceState(skin);
  };

  const theme = getTheme();

  const containerStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    padding: "20px",
    maxWidth: "600px",
    margin: "0 auto",
    width: "100%",
  };

  const sectionStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  };

  const optionGroupStyle: CSSProperties = {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  };

  const optionButtonStyle: CSSProperties = {
    flex: "1",
    minWidth: "120px",
  };

  return (
    <section className="config-screen" style={containerStyle}>
      <div className="config-header">
        <Button
          icon={<ArrowLeft size={18} />}
          label="RETOUR"
          onClick={() => navigate("/menu")}
          variant="secondary"
        />
        <h1 className="title" style={{ margin: "16px 0" }}>
          CONFIGURATION
        </h1>
      </div>

      <div style={sectionStyle}>
        <h2 className="subtitle">THEME</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Button
            icon={<ArrowLeft size={18} />}
            label="PRECEDENT"
            onClick={cycleThemeBackward}
            variant="secondary"
          />
          <span
            style={{
              flex: "1",
              textAlign: "center",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            {themeName.toUpperCase()}
          </span>
          <Button
            icon={<ArrowRight size={18} />}
            label="SUIVANT"
            onClick={cycleThemeForward}
            variant="secondary"
          />
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 className="subtitle">SKIN</h2>
        <div style={optionGroupStyle}>
          {availableSkins.map((skin) => (
            <Button
              key={skin}
              label={skinLabels[skin] || skin}
              onClick={() => handleSkinChange(skin)}
              variant={skinPreference === skin ? "primary" : "secondary"}
              style={optionButtonStyle}
            />
          ))}
        </div>
      </div>

      <div className="config-actions">
        <Button
          icon={<SwitchForm size={18} />}
          label="CHANGER FORME"
          onClick={() => {}}
          variant="secondary"
        />
      </div>
    </section>
  );
}