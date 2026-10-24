/**
 * Lightweight engine smoke test — run with:
 *   npx tsx src/game/engine.test.ts
 */
import {
  allMatched,
  createDeck,
  evaluateSelection,
  flipCard,
  getSelectedCards,
  markMatched,
  unflipCards,
} from './engine';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

const deck = createDeck(8, 'easy');
assert(deck.length === 16, 'deck should have 16 cards');
assert(new Set(deck.map((c) => c.id)).size === 16, 'ids unique');

const counts = new Map<string, number>();
for (const card of deck) {
  counts.set(card.emoji, (counts.get(card.emoji) ?? 0) + 1);
}
assert(
  [...counts.values()].every((n) => n === 2),
  'each emoji appears exactly twice',
);
assert(counts.size === 8, 'eight unique emojis');

const extreme = createDeck(8, 'extreme');
assert(extreme.length === 16, 'extreme deck has 16 cards');
assert(
  extreme.every((c) => c.emoji.length >= 1),
  'extreme glyphs present',
);

const first = deck[0]!;
const pair = deck.find((c) => c.emoji === first.emoji && c.id !== first.id)!;

let state = flipCard(deck, first.id);
state = flipCard(state, pair.id);
const evalMatch = evaluateSelection(state);
assert(evalMatch.match === true, 'pair should match');
state = markMatched(state, evalMatch.selectedIds);
assert(state.filter((c) => c.matched).length === 2, 'two matched');

const other = state.find((c) => !c.matched)!;
const mismatch = state.find(
  (c) => !c.matched && c.emoji !== other.emoji && c.id !== other.id,
)!;
state = flipCard(state, other.id);
state = flipCard(state, mismatch.id);
const evalMiss = evaluateSelection(state);
assert(evalMiss.match === false, 'different emojis should miss');
state = unflipCards(state, evalMiss.selectedIds);
assert(getSelectedCards(state).length === 0, 'unflip clears selection');

let win = createDeck(2);
for (const card of win) {
  win = flipCard(win, card.id);
}
const allIds = win.map((c) => c.id);
win = markMatched(win, allIds);
assert(allMatched(win), 'all matched');

console.log('engine.test.ts: all assertions passed');
