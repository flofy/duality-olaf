import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import type { ChallengeMechanic } from "@duality/game";
import { generateChallenge } from "@duality/game";
import { Button } from "./components/Button";
import { ArrowLeft, ArrowRight } from "./components/Icons";
import { LevelGameplayView } from "./game-screen/LevelGameplayView";
import { calculateLevelResult } from "./progression";
import { useLevelGameplay } from "./useLevelGameplay";
import { getActiveThemeName } from "./theme";

type Profile = {
  id: string;
  label: string;
  mechanics: readonly ChallengeMechanic[];
};

const PROFILES: readonly Profile[] = [
  { id: "classic", label: "CLASSIQUE", mechanics: ["walls"] },
  { id: "doors", label: "PORTES & INTERRUPTEURS", mechanics: ["walls", "doors"] },
  { id: "teleporters", label: "TÉLÉPORTEURS", mechanics: ["walls", "teleporters"] },
  { id: "advanced", label: "COMBINAISON", mechanics: ["walls", "doors", "teleporters"] },
];

function readSeed(search: string): number {
  const parsed = Number(new URLSearchParams(search).get("seed"));
  return Number.isInteger(parsed) && parsed > 0
    ? parsed
    : Date.now() % 2_000_000_000;
}

function readProfile(search: string): Profile {
  const id = new URLSearchParams(search).get("profile");
  return PROFILES.find((profile) => profile.id === id) ?? PROFILES[0];
}

function nextSeed() {
  return Math.floor(Math.random() * 1_900_000_000) + 1;
}

export function ChallengeMode() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(() => readProfile(location.search));
  const [seed, setSeed] = useState(() => readSeed(location.search));
  const [completed, setCompleted] = useState(false);

  const challenge = useMemo(
    () => generateChallenge(seed, { mechanics: profile.mechanics }),
    [profile.mechanics, seed],
  );

  const { state, movement, move, reset, switchForm, elapsedMs } =
    useLevelGameplay(challenge.level, () => navigate("/menu"));

  useEffect(() => {
    if (state.completed) setCompleted(true);
  }, [state.completed]);

  const result = completed
    ? calculateLevelResult(state.moves, challenge.moves, elapsedMs)
    : null;

  const start = (nextProfile: Profile, nextChallengeSeed: number) => {
    setProfile(nextProfile);
    setSeed(nextChallengeSeed);
    setCompleted(false);
    navigate(
      `/challenge?profile=${nextProfile.id}&seed=${nextChallengeSeed}`,
      { replace: true },
    );
  };

  const onReset = () => {
    setCompleted(false);
    reset();
  };

  return (
    <section className="game challenge-mode">
      <div className="topbar">
        <Button
          icon={<ArrowLeft size={18} />}
          aria-label="Retour au menu"
          onClick={() => navigate("/menu")}
          variant="secondary"
        />
        <b>DÉFI · {profile.label}</b>
      </div>

      <div className="challenge-meta">
        <span>SEED · {challenge.seed}</span>
        <span>{challenge.moves} coups optimaux</span>
      </div>

      {!completed ? (
        <LevelGameplayView
          level={challenge.level}
          state={state}
          movement={movement}
          skin="default"
          themeName={getActiveThemeName()}
          move={move}
          switchForm={switchForm}
          onReset={onReset}
        />
      ) : (
        <div className="modal-actions challenge-complete">
          <h2>DÉFI TERMINÉ</h2>
          <p className="muted">
            {result?.stars ?? 0} ★ · {result?.score ?? 0} points · {state.moves} coups
          </p>
          <p className="muted">SEED · {challenge.seed}</p>
          <Button
            icon={<ArrowRight size={18} />}
            label="NOUVEAU DÉFI"
            onClick={() => start(profile, nextSeed())}
            variant="primary"
          />
          <Button label="REJOUER" onClick={onReset} variant="secondary" />
        </div>
      )}

      <div className="challenge-actions" aria-label="Profils de défi">
        {PROFILES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`action ${item.id === profile.id ? "active" : ""}`}
            onClick={() => start(item, nextSeed())}
          >
            {item.label}
          </button>
        ))}
      </div>
    </section>
  );
}
