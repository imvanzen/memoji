import { useEffect } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { ShineOverlay } from './ShineOverlay';
import { colors, radii, spacing } from '../theme';

type Variant = 'primary' | 'secondary';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  fontsLoaded?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  /** Soft breathing scale — used for the menu Play CTA */
  pulse?: boolean;
};

/**
 * Soft pill buttons that echo Memoji’s circular memory cards
 * (same lemon fill + olive border language as the reverse).
 */
export function MemojiButton({
  label,
  onPress,
  variant = 'primary',
  fontsLoaded = false,
  style,
  accessibilityLabel,
  pulse = false,
}: Props) {
  const labelFont = fontsLoaded
    ? variant === 'primary'
      ? 'Fredoka_600SemiBold'
      : 'Fredoka_500Medium'
    : undefined;
  const isPrimary = variant === 'primary';
  const breath = useSharedValue(1);

  useEffect(() => {
    if (!pulse) {
      breath.value = 1;
      return;
    }
    breath.value = withRepeat(
      withSequence(
        withTiming(1.045, {
          duration: 900,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(1, {
          duration: 900,
          easing: Easing.inOut(Easing.sin),
        }),
      ),
      -1,
      false,
    );
  }, [pulse, breath]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breath.value }],
  }));

  return (
    <Animated.View style={[pulse ? pulseStyle : null, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        onPress={onPress}
        style={({ pressed }) => [
          styles.base,
          isPrimary ? styles.primary : styles.secondary,
          pressed &&
            (isPrimary ? styles.primaryPressed : styles.secondaryPressed),
        ]}
      >
        <Text
          style={[
            styles.label,
            isPrimary ? styles.primaryLabel : styles.secondaryLabel,
            labelFont ? { fontFamily: labelFont } : null,
          ]}
        >
          {label}
        </Text>
        <ShineOverlay
          active
          delayMs={isPrimary ? 400 : 900}
          intervalMs={isPrimary ? 2800 : 3600}
          borderRadius={radii.pill}
        />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl + 4,
    minWidth: 180,
    borderWidth: 2.5,
    overflow: 'hidden',
  },
  primary: {
    backgroundColor: colors.cell,
    borderColor: colors.cardBackBorder,
    shadowColor: '#5a6b3a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 0,
    elevation: 3,
  },
  primaryPressed: {
    backgroundColor: colors.cellPressed,
    borderColor: '#a8a978',
    transform: [{ translateY: 2 }, { scale: 0.98 }],
    shadowOpacity: 0.08,
    elevation: 1,
  },
  secondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderColor: 'rgba(197, 198, 138, 0.85)',
    minWidth: 140,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
  },
  secondaryPressed: {
    backgroundColor: colors.cellPressed,
    borderColor: colors.cardBackBorder,
    transform: [{ scale: 0.97 }],
  },
  label: {
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  primaryLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.ink,
  },
  secondaryLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.inkMuted,
  },
});
