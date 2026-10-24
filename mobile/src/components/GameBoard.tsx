import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { MemoryCard } from './MemoryCard';

export type BoardCard = {
  id: string;
  emoji: string;
  flipped: boolean;
  matched: boolean;
};

type Props = {
  cards: BoardCard[];
  onCardPress: (id: string) => void;
  disabled?: boolean;
  flipDelayById?: Record<string, number>;
  /** Board-win party dance key (0 = idle) */
  partyKey?: number;
  /** Fresh-deal key — triggers staggered deal-in */
  dealKey?: number;
};

/** Original board: 4×4, cell 128px, gutter 10px → ratio 10/128 */
const COLS = 4;
const ROWS = 4;
const GUTTER_RATIO = 10 / 128;

export function GameBoard({
  cards,
  onCardPress,
  disabled = false,
  flipDelayById = {},
  partyKey = 0,
  dealKey = 0,
}: Props) {
  const { width: screenW, height: screenH } = useWindowDimensions();

  const maxBoard = Math.min(screenW - 32, screenH * 0.62, 560);
  const cell = Math.floor(maxBoard / (COLS + (COLS - 1) * GUTTER_RATIO));
  const gap = Math.max(6, Math.round(cell * GUTTER_RATIO));
  const boardSize = cell * COLS + gap * (COLS - 1);

  const grid = Array.from({ length: ROWS * COLS }, (_, i) => cards[i]);

  return (
    <View style={[styles.board, { width: boardSize, height: boardSize }]}>
      {grid.map((card, index) => {
        if (!card) {
          return (
            <View
              key={`empty-${index}`}
              style={{
                width: cell,
                height: cell,
                marginRight: gap,
                marginBottom: gap,
              }}
            />
          );
        }
        const col = index % COLS;
        const row = Math.floor(index / COLS);
        return (
          <View
            key={card.id}
            style={{
              width: cell,
              height: cell,
              marginRight: col === COLS - 1 ? 0 : gap,
              marginBottom: row === ROWS - 1 ? 0 : gap,
            }}
          >
            <MemoryCard
              emoji={card.emoji}
              flipped={card.flipped}
              matched={card.matched}
              disabled={disabled}
              size={cell}
              flipDelayMs={flipDelayById[card.id] ?? 0}
              boardIndex={index}
              partyKey={partyKey}
              dealKey={dealKey}
              onPress={() => onCardPress(card.id)}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'visible',
  },
});
