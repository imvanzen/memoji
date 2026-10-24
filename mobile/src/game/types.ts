export type CardId = string;

export type CardState = {
  id: CardId;
  emoji: string;
  flipped: boolean;
  matched: boolean;
};

export type GameStats = {
  games: number;
  passes: number;
  misses: number;
};

export type GamePhase = 'menu' | 'playing';

/** Board glyph difficulty — selected on the menu before Play. */
export type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme';
