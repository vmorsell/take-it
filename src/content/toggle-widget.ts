import { getEnabled, onEnabledChanged, setEnabled } from "./storage";

const HOST_ID = "take-it-toggle-host";

export type WidgetStatus =
  | { kind: "off" }
  | { kind: "waiting" }
  | { kind: "no-book" }
  | { kind: "syncing"; side: "buy" | "sell"; price: string };

export interface ToggleWidget {
  setStatus(status: WidgetStatus): void;
  destroy(): void;
}

export async function mountToggleWidget(): Promise<ToggleWidget> {
  const existing = document.getElementById(HOST_ID);
  if (existing) existing.remove();

  const host = document.createElement("div");
  host.id = HOST_ID;
  const root = host.attachShadow({ mode: "closed" });

  const style = document.createElement("style");
  style.textContent = CSS;

  const wrapper = document.createElement("div");
  wrapper.className = "wrapper";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "toggle";
  button.setAttribute("aria-pressed", "false");

  const label = document.createElement("span");
  label.className = "label";
  label.textContent = "OFF";

  button.appendChild(label);
  wrapper.appendChild(button);
  root.append(style, wrapper);
  document.documentElement.appendChild(host);

  let enabled = await getEnabled();
  let currentStatus: WidgetStatus = enabled ? { kind: "waiting" } : { kind: "off" };

  function render() {
    button.setAttribute("aria-pressed", enabled ? "true" : "false");
    button.dataset["state"] = stateClass(currentStatus);
    label.textContent = renderLabel(currentStatus);
  }

  button.addEventListener("click", async () => {
    enabled = !enabled;
    await setEnabled(enabled);
    // currentStatus is updated by orchestrator; reflect immediate UI feedback:
    if (!enabled) currentStatus = { kind: "off" };
    else if (currentStatus.kind === "off") currentStatus = { kind: "waiting" };
    render();
  });

  const offStorage = onEnabledChanged((next) => {
    if (next === enabled) return;
    enabled = next;
    if (!enabled) currentStatus = { kind: "off" };
    else if (currentStatus.kind === "off") currentStatus = { kind: "waiting" };
    render();
  });

  render();

  return {
    setStatus(status) {
      currentStatus = status;
      render();
    },
    destroy() {
      offStorage();
      host.remove();
    },
  };
}

function stateClass(s: WidgetStatus): string {
  switch (s.kind) {
    case "off":
      return "off";
    case "waiting":
      return "waiting";
    case "no-book":
      return "warn";
    case "syncing":
      return s.side === "buy" ? "buy" : "sell";
  }
}

function renderLabel(s: WidgetStatus): string {
  switch (s.kind) {
    case "off":
      return "OFF";
    case "waiting":
      return "ON · waiting";
    case "no-book":
      return "ON · no book";
    case "syncing":
      return `ON · ${s.side.toUpperCase()} · ${s.price}`;
  }
}

const CSS = `
  :host { all: initial; }
  .wrapper {
    position: fixed;
    right: 16px;
    bottom: 16px;
    z-index: 2147483647;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  .toggle {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-radius: 999px;
    border: 1px solid rgba(0,0,0,0.15);
    background: #2b2b2b;
    color: #ddd;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.02em;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(0,0,0,0.18);
    transition: background-color 0.12s ease, color 0.12s ease;
  }
  .toggle:hover { filter: brightness(1.1); }
  .toggle[data-state="off"] { background: #2b2b2b; color: #ddd; }
  .toggle[data-state="waiting"] { background: #4a4a00; color: #ffeb88; }
  .toggle[data-state="warn"] { background: #5a2a00; color: #ffc599; }
  .toggle[data-state="buy"] { background: #0b6e2c; color: #d6ffd9; }
  .toggle[data-state="sell"] { background: #8a0e2c; color: #ffd6df; }
  .label::before {
    content: "";
    display: inline-block;
    width: 8px;
    height: 8px;
    margin-right: 6px;
    border-radius: 50%;
    background: currentColor;
    vertical-align: middle;
    opacity: 0.85;
  }
`;
