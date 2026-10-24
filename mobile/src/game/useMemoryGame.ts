import { useCallback, useEffect, useRef, useState } from 'react';

import { sounds } from '../audio';
import {
  allMatched,
  bumpGame,
  bumpMiss,
  bumpPass,
  createDeck,
  evaluateSelection,
  flipCard,
  getSelectedCards,
  initialStats,
  markMatched,
  unflipCards,
} from './engine';
import type {
  CardId,
  CardState,
  Difficulty,
  GamePhase,
  GameStats,
} from './types';

const SINGLE_FLIP_MS = 2000;
const MISMATCH_FLIP_MS = 500;
const PAIR_CELEBRATION_MS = 700;
const FIRST_TRY_CELEBRATION_MS = 950;
/** Delay between cards when waving back to reverse (top-left → bottom-right) */
const STAGGER_FLIP_MS = 70;
const FLIP_DURATION_MS = 500;
/** Deal-in stagger + duration (must match MemoryCard) */
const DEAL_STAGGER_MS = 55;
const DEAL_DURATION_MS = 420;

export type CelebrationKind = 'pair' | 'firstTry' | 'board';

export type Celebration = {
  id: number;
  kind: CelebrationKind;
};

export type RoundResult = {
  timeMs: number;
  firstTryCards: number;
};

export type UseMemoryGameResult = {
  screen: GamePhase;
  cards: CardState[];
  stats: GameStats;
  /** Cards matched on a first-try (virgin card) pair this round. */
  firstTryCards: number;
  /** Elapsed ms since first flip (0 until then; live while playing). */
  elapsedMs: number;
  /** Frozen result after clearing the board; null while playing. */
  result: RoundResult | null;
  busy: boolean;
  celebration: Celebration | null;
  /** Per-card flip delay for stagger animations (by board index). */
  flipDelayById: Record<string, number>;
  /** Increments each fresh deal — drives deal-in animation. */
  dealKey: number;
  /** Active glyph difficulty for the current / next round. */
  difficulty: Difficulty;
  setDifficulty: (difficulty: Difficulty) => void;
  startGame: () => void;
  cancelGame: () => void;
  playAgain: () => void;
  onCardPress: (id: CardId) => void;
  /** Call when confetti finishes — reveals results after a board win. */
  onCelebrationDone: () => void;
};

function formatDelays(
  cards: CardState[],
  staggerMs: number,
): Record<string, number> {
  const delays: Record<string, number> = {};
  cards.forEach((card, index) => {
    delays[card.id] = index * staggerMs;
  });
  return delays;
}

