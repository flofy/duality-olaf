const navigationKeys = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Tab",
]);

/**
 * Navigation clavier entre les boutons d'un dialogue (action Svelte).
 *
 * L'écoute est faite en phase capture sur le document pour que les raccourcis
 * globaux du jeu ne traitent pas les flèches tant qu'un popin est ouvert.
 * L'action est montée avec le dialogue : il suffit de le rendre conditionnellement.
 */
export function createDialogNavigation(initialIndex = 0) {
  let activeIndex = $state(initialIndex);

  function enabledButtons(dialog: HTMLElement): HTMLButtonElement[] {
    return Array.from(
      dialog.querySelectorAll<HTMLButtonElement>("button"),
    ).filter((button) => !button.disabled);
  }

  function currentIndex(
    buttons: HTMLButtonElement[],
    fallback: number,
  ): number {
    const focused = buttons.indexOf(
      document.activeElement as HTMLButtonElement,
    );
    return focused >= 0 ? focused : fallback;
  }

  function action(dialog: HTMLElement) {
    activeIndex = initialIndex;
    const focusInitial = window.setTimeout(() => {
      enabledButtons(dialog)[initialIndex]?.focus();
    }, 0);

    const onKeyDown = (event: KeyboardEvent) => {
      const buttons = enabledButtons(dialog);
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
      activeIndex = next;
      buttons[next]!.focus();
    };

    document.addEventListener("keydown", onKeyDown, true);
    return {
      destroy() {
        window.clearTimeout(focusInitial);
        document.removeEventListener("keydown", onKeyDown, true);
      },
    };
  }

  return {
    action,
    get activeIndex() {
      return activeIndex;
    },
  };
}
