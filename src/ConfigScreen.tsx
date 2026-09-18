import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "./components/Button";
import {
  ArrowLeft,
  Help,
  ThemeIcon as Theme,
  Skin,
  ResetIcon as Reset,
} from "./components/Icons";
import {
  cycleTheme,
  getActiveThemeName,
  getTheme,
  hexToCss,
} from "./theme";
import {
  getAvailableSkinPreferences,
  getSkinPreference,
  normalizeSkinPreference,
  setSkinPreference,
  skinLabels,
} from "./skins";
import { getCompletedCount } from "./progression";
import { campaign } from "./levels/campaign";

export function ConfigScreen() {
  const navigate = useNavigate();
  const [skinPreference, setSkinPreferenceState] = useState(
    () => normalizeSkinPreference(getSkinPreference())
  );
  const [tick, setTick] = useState(0);
  const availableSkins = getAvailableSkinPreferences();
  const skin = normalizeSkinPreference(skinPreference);

  const theme = getTheme();
  const themeName = getActiveThemeName();

  const themeColors = Object.entries(theme)
    .filter(([, value]) => typeof value === "number")
    .map(([key, value]) => ({ key, value: hexToCss(value as number) }));

  return (
    <section className="config-screen">
      <div className="config-header">
        <Button
          icon={<ArrowLeft size={18} />}
          label="RETOUR"
          onClick={() => navigate("/menu")}
          variant="secondary"
        />
        <h1 className="title">CONFIGURATION</h1>
      </div>

      <div className="config-sections">
        <div className="config-section">
          <h2 className="subtitle">THÈME</h2>
          <div className="config-options">
            <Button
              icon={<Theme size={20} />}
              label={themeName.toUpperCase()}
              onClick={() => {
                cycleTheme();
                setTick(tick + 1);
              }}
              variant="primary"
              className="config-button"
            />
            <div className="theme-preview">
              {themeColors.map(({ key, value }) => (
                <div
                  key={key}
                  className="theme-color-preview"
                  style={{ backgroundColor: value }}
                  title={key}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="config-section">
          <h2 className="subtitle">SKIN</h2>
          <div className="config-options">
            <Button
              icon={<Skin size={20} />}
              label={skinLabels[skin]}
              onClick={() => {
                const index = availableSkins.indexOf(skin);
                const next = availableSkins[(index + 1) % availableSkins.length] ?? "auto";
                setSkinPreference(next);
                setSkinPreferenceState(next);
              }}
              variant="primary"
              className="config-button"
            />
            <p className="muted">
              Skin actuel: {skinLabels[skin]}
            </p>
          </div>
        </div>

        <div className="config-section">
          <h2 className="subtitle">STATISTIQUES</h2>
          <div className="stats-info">
            <p>
              Niveaux terminés: {getCompletedCount()} / {campaign.length}
            </p>
            <p className="muted">Progression: {Math.round((getCompletedCount() / campaign.length) * 100)}%</p>
          </div>
        </div>

        <div className="config-section">
          <h2 className="subtitle">RÉINITIALISER</h2>
          <div className="config-options">
            <Button
              icon={<Reset size={20} />}
              label="RECOMMENCER TOUT"
              onClick={() => {
                navigate("/menu");
              }}
              variant="danger"
              className="config-button"
            />
          </div>
        </div>

        <div className="config-section">
          <h2 className="subtitle">AIDE</h2>
          <div className="config-options">
            <Button
              icon={<Help size={20} />}
              label="COMMENT JOUER"
              onClick={() => navigate("/help")}
              variant="secondary"
              className="config-button"
            />
          </div>
        </div>
      </div>
    </section>
  );
}