export function useMemoryGame(): UseMemoryGameResult {
  const [screen, setScreen] = useState<GamePhase>('menu');
  const [cards, setCards] = useState<CardState[]>([]);
  const [stats, setStats] = useState<GameStats>(initialStats);
  const [firstTryCards, setFirstTryCards] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [result, setResult] = useState<RoundResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const [flipDelayById, setFlipDelayById] = useState<Record<string, number>>(
    {},
  );
  const [dealKey, setDealKey] = useState(0);
  const [difficulty, setDifficultyState] = useState<Difficulty>('easy');
  /** Bumps when the timer should start ticking (first flip). */
  const [timerEpoch, setTimerEpoch] = useState(0);

  const cardsRef = useRef(cards);
  const busyRef = useRef(busy);
  const firstTryCardsRef = useRef(0);
  const difficultyRef = useRef<Difficulty>(difficulty);
  cardsRef.current = cards;
  busyRef.current = busy;
  firstTryCardsRef.current = firstTryCards;
  difficultyRef.current = difficulty;

  const setDifficulty = useCallback((next: Difficulty) => {
    setDifficultyState(next);
    difficultyRef.current = next;
  }, []);

  const roundStartedAtRef = useRef<number | null>(null);
  const pendingResultRef = useRef<RoundResult | null>(null);
  const celebrationSeq = useRef(0);
  const dealSeq = useRef(0);
  /** Cards the player has already flipped at least once this round. */
  const touchedRef = useRef<Set<CardId>>(new Set());
  /** Whether the first card of the current selection was virgin when flipped. */
  const selectionHasVirginRef = useRef(false);
  const flipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const celebrateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const staggerTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearFlipTimeout = useCallback(() => {
    if (flipTimeoutRef.current !== null) {
      clearTimeout(flipTimeoutRef.current);
      flipTimeoutRef.current = null;
    }
  }, []);

  const clearCelebrateTimeout = useCallback(() => {
    if (celebrateTimeoutRef.current !== null) {
      clearTimeout(celebrateTimeoutRef.current);
      celebrateTimeoutRef.current = null;
    }
  }, []);

  const clearStaggerTimeouts = useCallback(() => {
    staggerTimeoutsRef.current.forEach(clearTimeout);
    staggerTimeoutsRef.current = [];
  }, []);

  const clearAllTimeouts = useCallback(() => {
    clearFlipTimeout();
    clearCelebrateTimeout();
    clearStaggerTimeouts();
  }, [clearCelebrateTimeout, clearFlipTimeout, clearStaggerTimeouts]);

  useEffect(() => () => clearAllTimeouts(), [clearAllTimeouts]);

  // Live timer — starts only after the first card flip (timerEpoch > 0).
  useEffect(() => {
    if (
      screen !== 'playing' ||
      result !== null ||
      roundStartedAtRef.current === null
    ) {
      return;
    }
    const tick = () => {
      if (roundStartedAtRef.current !== null) {
        setElapsedMs(Date.now() - roundStartedAtRef.current);
      }
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [screen, result, timerEpoch]);

  const fireCelebration = useCallback((kind: CelebrationKind) => {
    celebrationSeq.current += 1;
    setCelebration({ id: celebrationSeq.current, kind });
  }, []);

  const onCelebrationDone = useCallback(() => {
    setCelebration(null);
    // Reveal summary only after board confetti finishes
    if (pendingResultRef.current) {
      setResult(pendingResultRef.current);
      pendingResultRef.current = null;
      sounds.results();
    }
  }, []);

  const resetRoundStats = useCallback(() => {
    roundStartedAtRef.current = null;
    pendingResultRef.current = null;
    touchedRef.current = new Set();
    selectionHasVirginRef.current = false;
    setElapsedMs(0);
    setFirstTryCards(0);
    firstTryCardsRef.current = 0;
    setResult(null);
    setCelebration(null);
  }, []);

  /**
   * Fresh board from the menu — deal-in animation only here.
   */
  const beginRoundWithDeal = useCallback(() => {
    const deck = createDeck(8, difficultyRef.current);
    resetRoundStats();
    setFlipDelayById({});
    setCards(deck);
    dealSeq.current += 1;
    setDealKey(dealSeq.current);

    const dealMs =
      Math.max(0, deck.length - 1) * DEAL_STAGGER_MS + DEAL_DURATION_MS + 40;
    setBusy(true);
    const unlock = setTimeout(() => {
      setBusy(false);
    }, dealMs);
    staggerTimeoutsRef.current.push(unlock);
  }, [resetRoundStats]);

  const scheduleUnflip = useCallback(
    (ids: CardId[], delayMs: number) => {
      clearFlipTimeout();
      flipTimeoutRef.current = setTimeout(() => {
        flipTimeoutRef.current = null;
        setCards((prev) => unflipCards(prev, ids));
        setBusy(false);
      }, delayMs);
    },
    [clearFlipTimeout],
  );

  const startGame = useCallback(() => {
    clearAllTimeouts();
    sounds.playStart();
    beginRoundWithDeal();
    setScreen('playing');
  }, [beginRoundWithDeal, clearAllTimeouts]);

  const cancelGame = useCallback(() => {
    clearAllTimeouts();
    sounds.cancel();
    setBusy(false);
    setCelebration(null);
    pendingResultRef.current = null;
    setResult(null);
    setCards([]);
    setFlipDelayById({});
    setDealKey(0);
    roundStartedAtRef.current = null;
    setScreen('menu');
  }, [clearAllTimeouts]);

  /**
   * Play again: wave-close to reverse (TL→BR), then reshuffle in place.
   * Keeps card identities so React does not remount — no second deal-in.
   * Deal-in is reserved for startGame from the menu.
   */
  const playAgain = useCallback(() => {
    clearAllTimeouts();
    sounds.playAgain();
    pendingResultRef.current = null;
    setResult(null);
    setCelebration(null);
    setBusy(true);
    // Ensure dealKey stays inert so remounts (if any) stay instant
    setDealKey(0);

    const current = cardsRef.current;
    setFlipDelayById(formatDelays(current, STAGGER_FLIP_MS));
    setCards((prev) =>
      prev.map((c) => ({ ...c, flipped: false, matched: false })),
    );

    const waveMs =
      Math.max(0, current.length - 1) * STAGGER_FLIP_MS +
      FLIP_DURATION_MS +
      80;

    const done = setTimeout(() => {
      const fresh = createDeck(8, difficultyRef.current);
      resetRoundStats();
      setFlipDelayById({});
      // Preserve slot ids → MemoryCard instances stay mounted (no deal-in)
      setCards((prev) =>
        prev.map((card, index) => ({
          id: card.id,
          emoji: fresh[index]?.emoji ?? card.emoji,
          flipped: false,
          matched: false,
        })),
      );
      setBusy(false);
    }, waveMs);
    staggerTimeoutsRef.current.push(done);
  }, [clearAllTimeouts, resetRoundStats]);

  const ensureTimerStarted = useCallback(() => {
    if (roundStartedAtRef.current !== null) {
      return;
    }
    roundStartedAtRef.current = Date.now();
    setElapsedMs(0);
    setTimerEpoch((n) => n + 1);
  }, []);

  const onCardPress = useCallback(
    (id: CardId) => {
      if (
        screen !== 'playing' ||
        busyRef.current ||
        result !== null ||
        pendingResultRef.current !== null
      ) {
        return;
      }

      const prev = cardsRef.current;
      const target = prev.find((card) => card.id === id);
      if (!target || target.flipped || target.matched) {
        return;
      }

      if (getSelectedCards(prev).length >= 2) {
        return;
      }

      ensureTimerStarted();

      const isVirgin = !touchedRef.current.has(id);
      touchedRef.current.add(id);

      const next = flipCard(prev, id);
      const { match, selectedIds } = evaluateSelection(next);

      if (selectedIds.length === 1) {
        selectionHasVirginRef.current = isVirgin;
        sounds.flip();
        setCards(next);
        scheduleUnflip(selectedIds, SINGLE_FLIP_MS);
        return;
      }

      if (selectedIds.length !== 2) {
        sounds.flip();
        setCards(next);
        return;
      }

      clearFlipTimeout();
      sounds.flip();

      if (match) {
        const isFirstTry = selectionHasVirginRef.current || isVirgin;
        selectionHasVirginRef.current = false;
        const matchedCards = markMatched(next, selectedIds);
        setCards(matchedCards);
        setStats((s) => bumpPass(s));

        let nextFirstTry = firstTryCardsRef.current;
        if (isFirstTry) {
          nextFirstTry += selectedIds.length;
          firstTryCardsRef.current = nextFirstTry;
          setFirstTryCards(nextFirstTry);
        }

        if (allMatched(matchedCards)) {
          setBusy(true);
          setStats((s) => bumpGame(s));
          const timeMs =
            roundStartedAtRef.current !== null
              ? Date.now() - roundStartedAtRef.current
              : elapsedMs;
          setElapsedMs(timeMs);
          roundStartedAtRef.current = null;
          pendingResultRef.current = {
            timeMs,
            firstTryCards: nextFirstTry,
          };
          sounds.boardWin();
          fireCelebration('board');
        } else if (isFirstTry) {
          sounds.firstTry();
          fireCelebration('firstTry');
          setBusy(true);
          clearCelebrateTimeout();
          celebrateTimeoutRef.current = setTimeout(() => {
            celebrateTimeoutRef.current = null;
            setBusy(false);
          }, FIRST_TRY_CELEBRATION_MS);
        } else {
          sounds.match();
          fireCelebration('pair');
          setBusy(true);
          clearCelebrateTimeout();
          celebrateTimeoutRef.current = setTimeout(() => {
            celebrateTimeoutRef.current = null;
            setBusy(false);
          }, PAIR_CELEBRATION_MS);
        }
        return;
      }

      selectionHasVirginRef.current = false;
      sounds.mismatch();
      setCards(next);
      setBusy(true);
      setStats((s) => bumpMiss(s));
      scheduleUnflip(selectedIds, MISMATCH_FLIP_MS);
    },
    [
      clearCelebrateTimeout,
      clearFlipTimeout,
      elapsedMs,
      ensureTimerStarted,
      fireCelebration,
      result,
      scheduleUnflip,
      screen,
    ],
  );

  return {
    screen,
    cards,
    stats,
    firstTryCards,
    elapsedMs,
    result,
    busy,
    celebration,
    flipDelayById,
    dealKey,
    difficulty,
    setDifficulty,
    startGame,
    cancelGame,
    playAgain,
    onCardPress,
    onCelebrationDone,
  };
}
