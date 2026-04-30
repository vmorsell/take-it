import { observeOrderPanel } from "./order-panel";
import { observeTopOfBook } from "./order-book";
import { mountToggleWidget } from "./toggle-widget";
import type { BookObserver } from "./order-book";

async function main() {
  await mountToggleWidget();

  let bookObs: BookObserver | null = null;

  observeOrderPanel({
    onOpen({ side }) {
      console.log("[take-it] panel open", { side });
      bookObs?.stop();
      bookObs = observeTopOfBook((snapshot) => {
        console.log("[take-it] book", snapshot);
      });
    },
    onClose() {
      console.log("[take-it] panel close");
      bookObs?.stop();
      bookObs = null;
    },
    onSideChange(side) {
      console.log("[take-it] side change", { side });
    },
  });

  console.log("[take-it] content script loaded");
}

void main();
