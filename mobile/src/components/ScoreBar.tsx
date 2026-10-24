import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '../theme';

type Props = {
  timeLabel: string;
  firstTryCards: number;
  games: number;
};

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export function ScoreBar({ timeLabel, firstTryCards, games }: Props) {
  return (
    <View style={styles.row}>
      <Stat label="Czas" value={timeLabel} />
      <View style={styles.divider} />
      <Stat label="1×" value={firstTryCards} />
      <View style={styles.divider} />
      <Stat label="Gry" value={games} />
    </View>
  );
}

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
  divider: {
    width: 2,
    height: 28,
    borderRadius: 1,
    backgroundColor: 'rgba(197, 198, 138, 0.55)',
  },
});
