import { observeOrderPanel } from "./order-panel";
import { mountToggleWidget } from "./toggle-widget";

async function main() {
  await mountToggleWidget();

  observeOrderPanel({
    onOpen({ side }) {
      console.log("[take-it] panel open", { side });
    },
    onClose() {
      console.log("[take-it] panel close");
    },
    onSideChange(side) {
      console.log("[take-it] side change", { side });
    },
  });

  console.log("[take-it] content script loaded");
}

void main();
