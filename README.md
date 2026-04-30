# take-it

Chrome extension that continuously syncs the price input on Avanza order
forms to the top of the opposite side of the order book. Click submit and
the limit order fills marketable.

> Buy panels track the **best ask** (lowest seller). Sell panels track the
> **best bid** (highest buyer). The extension never auto-submits.

## Install

```sh
npm install
npm run build
```

Then load `dist/` as an unpacked extension:

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `dist/` folder.

After any code change, run `npm run build` and click the refresh arrow on
the extension card.

## Use

1. Log in to <https://www.avanza.se>.
2. Open a buy or sell panel on any instrument.
3. A pill appears in the bottom-right corner. Default state: **OFF**.
4. Click the pill to toggle. While ON, the price input chases top-of-book.
5. Click submit when you want to fill.

The pill colour reflects the active side: green for buy, red for sell. A
glance always tells you whether automation is driving the price and which
direction it's pointing.

If you start typing in the price box, the extension pauses writes until
you blur the field — it won't fight you while you're typing.

## State legend

| Pill | Meaning |
|------|---------|
| `OFF` | Extension disabled. The price input is not being touched. |
| `ON · waiting` | Enabled, but no order panel is currently open. |
| `ON · no book` | Order book is empty or one-sided; no target price available. |
| `ON · BUY · 65,95` | Buy panel; tracking best ask. |
| `ON · SELL · 65,91` | Sell panel; tracking best bid. |

## Safety notes

- Only the **price** field is touched. Quantity, order type, and validity
  are left alone.
- The extension never auto-submits. Pressing the submit button is always a
  deliberate user action.
- State is OFF by default and persisted in `chrome.storage.local`. Toggle
  flips propagate across all open Avanza tabs in the same browser profile.
- This is a personal-use tool. There are no automated tests; verification
  is manual.

## When Avanza redesigns the page

All DOM lookups are anchored to Avanza's own `data-e2e` test hooks and
custom `aza-*` Angular tag names, both of which outlast cosmetic
redesigns. If Avanza ships a breaking change, every selector is in
[`src/content/selectors.ts`](src/content/selectors.ts).

The pill's `ON · waiting` and `ON · no book` states surface selector
breakage immediately — no silent failures.

## Project layout

```
src/content/
├── index.ts          # entry: orchestrates the engine
├── storage.ts        # chrome.storage.local wrapper
├── selectors.ts      # every data-e2e and aza-* hook
├── side.ts           # buy|sell from URL + button theme
├── order-panel.ts    # MutationObserver: panel open/close, side change
├── order-book.ts     # read + observe top-of-book
├── price-sync.ts     # Angular-aware native input setter
├── num-sv.ts         # Swedish-locale parse/format
├── toggle-widget.ts  # floating on/off pill (Shadow DOM)
└── types.ts          # shared types
```
