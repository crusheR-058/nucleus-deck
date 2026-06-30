// Shared 52-card deck helpers for the casino card games.

export type Suit = "♠" | "♥" | "♦" | "♣";
export interface Card {
  rank: string;
  suit: Suit;
}

export const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
export const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];

export function freshDeck(): Card[] {
  const d: Card[] = [];
  for (const s of SUITS) for (const r of RANKS) d.push({ rank: r, suit: s });
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

/** A=0 (low) … K=12 (high). */
export const rankIndex = (r: string) => RANKS.indexOf(r);
