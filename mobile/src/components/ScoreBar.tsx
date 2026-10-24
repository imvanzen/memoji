import { memo, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors, radii, spacing, typography } from '../theme';

type Props = {
  /** Epoch ms when the live clock started; null until first flip. */
  timerStartedAt: number | null;
  /** When set, show this frozen time instead of ticking. */
  frozenMs?: number | null;
  firstTryCards: number;
  games: number;
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

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function TimerStat({
  label,
  value,
  elapsedSeconds,
}: {
  label: string;
  value: string;
  elapsedSeconds: number;
}) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (elapsedSeconds <= 0) {
      pulse.value = 1;
      return;
    }
    pulse.value = withSequence(
      withTiming(1.16, {
        duration: 110,
        easing: Easing.out(Easing.quad),
      }),
      withTiming(1, {
        duration: 220,
        easing: Easing.inOut(Easing.quad),
      }),
    );
  }, [elapsedSeconds, pulse]);

  const valueStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <View style={styles.stat}>
      <Text style={styles.label}>{label}</Text>
      <Animated.Text style={[styles.value, styles.timerValue, valueStyle]}>
        {value}
      </Animated.Text>
    </View>
  );
}

/**
 * Owns its own tick so hundredths updates never re-render the game board.
 */
function ScoreBarInner({
  timerStartedAt,
  frozenMs = null,
  firstTryCards,
  games,
}: Props) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (frozenMs != null) {
      setElapsedMs(frozenMs);
      return;
    }
    if (timerStartedAt == null) {
      setElapsedMs(0);
      return;
    }
    const tick = () => setElapsedMs(Date.now() - timerStartedAt);
    tick();
    const id = setInterval(tick, 50);
    return () => clearInterval(id);
  }, [timerStartedAt, frozenMs]);

  const timeLabel = formatTime(elapsedMs);
  const elapsedSeconds = Math.floor(elapsedMs / 1000);

  return (
    <View style={styles.row}>
      <TimerStat
        label="Czas"
        value={timeLabel}
        elapsedSeconds={elapsedSeconds}
      />
      <View style={styles.divider} />
      <Stat label="1×" value={firstTryCards} />
      <View style={styles.divider} />
      <Stat label="Gry" value={games} />
    </View>
  );
}

export const ScoreBar = memo(ScoreBarInner);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    alignSelf: 'stretch',
    marginHorizontal: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: 'rgba(197, 198, 138, 0.7)',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  label: {
    fontSize: typography.scoreLabelSize,
    fontWeight: '600',
    color: colors.scoreLabel,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  value: {
    fontSize: typography.scoreValueSize,
    fontWeight: '700',
    color: colors.scoreValue,
  },
  timerValue: {
    fontVariant: ['tabular-nums'],
    minWidth: 88,
    textAlign: 'center',
  },
  divider: {
    width: 2,
    height: 28,
    borderRadius: 1,
    backgroundColor: 'rgba(197, 198, 138, 0.55)',
  },
});
