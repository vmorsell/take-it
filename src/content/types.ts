export type Side = "buy" | "sell";

export interface PanelHandle {
  priceInput: HTMLInputElement;
  side: Side;
}
