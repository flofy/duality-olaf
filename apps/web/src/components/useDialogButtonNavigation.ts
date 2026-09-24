import { useEffect, useRef, useState } from "react";

const navigationKeys = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Tab",
]);

type DialogButtonNavigationOptions = {
  active: boolean;
  initialIndex?: number;
};

/**
 * Gère la navigation au clavier entre les boutons d'un dialogue.
 *
 * L'écoute est effectuée en phase capture au niveau du document afin que les
 * raccourcis globaux du jeu ne traitent pas les flèches pendant qu'un popin est
 * ouvert. Le focus est déplacé pendant le traitement de la touche, avant le
 * rendu suivant, afin que la sélection reste immédiatement visible.
 */
export function useDialogButtonNavigation({
  active,
  initialIndex = 0,
}: DialogButtonNavigationOptions) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  useEffect(() => {
    if (!active) return;

    setActiveIndex(initialIndex);
    const focusInitialButton = window.setTimeout(() => {
      getEnabledButtons(dialogRef.current)[initialIndex]?.focus();
    }, 0);
    return () => window.clearTimeout(focusInitialButton);
  }, [active, initialIndex]);

  useEffect(() => {
    if (!active) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const buttons = getEnabledButtons(dialogRef.current);
      if (buttons.length === 0) return;

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.stopImmediatePropagation();
        buttons[currentIndex(buttons, activeIndex)]?.click();
        return;
      }

      if (!navigationKeys.has(event.key)) return;
      event.preventDefault();
      event.stopImmediatePropagation();

      const current = currentIndex(buttons, activeIndex);
      const step =
        event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
      const next = (current + step + buttons.length) % buttons.length;
      setActiveIndex(next);
      buttons[next].focus();
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [active]);

  return { dialogRef, activeIndex };
}

function getEnabledButtons(dialog: HTMLDivElement | null): HTMLButtonElement[] {
  return dialog
    ? Array.from(dialog.querySelectorAll<HTMLButtonElement>("button")).filter(
        (button) => !button.disabled,
      )
    : [];
}

function currentIndex(buttons: HTMLButtonElement[], fallback: number): number {
  const focusedIndex = buttons.indexOf(
    document.activeElement as HTMLButtonElement,
  );
  return focusedIndex >= 0 ? focusedIndex : fallback;
}
