import { Modal, StyleSheet, Text, View } from 'react-native';
import { unlockSounds } from '../audio';
import { EmojiBuds } from './EmojiBuds';
import { MemojiButton } from './MemojiButton';
import { colors, radii, spacing } from '../theme';

type Props = {
  visible: boolean;
  timeLabel: string;
  firstTryCards: number;
  onPlayAgain: () => void;
  fontsLoaded?: boolean;
};

export function ResultsOverlay({
  visible,
  timeLabel,
  firstTryCards,
  onPlayAgain,
  fontsLoaded = false,
}: Props) {
  const titleFont = fontsLoaded ? 'Fredoka_600SemiBold' : undefined;
  const bodyFont = fontsLoaded ? 'Fredoka_400Regular' : undefined;
  const mediumFont = fontsLoaded ? 'Fredoka_500Medium' : undefined;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.badgeWrap}>
            <View style={styles.badge}>
              <Text
                style={[
                  styles.title,
                  titleFont ? { fontFamily: titleFont } : null,
                ]}
              >
                Gratulacje!
              </Text>
            </View>
            {visible ? (
              <EmojiBuds variant="results" replayKey={visible ? 1 : 0} />
            ) : null}
          </View>

          <View style={styles.row}>
            <Text
              style={[styles.label, bodyFont ? { fontFamily: bodyFont } : null]}
            >
              Czas
            </Text>
            <Text
              style={[
                styles.value,
                mediumFont ? { fontFamily: mediumFont } : null,
              ]}
            >
              {timeLabel}
            </Text>
          </View>

          <View style={[styles.row, styles.rowLast]}>
            <Text
              style={[styles.label, bodyFont ? { fontFamily: bodyFont } : null]}
            >
              Za pierwszym razem
            </Text>
            <Text
              style={[
                styles.value,
                mediumFont ? { fontFamily: mediumFont } : null,
              ]}
            >
              {firstTryCards}
            </Text>
          </View>

          <MemojiButton
            label="Zacznij ponownie"
            fontsLoaded={fontsLoaded}
            onPress={() => {
              unlockSounds();
              onPlayAgain();
            }}
            style={styles.cta}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(44, 62, 80, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: 3,
    borderColor: colors.cardBackBorder,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'stretch',
    overflow: 'visible',
    shadowColor: '#5a6b3a',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  badgeWrap: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    overflow: 'visible',
  },
  badge: {
    backgroundColor: colors.cell,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.cardBackBorder,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    zIndex: 1,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.ink,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(197, 198, 138, 0.55)',
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  label: {
    fontSize: 16,
    color: colors.inkMuted,
  },
  value: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.ink,
  },
  cta: {
    marginTop: spacing.lg,
    alignSelf: 'stretch',
  },
});
