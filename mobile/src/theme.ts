export const colors = {
  /** Soft lemon playground — echoes card reverse */
  sky: '#E8F0A8',
  skyLight: '#F4F7D4',
  mint: '#C8EBD8',
  mintDeep: '#7BC9A8',
  peach: '#FFD4B8',
  peachSoft: '#FFE8D6',
  creamWash: 'rgba(255, 255, 255, 0.52)',
  white: '#FFFFFF',
  ink: '#2C3E50',
  inkMuted: '#5A6B7D',
  /** Original .board__cell / .play-button fill (reverse) */
  cell: '#f1f2b5',
  /** Original .board__cell:hover */
  cellPressed: '#bebf8e',
  cardBack: '#f1f2b5',
  cardBackBorder: '#c5c68a',
  cardBackPattern: '#bebf8e',
  /** High-contrast avers so emoji pops off washed cartoon bg */
  cardFront: '#FFFFFF',
  cardFrontBorder: '#3d4f63',
  cardMatched: '#FFF8E7',
  cardMatchedBorder: '#2A9D8F',
  accent: '#f1f2b5',
  accentPressed: '#bebf8e',
  accentInk: '#2C3E50',
  scoreLabel: '#5A6B7D',
  scoreValue: '#2C3E50',
  cancel: '#E07A6A',
  overlay: 'rgba(255, 252, 245, 0.55)',
  /** Playground blobs — soft, toy-like, not neon */
  blobSky: 'rgba(168, 210, 120, 0.38)',
  blobMint: 'rgba(140, 210, 185, 0.36)',
  blobPeach: 'rgba(255, 180, 140, 0.34)',
  blobLemon: 'rgba(241, 242, 181, 0.55)',
  blobCoral: 'rgba(255, 160, 150, 0.32)',
  blobCream: 'rgba(255, 255, 255, 0.45)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  /** Matches circular memory cards */
  pill: 9999,
  full: 9999,
} as const;

export const typography = {
  brandSize: 56,
  titleSize: 28,
  bodySize: 16,
  scoreLabelSize: 12,
  scoreValueSize: 22,
  cardMarkSize: 28,
} as const;
