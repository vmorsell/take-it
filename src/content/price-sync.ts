import { decimalsOfSv, formatSv } from "./num-sv";

// Angular reactive forms register an `input` event listener on the
// underlying DOM input. Setting `.value` directly bypasses that listener
// because React/Angular cache the previous value on the element. The
// canonical workaround: call the prototype's value setter so the framework
// notices the change, then dispatch the events it expects.
const nativeInputSetter =
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set ?? null;

export function setPrice(input: HTMLInputElement, value: number): boolean {
  if (!nativeInputSetter) return false;
  if (document.activeElement === input) return false;
  if (!Number.isFinite(value)) return false;

  const decimals = decimalsOfSv(input.value) ?? 2;
  const formatted = formatSv(value, decimals);
  if (input.value === formatted) return false;

  nativeInputSetter.call(input, formatted);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}
