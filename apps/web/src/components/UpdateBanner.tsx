import { useEffect, useState } from "react";

type UpdateBannerProps = {
  updateSW: (reloadPage?: boolean) => Promise<void>;
};

export function UpdateBanner({ updateSW }: UpdateBannerProps) {
  const [visible, setVisible] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const onUpdate = () => setVisible(true);
    window.addEventListener("duality:pwa-update", onUpdate);
    return () => window.removeEventListener("duality:pwa-update", onUpdate);
  }, []);

  if (!visible) return null;

  const applyUpdate = async () => {
    if (updating) return;
    setUpdating(true);
    try {
      await updateSW(true);
    } catch {
      setUpdating(false);
    }
  };

  return (
    <aside className="pwa-update-banner" role="status" aria-live="polite">
      <div className="pwa-update-content">
        <span className="pwa-update-icon" aria-hidden="true">
          ✨
        </span>
        <div className="pwa-update-copy">
          <strong>Une nouvelle version est disponible</strong>
          <span>Profitez des dernières améliorations de Duality Olaf.</span>
        </div>
        <div className="pwa-update-actions">
          <button
            type="button"
            className="pwa-update-button"
            onClick={() => void applyUpdate()}
            disabled={updating}
          >
            {updating ? "MISE À JOUR…" : "METTRE À JOUR"}
          </button>
          <button
            type="button"
            className="pwa-update-dismiss"
            onClick={() => setVisible(false)}
            disabled={updating}
          >
            Plus tard
          </button>
        </div>
      </div>
    </aside>
  );
}
