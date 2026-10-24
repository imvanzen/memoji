import type { Difficulty } from './types';

/**
 * Per-difficulty glyph pools (at least 8 unique each for a 4×4 board).
 *
 * easy     — distinct positive faces, easy to tell apart
 * medium   — positive faces that look related but still differ
 * hard     — nearly identical faces / micro-expressions
 * extreme  — similar-looking Chinese characters (汉字)
 */

/** Clearly different happy faces. */
export const EASY_EMOJIS = [
  '😀',
  '😎',
  '🤩',
  '🥳',
  '😍',
  '🤠',
  '😇',
  '🤓',
  '🤗',
  '🤑',
  '😺',
  '👻',
] as const;

/** Positive faces that share a similar smile silhouette. */
export const MEDIUM_EMOJIS = [
  '😊',
  '🙂',
  '☺️',
  '😌',
  '😋',
  '😉',
  '😄',
  '😁',
  '😃',
  '😆',
  '😅',
  '🤭',
] as const;

/** Very similar / easy-to-confuse faces. */
export const HARD_EMOJIS = [
  '😐',
  '😑',
  '😶',
  '😏',
  '😒',
  '🙄',
  '😬',
  '😯',
  '😮',
  '😲',
  '😳',
  '🫣',
] as const;

/** Confusable Chinese characters — same stroke families. */
export const EXTREME_EMOJIS = [
  '未',
  '末',
  '木',
  '本',
  '天',
  '夫',
  '土',
  '士',
  '日',
  '曰',
  '己',
  '已',
  '白',
  '百',
  '人',
  '入',
] as const;

export const DIFFICULTY_POOLS: Record<Difficulty, readonly string[]> = {
  easy: EASY_EMOJIS,
  medium: MEDIUM_EMOJIS,
  hard: HARD_EMOJIS,
  extreme: EXTREME_EMOJIS,
};

export const DIFFICULTY_ORDER: Difficulty[] = [
  'easy',
  'medium',
  'hard',
  'extreme',
];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Łatwy',
  medium: 'Średni',
  hard: 'Trudny',
  extreme: 'Extremalny',
};

export const DIFFICULTY_HINTS: Record<Difficulty, string> = {
  easy: 'Wyraźne buźki',
  medium: 'Podobne buźki',
  hard: 'Prawie takie same',
  extreme: 'Chińskie znaczki',
};

/** Preview glyphs shown on the difficulty chip. */
export const DIFFICULTY_PREVIEW: Record<Difficulty, string> = {
  easy: '😀😎',
  medium: '😊🙂',
  hard: '😐😑',
  extreme: '未末',
};

/** @deprecated Prefer DIFFICULTY_POOLS — kept for older imports/tests. */
export const EMOJI_CHARS: string[] = [...EASY_EMOJIS];

export function poolForDifficulty(difficulty: Difficulty): readonly string[] {
  return DIFFICULTY_POOLS[difficulty];
}
