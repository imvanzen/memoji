import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type Bud = {
  emoji: string;
  x: number;
  y: number;
  size: number;
  delay: number;
  tilt: number;
};

type Variant = 'menu' | 'results';

const MENU_BUDS: Bud[] = [
  { emoji: '🌸', x: -108, y: -48, size: 42, delay: 100, tilt: -18 },
  { emoji: '⭐', x: 102, y: -54, size: 40, delay: 240, tilt: 14 },
  { emoji: '🍋', x: -118, y: 36, size: 38, delay: 380, tilt: -10 },
  { emoji: '🍀', x: 114, y: 30, size: 38, delay: 500, tilt: 12 },
  { emoji: '🎈', x: -52, y: -86, size: 36, delay: 620, tilt: -6 },
  { emoji: '✨', x: 48, y: -92, size: 36, delay: 740, tilt: 8 },
];

const RESULTS_BUDS: Bud[] = [
  { emoji: '🎉', x: -96, y: -28, size: 36, delay: 80, tilt: -16 },
  { emoji: '🏆', x: 92, y: -32, size: 34, delay: 200, tilt: 12 },
  { emoji: '🌟', x: -104, y: 34, size: 32, delay: 320, tilt: -8 },
  { emoji: '🎊', x: 100, y: 28, size: 34, delay: 440, tilt: 10 },
  { emoji: '🥳', x: -36, y: -58, size: 30, delay: 560, tilt: -4 },
  { emoji: '✨', x: 34, y: -62, size: 30, delay: 680, tilt: 6 },
];

function BudPop({ bud, replayKey }: { bud: Bud; replayKey: number }) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = 0;
    t.value = withDelay(
      bud.delay,
      withSequence(
        withTiming(1.14, {
          duration: 400,
          easing: Easing.out(Easing.back(1.9)),
        }),
        withTiming(1, {
          duration: 180,
          easing: Easing.inOut(Easing.quad),
        }),
      ),
    );
  }, [bud.delay, replayKey, t]);

  const style = useAnimatedStyle(() => ({
    opacity: Math.min(1, t.value),
    transform: [
      { translateX: bud.x },
      { translateY: bud.y + (1 - Math.min(1, t.value)) * 22 },
      { scale: t.value },
      { rotate: `${bud.tilt * Math.min(1, t.value)}deg` },
    ],
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.bud, style]}>
      <Text
        allowFontScaling={false}
        style={{ fontSize: bud.size, lineHeight: bud.size + 6 }}
      >
        {bud.emoji}
      </Text>
    </Animated.View>
  );
}

type Props = {
  variant?: Variant;
  /** Bump to replay the pop (e.g. each time results open). */
  replayKey?: number;
};

/** Popping emoji buds drawn ABOVE the brand / badge disc. */
export function EmojiBuds({ variant = 'menu', replayKey = 0 }: Props) {
  const buds = variant === 'results' ? RESULTS_BUDS : MENU_BUDS;

  return (
    <View pointerEvents="none" style={styles.layer}>
      {buds.map((bud) => (
        <BudPop
          key={`${variant}-${bud.emoji}-${bud.x}-${bud.y}`}
          bud={bud}
          replayKey={replayKey}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    elevation: 20,
  },
  bud: {
    position: 'absolute',
    zIndex: 21,
    elevation: 21,
  },
});
