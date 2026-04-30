import { observeOrderPanel } from "./order-panel";
import { observeTopOfBook, type BookObserver, type BookSnapshot } from "./order-book";
import { setPrice } from "./price-sync";
import { getEnabled, onEnabledChanged } from "./storage";
import { mountToggleWidget, type ToggleWidget, type WidgetStatus } from "./toggle-widget";
import { formatSv, decimalsOfSv } from "./num-sv";
import type { PanelHandle } from "./types";

interface Engine {
  setEnabled(value: boolean): void;
  setPanel(handle: PanelHandle | null): void;
  setSide(side: PanelHandle["side"]): void;
  destroy(): void;
}

// Owns the only allowed source of price writes. Every state transition
// flows through one of the four setters; everything else (book observer,
// price write, widget status) is derived state.
function createEngine(widget: ToggleWidget): Engine {
  let enabled = false;
  let panel: PanelHandle | null = null;
  let bookObs: BookObserver | null = null;
  let lastSnapshot: BookSnapshot = { bestBid: null, bestAsk: null };

  function teardownBook() {
    if (bookObs) {
      bookObs.stop();
      bookObs = null;
    }
    lastSnapshot = { bestBid: null, bestAsk: null };
  }

  function applySnapshot() {
    if (!enabled || !panel) {
      widget.setStatus(enabled ? { kind: "waiting" } : { kind: "off" });
      return;
    }

    const target = panel.side === "buy" ? lastSnapshot.bestAsk : lastSnapshot.bestBid;

    if (target == null || !Number.isFinite(target)) {
      widget.setStatus({ kind: "no-book" });
      return;
    }

    setPrice(panel.priceInput, target);
    const decimals = decimalsOfSv(panel.priceInput.value) ?? 2;
    widget.setStatus({
      kind: "syncing",
      side: panel.side,
      price: formatSv(target, decimals),
    });
  }

  function startBookIfReady() {
    teardownBook();
    if (!enabled || !panel) return;
    bookObs = observeTopOfBook((snapshot) => {
      lastSnapshot = snapshot;
      applySnapshot();
    });
    // observeTopOfBook emits an initial snapshot synchronously when the
    // book is already mounted; if the book hasn't appeared yet, the
    // observer will call us back as soon as it does.
  }

  return {
    setEnabled(value) {
      if (enabled === value) return;
      enabled = value;
      startBookIfReady();
      // If we just turned off, we need to make sure the widget reflects
      // off state immediately even if applySnapshot doesn't run.
      if (!enabled) widget.setStatus({ kind: "off" });
      else applySnapshot();
    },
    setPanel(handle) {
      panel = handle;
      startBookIfReady();
      applySnapshot();
    },
    setSide(side) {
      if (!panel) return;
      panel = { ...panel, side };
      applySnapshot();
    },
    destroy() {
      teardownBook();
    },
  };
}

async function main() {
  const widget = await mountToggleWidget();
  const engine = createEngine(widget);

  engine.setEnabled(await getEnabled());
  onEnabledChanged((next) => engine.setEnabled(next));

  observeOrderPanel({
    onOpen(handle) {
      engine.setPanel(handle);
    },
    onClose() {
      engine.setPanel(null);
    },
    onSideChange(side) {
      engine.setSide(side);
    },
  });
}

void main();
