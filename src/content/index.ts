import { mountToggleWidget } from "./toggle-widget";

async function main() {
  await mountToggleWidget();
  console.log("[take-it] content script loaded");
}

void main();
