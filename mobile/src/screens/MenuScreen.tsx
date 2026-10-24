import { useEffect, useRef, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { unlockSounds, sounds, setMusicTrack, unlockMusic } from '../audio';
import { hapticSelection } from '../haptics';
import { CartoonBackground } from '../components/CartoonBackground';
import { EmojiBuds } from '../components/EmojiBuds';
import { MemojiButton } from '../components/MemojiButton';
import { MusicToggle } from '../components/MusicToggle';
import {
  DIFFICULTY_HINTS,
  DIFFICULTY_LABELS,
  DIFFICULTY_ORDER,
  DIFFICULTY_PREVIEW,
} from '../game/emojis';
import type { Difficulty } from '../game/types';
import { colors, radii, spacing, typography } from '../theme';

/** Full staggered intro only on the first visit this session. */
let menuIntroPlayed = false;

type Props = {
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onPlay: () => void;
  fontsLoaded?: boolean;
};

function Reveal({
  delayMs,
  children,
  style,
  fromY = 18,
}: {
  delayMs: number;
  children: ReactNode;
  style?: object;
  fromY?: number;
}) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = 0;
    t.value = withDelay(
      delayMs,
      withTiming(1, {
        duration: 520,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [delayMs, t]);

  const anim = useAnimatedStyle(() => ({
    opacity: t.value,
    transform: [{ translateY: (1 - t.value) * fromY }],
  }));

  return <Animated.View style={[style, anim]}>{children}</Animated.View>;
}

export function MenuScreen({
  difficulty,
  onDifficultyChange,
  onPlay,
  fontsLoaded = false,
}: Props) {
  const insets = useSafeAreaInsets();
  const playIntro = useRef(!menuIntroPlayed);
  if (playIntro.current) {
    menuIntroPlayed = true;
  }
  const intro = playIntro.current;

  // Stagger timeline (ms) — skipped / zeroed after first session visit
  const dBrand = intro ? 80 : 0;
  const dBuds = intro ? 280 : 0;
  const dTagline = intro ? 620 : 0;
  const dDiffHead = intro ? 900 : 0;
  const dChip0 = intro ? 1040 : 0;
  const dChipStep = intro ? 110 : 0;
  const dPlay = intro ? 1480 : 0;

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
        <View style={styles.topRow}>
          <MusicToggle />
        </View>

        <View style={styles.hero}>
          <View style={styles.brandWrap}>
            <Reveal delayMs={dBrand} fromY={14}>
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
            </Reveal>
            <EmojiBuds variant="menu" introDelayMs={dBuds} cycling />
          </View>
          <Reveal delayMs={dTagline} fromY={10}>
            <Text
              style={[
                styles.tagline,
                bodyFont ? { fontFamily: bodyFont } : null,
              ]}
            >
              Match the emoji pairs
            </Text>
          </Reveal>
        </View>

        <View style={styles.difficultyBlock}>
          <Reveal delayMs={dDiffHead} fromY={12}>
            <Text
              style={[
                styles.difficultyHeading,
                mediumFont ? { fontFamily: mediumFont } : null,
              ]}
            >
              Poziom trudności
            </Text>
          </Reveal>
          <View style={styles.difficultyGrid}>
            {DIFFICULTY_ORDER.map((level, i) => {
              const selected = level === difficulty;
              return (
                <Reveal
                  key={level}
                  delayMs={dChip0 + i * dChipStep}
                  fromY={16}
                  style={styles.chipReveal}
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => {
                      unlockSounds();
                      unlockMusic();
                      setMusicTrack('menu');
                      sounds.button();
                      hapticSelection();
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
                </Reveal>
              );
            })}
          </View>
        </View>

        <Reveal delayMs={dPlay} fromY={20} style={styles.playReveal}>
          <MemojiButton
            label="Play"
            fontsLoaded={fontsLoaded}
            pulse
            onPress={() => {
              unlockSounds();
              unlockMusic();
              sounds.button();
              onPlay();
            }}
            style={styles.playCta}
          />
        </Reveal>
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
  topRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
  chipReveal: {
    width: '48%',
  },
  difficultyChip: {
    width: '100%',
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
  playReveal: {
    alignSelf: 'center',
  },
  playCta: {
    minWidth: 220,
    paddingVertical: spacing.md + 4,
    marginTop: spacing.md,
  },
});
