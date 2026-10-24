import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { unlockSounds } from '../audio';
import { CartoonBackground } from '../components/CartoonBackground';
import { ConfettiBurst } from '../components/ConfettiBurst';
import { GameBoard, type BoardCard } from '../components/GameBoard';
import { MemojiButton } from '../components/MemojiButton';
import { MusicToggle } from '../components/MusicToggle';
import { ResultsOverlay } from '../components/ResultsOverlay';
import { ScoreBar } from '../components/ScoreBar';
import type { Celebration, RoundResult } from '../game/useMemoryGame';
import { spacing } from '../theme';

type Props = {
  cards: BoardCard[];
  timerStartedAt: number | null;
  finalTimeMs?: number | null;
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
  const clamped = Math.max(0, ms);
  const totalCs = Math.floor(clamped / 10);
  const cs = totalCs % 100;
  const totalSec = Math.floor(totalCs / 100);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
}

function GameScreenInner({
  cards,
  timerStartedAt,
  finalTimeMs = null,
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
        <View style={styles.topRow}>
          <View style={styles.topSpacer} />
          <MusicToggle />
        </View>

        <ScoreBar
          timerStartedAt={timerStartedAt}
          frozenMs={result?.timeMs ?? finalTimeMs}
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
        timeLabel={result ? formatTime(result.timeMs) : '0:00.00'}
        firstTryCards={result?.firstTryCards ?? 0}
        onPlayAgain={onPlayAgain}
        fontsLoaded={fontsLoaded}
      />
    </View>
  );
}

export const GameScreen = memo(GameScreenInner);

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  topRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  topSpacer: {
    flex: 1,
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
