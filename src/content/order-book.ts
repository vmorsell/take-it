import { parseSv } from "./num-sv";
import { SEL } from "./selectors";

export interface BookSnapshot {
  bestBid: number | null;
  bestAsk: number | null;
}

export function readTopOfBook(): BookSnapshot {
  const book = document.querySelector(SEL.book);
  if (!book) return { bestBid: null, bestAsk: null };

  const topRow = book.querySelector(SEL.bookRow);
  if (!topRow) return { bestBid: null, bestAsk: null };

  const buyEl = topRow.querySelector(SEL.bookPriceBuy);
  const sellEl = topRow.querySelector(SEL.bookPriceSell);

  return {
    bestBid: parseSv(stripMmMarker(buyEl?.textContent)),
    bestAsk: parseSv(stripMmMarker(sellEl?.textContent)),
  };
}

// Avanza suffixes "*" on Market-Maker-quoted prices; strip before parseSv.
function stripMmMarker(input: string | null | undefined): string | null {
  if (input == null) return null;
  return input.replace(/\*/g, "");
}

export interface BookObserver {
  stop(): void;
}

// Observes the order-depth subtree and emits a debounced snapshot whenever
// the visible book changes. Avanza repaints prices on every WebSocket tick;
// 30ms debounce coalesces a burst into one update without adding visible lag.
export function observeTopOfBook(
  cb: (snapshot: BookSnapshot) => void,
  debounceMs = 30,
): BookObserver {
  let mo: MutationObserver | null = null;
  let pending = 0;

  function emit() {
    cb(readTopOfBook());
  }

  function schedule() {
    if (pending) return;
    pending = window.setTimeout(() => {
      pending = 0;
      emit();
    }, debounceMs);
  }

  function attach() {
    const book = document.querySelector(SEL.book);
    if (!book) return false;
    mo = new MutationObserver(schedule);
    mo.observe(book, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    return true;
  }

  // The book element may not exist yet when the panel first opens; retry on
  // the document until it appears, then attach the focused observer.
  if (!attach()) {
    const bootMo = new MutationObserver(() => {
      if (attach()) {
        bootMo.disconnect();
        emit();
      }
    });
    bootMo.observe(document.body, { childList: true, subtree: true });

    return {
      stop() {
        bootMo.disconnect();
        if (mo) mo.disconnect();
        if (pending) {
          clearTimeout(pending);
          pending = 0;
        }
      },
    };
  }

  emit();

  return {
    stop() {
      if (mo) mo.disconnect();
      if (pending) {
        clearTimeout(pending);
        pending = 0;
      }
    },
  };
}
