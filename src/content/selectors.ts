// Anchored to Avanza's data-e2e test hooks and custom Angular tag names
// (aza-*). Both are far more stable than the obfuscated _ngcontent-* class
// names that surround them. If Avanza redesigns the order page, this is the
// single point of update.
export const SEL = {
  panel: "aza-order-entry",
  form: "aza-order-form",
  priceInput: 'input[data-e2e="inputPrice"]',
  submitBtn: 'button[data-e2e="orderButton"]',
  sideSwitchBtn: 'button[data-e2e="switchSideButton"]',
  book: 'aza-order-depth[data-e2e="orderOrderDepthPanel"]',
  bookRow: 'div[role="row"].level',
  bookPriceBuy: ".price.buy",
  bookPriceSell: ".price.sell",
} as const;
