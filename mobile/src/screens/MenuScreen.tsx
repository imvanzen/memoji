import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { unlockSounds, sounds } from '../audio';
import { CartoonBackground } from '../components/CartoonBackground';
import { EmojiBuds } from '../components/EmojiBuds';
import { MemojiButton } from '../components/MemojiButton';
import {
  DIFFICULTY_HINTS,
  DIFFICULTY_LABELS,
  DIFFICULTY_ORDER,
  DIFFICULTY_PREVIEW,
} from '../game/emojis';
import type { Difficulty } from '../game/types';
import { colors, radii, spacing, typography } from '../theme';

type Props = {
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onPlay: () => void;
  fontsLoaded?: boolean;
};

export function MenuScreen({
  difficulty,
  onDifficultyChange,
  onPlay,
  fontsLoaded = false,
}: Props) {
  const insets = useSafeAreaInsets();
  const brandFont = fontsLoaded ? 'Fredoka_600SemiBold' : undefined;
  const bodyFont = fontsLoaded ? 'Fredoka_400Regular' : undefined;
  const mediumFont = fontsLoaded ? 'Fredoka_500Medium' : undefined;

  return (
    <View style={styles.root}>
      <CartoonBackground />
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + spacing.xl,
          },
        ]}
      >
        <View style={styles.hero}>
          <View style={styles.brandWrap}>
            <View style={styles.brandDisc}>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
                style={[
                  styles.brand,
                  brandFont ? { fontFamily: brandFont } : null,
                ]}
              >
                Memoji
              </Text>
            </View>
            <EmojiBuds variant="menu" />
          </View>
          <Text
            style={[
              styles.tagline,
              bodyFont ? { fontFamily: bodyFont } : null,
            ]}
          >
            Match the emoji pairs
          </Text>
        </View>

        <View style={styles.difficultyBlock}>
          <Text
            style={[
              styles.difficultyHeading,
              mediumFont ? { fontFamily: mediumFont } : null,
            ]}
          >
            Poziom trudności
          </Text>
          <View style={styles.difficultyGrid}>
            {DIFFICULTY_ORDER.map((level) => {
              const selected = level === difficulty;
              return (
                <Pressable
                  key={level}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    unlockSounds();
                    sounds.button();
                    onDifficultyChange(level);
                  }}
                  style={[
                    styles.difficultyChip,
                    selected && styles.difficultyChipSelected,
                  ]}
                >
                  <Text style={styles.difficultyPreview}>
                    {DIFFICULTY_PREVIEW[level]}
                  </Text>
                  <Text
                    style={[
                      styles.difficultyLabel,
                      selected && styles.difficultyLabelSelected,
                      mediumFont ? { fontFamily: mediumFont } : null,
                    ]}
                  >
                    {DIFFICULTY_LABELS[level]}
                  </Text>
                  <Text
                    style={[
                      styles.difficultyHint,
                      bodyFont ? { fontFamily: bodyFont } : null,
                    ]}
                  >
                    {DIFFICULTY_HINTS[level]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <MemojiButton
          label="Play"
          fontsLoaded={fontsLoaded}
          pulse
          onPress={() => {
            unlockSounds();
            sounds.button();
            onPlay();
          }}
          style={styles.playCta}
        />
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.md,
  },
  brandWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxl,
    overflow: 'visible',
  },
  brandDisc: {
    backgroundColor: colors.cell,
    borderRadius: 9999,
    borderWidth: 3,
    borderColor: colors.cardBackBorder,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl + 12,
    minWidth: 220,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5a6b3a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 0,
    elevation: 4,
    zIndex: 1,
  },
  brand: {
    fontSize: typography.brandSize,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: 0,
    textAlign: 'center',
    width: '100%',
  },
  tagline: {
    fontSize: typography.bodySize + 2,
    color: colors.inkMuted,
    textAlign: 'center',
  },
  difficultyBlock: {
    alignSelf: 'stretch',
    paddingHorizontal: spacing.sm,
  },
  difficultyHeading: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.inkMuted,
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  difficultyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  difficultyChip: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: 'rgba(197, 198, 138, 0.75)',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
  difficultyChipSelected: {
    backgroundColor: colors.cell,
    borderColor: colors.cardBackBorder,
    borderWidth: 2.5,
  },
  difficultyPreview: {
    fontSize: 26,
    lineHeight: 32,
    marginBottom: 2,
  },
  difficultyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
  },
  difficultyLabelSelected: {
    color: colors.ink,
  },
  difficultyHint: {
    fontSize: 11,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  playCta: {
    minWidth: 220,
    paddingVertical: spacing.md + 4,
    marginTop: spacing.md,
  },
});
