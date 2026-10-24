import { poolForDifficulty } from './emojis';
import type { CardId, CardState, Difficulty, GameStats } from './types';

let nextCardSeq = 0;

function createCardId(): CardId {
  nextCardSeq += 1;
  return `card-${nextCardSeq}`;
}

/** Fisher–Yates shuffle; returns a new array (does not mutate input). */
export function shuffle<T>(items: readonly T[]): T[] {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = result[i]!;
    result[i] = result[j]!;
    result[j] = tmp;
  }
  return result;
}

function pickUniqueFromPool(pool: readonly string[], count: number): string[] {
  if (count > pool.length) {
    throw new Error(
      `Need ${count} unique glyphs but pool only has ${pool.length}`,
    );
  }
  return shuffle(pool).slice(0, count);
}

/**
 * Build a shuffled deck: `pairCount` unique glyphs from the difficulty pool,
 * each duplicated into a pair. Default 8 pairs → 16 cards (4×4).
 */
export function createDeck(
  pairCount = 8,
  difficulty: Difficulty = 'easy',
): CardState[] {
  const pool = poolForDifficulty(difficulty);
  const emojis = pickUniqueFromPool(pool, pairCount);
  const cards: CardState[] = [];

  for (const emoji of emojis) {
    cards.push(
      { id: createCardId(), emoji, flipped: false, matched: false },
      { id: createCardId(), emoji, flipped: false, matched: false },
    );
  }

  return shuffle(cards);
}

/** Flip a single face-down, unmatched card face-up. Idempotent for already flipped/matched. */
export function flipCard(cards: readonly CardState[], cardId: CardId): CardState[] {
  return cards.map((card) => {
    if (card.id !== cardId || card.flipped || card.matched) {
      return card;
    }
    return { ...card, flipped: true };
  });
}

/** Face-down the given cards (used after timeout / mismatch). Leaves matched cards alone. */
export function unflipCards(
  cards: readonly CardState[],
  cardIds: readonly CardId[],
): CardState[] {
  const idSet = new Set(cardIds);
  return cards.map((card) => {
    if (!idSet.has(card.id) || card.matched) {
      return card;
    }
    return { ...card, flipped: false };
  });
}

/** Mark selected cards as matched (stay face-up). */
export function markMatched(
  cards: readonly CardState[],
  cardIds: readonly CardId[],
): CardState[] {
  const idSet = new Set(cardIds);
  return cards.map((card) => {
    if (!idSet.has(card.id)) {
      return card;
    }
    return { ...card, flipped: true, matched: true };
  });
}

/** Currently selected = flipped but not yet matched. */
export function getSelectedCards(cards: readonly CardState[]): CardState[] {
  return cards.filter((card) => card.flipped && !card.matched);
}

/**
 * Evaluate the current selection.
 * `match` is true only when exactly two selected cards share the same emoji.
 */
export function evaluateSelection(cards: readonly CardState[]): {
  match: boolean;
  selectedIds: string[];
} {
  const selected = getSelectedCards(cards);
  const selectedIds = selected.map((card) => card.id);

  if (selected.length !== 2) {
    return { match: false, selectedIds };
  }

  return {
    match: selected[0]!.emoji === selected[1]!.emoji,
    selectedIds,
  };
}

export function allMatched(cards: readonly CardState[]): boolean {
  return cards.length > 0 && cards.every((card) => card.matched);
}

export function initialStats(): GameStats {
  return { games: 0, passes: 0, misses: 0 };
}

export function bumpPass(stats: GameStats): GameStats {
  return { ...stats, passes: stats.passes + 1 };
}

export function bumpMiss(stats: GameStats): GameStats {
  return { ...stats, misses: stats.misses + 1 };
}

export function bumpGame(stats: GameStats): GameStats {
  return { ...stats, games: stats.games + 1 };
}
