import { SEL } from "./selectors";
import type { Side } from "./types";

// URL is the most reliable signal: /handla/order.html/kop/<id> for buy and
// /handla/order.html/salj/<id> for sell. The submit button's
// data-mint-button-theme is a fallback for cases where the URL hasn't
// updated yet (e.g. after switchSideButton is clicked).
export function resolveSide(): Side | null {
  const fromUrl = sideFromUrl(location.pathname);
  if (fromUrl) return fromUrl;
  return sideFromSubmitButton();
}

function sideFromUrl(pathname: string): Side | null {
  const match = pathname.match(/\/handla\/order\.html\/(kop|salj)\b/);
  if (!match) return null;
  return match[1] === "kop" ? "buy" : "sell";
}

function sideFromSubmitButton(): Side | null {
  const btn = document.querySelector<HTMLButtonElement>(SEL.submitBtn);
  if (!btn) return null;
  const theme = btn.dataset["mintButtonTheme"];
  if (theme === "buy") return "buy";
  if (theme === "sell") return "sell";
  return null;
}
