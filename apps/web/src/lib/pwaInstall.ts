export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * Capture au niveau module de l'invite d'installation : elle survit à la
 * fermeture de n'importe quelle bannière, INSTALLER reste donc disponible dans
 * le menu à tout moment.
 */
let deferred: BeforeInstallPromptEvent | null = null;

export function getDeferredInstallPrompt(): BeforeInstallPromptEvent | null {
  return deferred;
}

export function setDeferredInstallPrompt(
  event: BeforeInstallPromptEvent | null,
): void {
  deferred = event;
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferred = event as BeforeInstallPromptEvent;
});
window.addEventListener("appinstalled", () => {
  deferred = null;
});

export function isStandaloneDisplay(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}
