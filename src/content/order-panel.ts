import { SEL } from "./selectors";
import { resolveSide } from "./side";
import type { PanelHandle, Side } from "./types";

export interface PanelEvents {
  onOpen(handle: PanelHandle): void;
  onClose(): void;
  onSideChange(side: Side): void;
}

export interface PanelObserver {
  stop(): void;
}

// Avanza is a SPA; both DOM mutations (panel mount/unmount) and SPA navigation
// (kop ↔ salj URL changes) need to wake us up. Side changes via the in-form
// switchSideButton don't fire popstate, so we also patch pushState/replaceState.
export function observeOrderPanel(events: PanelEvents): PanelObserver {
  let lastInput: HTMLInputElement | null = null;
  let lastSide: Side | null = null;

  function poll() {
    const priceInput = document.querySelector<HTMLInputElement>(SEL.priceInput);
    const side = resolveSide();

    if (!priceInput || !side) {
      if (lastInput) {
        lastInput = null;
        lastSide = null;
        events.onClose();
      }
      return;
    }

    if (priceInput !== lastInput) {
      lastInput = priceInput;
      lastSide = side;
      events.onOpen({ priceInput, side });
      return;
    }

    if (side !== lastSide) {
      lastSide = side;
      events.onSideChange(side);
    }
  }

  const mo = new MutationObserver(() => poll());
  mo.observe(document.body, { childList: true, subtree: true });

  const restoreHistory = patchHistory(poll);
  window.addEventListener("popstate", poll);

  // Initial pass in case the panel is already mounted when we load.
  poll();

  return {
    stop() {
      mo.disconnect();
      window.removeEventListener("popstate", poll);
      restoreHistory();
      if (lastInput) events.onClose();
      lastInput = null;
      lastSide = null;
    },
  };
}

// History API doesn't fire events for pushState/replaceState. Wrap them so
// we can react to SPA route changes without polling on a timer.
function patchHistory(cb: () => void): () => void {
  const origPush = history.pushState;
  const origReplace = history.replaceState;
  history.pushState = function (...args) {
    const result = origPush.apply(this, args);
    queueMicrotask(cb);
    return result;
  };
  history.replaceState = function (...args) {
    const result = origReplace.apply(this, args);
    queueMicrotask(cb);
    return result;
  };
  return () => {
    history.pushState = origPush;
    history.replaceState = origReplace;
  };
}
