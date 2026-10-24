import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { unlockSounds } from '../audio';
import { CartoonBackground } from '../components/CartoonBackground';
import { ConfettiBurst } from '../components/ConfettiBurst';
import { GameBoard, type BoardCard } from '../components/GameBoard';
import { MemojiButton } from '../components/MemojiButton';
import { ResultsOverlay } from '../components/ResultsOverlay';
import { ScoreBar } from '../components/ScoreBar';
import type { Celebration, RoundResult } from '../game/useMemoryGame';
import { spacing } from '../theme';

type Props = {
  cards: BoardCard[];
  elapsedMs: number;
  firstTryCards: number;
  games: number;
  onCardPress: (id: string) => void;
  onCancel: () => void;
  onPlayAgain: () => void;
  boardDisabled?: boolean;
  fontsLoaded?: boolean;
  celebration?: Celebration | null;
  onCelebrationDone?: () => void;
  result?: RoundResult | null;
  flipDelayById?: Record<string, number>;
  dealKey?: number;
};

function formatTime(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function GameScreen({
  cards,
  elapsedMs,
  firstTryCards,
  games,
  onCardPress,
  onCancel,
  onPlayAgain,
  boardDisabled = false,
  fontsLoaded = false,
  celebration = null,
  onCelebrationDone,
  result = null,
  flipDelayById = {},
  dealKey = 0,
}: Props) {
  const insets = useSafeAreaInsets();
  const timeLabel = formatTime(elapsedMs);

  return (
    <View style={styles.root}>
      <CartoonBackground />
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + spacing.sm,
            paddingBottom: insets.bottom + spacing.md,
          },
        ]}
      >
        <ScoreBar
          timeLabel={timeLabel}
          firstTryCards={firstTryCards}
          games={games}
        />

        <View style={styles.boardWrap}>
          <GameBoard
            cards={cards}
            onCardPress={onCardPress}
            disabled={boardDisabled}
            flipDelayById={flipDelayById}
            partyKey={celebration?.kind === 'board' ? celebration.id : 0}
            dealKey={dealKey}
          />
        </View>

        <MemojiButton
          label="Cancel"
          variant="secondary"
          fontsLoaded={fontsLoaded}
          onPress={() => {
            unlockSounds();
            onCancel();
          }}
          style={styles.cancel}
        />
      </View>

      {celebration ? (
        <ConfettiBurst
          burstId={celebration.id}
          kind={celebration.kind}
          onDone={onCelebrationDone}
        />
      ) : null}

      <ResultsOverlay
        visible={result !== null}
        timeLabel={result ? formatTime(result.timeMs) : '0:00'}
        firstTryCards={result?.firstTryCards ?? 0}
        onPlayAgain={onPlayAgain}
        fontsLoaded={fontsLoaded}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  boardWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  cancel: {
    marginTop: spacing.sm,
    alignSelf: 'center',
  },
});
