import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  /** Soft looping gleam across the surface */
  active?: boolean;
  /** Extra delay before the first sweep (ms) */
  delayMs?: number;
  /** How often the gleam repeats (ms) */
  intervalMs?: number;
  /** Roundness of the clip — match parent */
  borderRadius?: number;
};

/**
 * Diagonal white gleam that sweeps across a clipped parent.
 * Parent should set overflow: 'hidden'.
 */
export function ShineOverlay({
  active = true,
  delayMs = 0,
  intervalMs = 3200,
  borderRadius = 9999,
}: Props) {
  const t = useSharedValue(0);

  useEffect(() => {
    if (!active) {
      t.value = 0;
      return;
    }
    t.value = 0;
    t.value = withDelay(
      delayMs,
      withRepeat(
        withSequence(
          withTiming(1, {
            duration: 700,
            easing: Easing.inOut(Easing.quad),
          }),
          withTiming(1, { duration: Math.max(400, intervalMs - 700) }),
          withTiming(0, { duration: 0 }),
        ),
        -1,
        false,
      ),
    );
  }, [active, delayMs, intervalMs, t]);

  const style = useAnimatedStyle(() => ({
    opacity: t.value > 0 && t.value < 1 ? 0.55 : 0,
    transform: [
      { translateX: -80 + t.value * 220 },
      { rotate: '22deg' },
    ],
  }));

  if (!active) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={[styles.clip, { borderRadius }]}
    >
      <Animated.View style={[styles.gleam, style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  gleam: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    width: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
});
