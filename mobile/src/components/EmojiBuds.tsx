import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type Slot = {
  x: number;
  y: number;
  size: number;
  tilt: number;
  /** Initial pop delay (ms) from mount / intro start. */
  delay: number;
};

type Variant = 'menu' | 'results';

const MENU_SLOTS: Slot[] = [
  { x: -108, y: -48, size: 42, delay: 100, tilt: -18 },
  { x: 102, y: -54, size: 40, delay: 240, tilt: 14 },
  { x: -118, y: 36, size: 38, delay: 380, tilt: -10 },
  { x: 114, y: 30, size: 38, delay: 500, tilt: 12 },
  { x: -52, y: -86, size: 36, delay: 620, tilt: -6 },
  { x: 48, y: -92, size: 36, delay: 740, tilt: 8 },
];

const RESULTS_SLOTS: Slot[] = [
  { x: -96, y: -28, size: 36, delay: 80, tilt: -16 },
  { x: 92, y: -32, size: 34, delay: 200, tilt: 12 },
  { x: -104, y: 34, size: 32, delay: 320, tilt: -8 },
  { x: 100, y: 28, size: 34, delay: 440, tilt: 10 },
  { x: -36, y: -58, size: 30, delay: 560, tilt: -4 },
  { x: 34, y: -62, size: 30, delay: 680, tilt: 6 },
];

const MENU_POOL = [
  '🌸',
  '⭐',
  '🍋',
  '🍀',
  '🎈',
  '✨',
  '🌈',
  '🍓',
  '🦋',
  '🍭',
  '🌻',
  '🐱',
  '🐰',
  '🍩',
  '🎵',
  '🌙',
  '🦄',
  '🍒',
  '🌼',
  '🐻',
] as const;

const RESULTS_POOL = [
  '🎉',
  '🏆',
  '🌟',
  '🎊',
  '🥳',
  '✨',
  '🥇',
  '💫',
  '🎈',
  '🌈',
  '🤩',
  '👏',
  '💖',
  '🎯',
] as const;

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pickEmoji(
  pool: readonly string[],
  exclude?: string,
): string {
  if (pool.length === 0) return '✨';
  let next = pool[Math.floor(Math.random() * pool.length)]!;
  if (exclude && pool.length > 1) {
    let guard = 0;
    while (next === exclude && guard < 8) {
      next = pool[Math.floor(Math.random() * pool.length)]!;
      guard += 1;
    }
  }
  return next;
}

function BudSlot({
  slot,
  pool,
  index,
  introDelayMs,
  cycling,
}: {
  slot: Slot;
  pool: readonly string[];
  index: number;
  introDelayMs: number;
  cycling: boolean;
}) {
  const [emoji, setEmoji] = useState(() => pickEmoji(pool));
  const appear = useSharedValue(0);
  const drift = useSharedValue(0);
  const wobble = useSharedValue(0);
  const gen = useRef(0);
  const alive = useRef(true);

  const popIn = useCallback(
    (delayMs: number) => {
      appear.value = 0;
      appear.value = withDelay(
        delayMs,
        withSequence(
          withTiming(1.16, {
            duration: 420,
            easing: Easing.out(Easing.back(2)),
          }),
          withTiming(1, {
            duration: 160,
            easing: Easing.inOut(Easing.quad),
          }),
        ),
      );
    },
    [appear],
  );

  const burstOut = useCallback(() => {
    appear.value = withSequence(
      withTiming(1.28, {
        duration: 120,
        easing: Easing.out(Easing.quad),
      }),
      withTiming(0, {
        duration: 220,
        easing: Easing.in(Easing.back(1.2)),
      }),
    );
  }, [appear]);

  // Initial pop + gentle idle drift / wobble
  useEffect(() => {
    alive.current = true;
    popIn(introDelayMs + slot.delay);

    const driftPeriod = 2600 + (index % 4) * 380 + rand(0, 400);
    drift.value = withDelay(
      introDelayMs + slot.delay,
      withRepeat(
        withSequence(
          withTiming(1, {
            duration: driftPeriod,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(-1, {
            duration: driftPeriod,
            easing: Easing.inOut(Easing.sin),
          }),
        ),
        -1,
        false,
      ),
    );

    const wobblePeriod = 1800 + (index % 3) * 280 + rand(0, 300);
    wobble.value = withDelay(
      introDelayMs + slot.delay + 80,
      withRepeat(
        withSequence(
          withTiming(1, {
            duration: wobblePeriod,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(-1, {
            duration: wobblePeriod,
            easing: Easing.inOut(Easing.sin),
          }),
        ),
        -1,
        false,
      ),
    );

    return () => {
      alive.current = false;
    };
  }, [drift, index, introDelayMs, popIn, slot.delay, wobble]);

  // Random burst → swap emoji → pop back
  useEffect(() => {
    if (!cycling) return;

    let timeout: ReturnType<typeof setTimeout> | null = null;
    const myGen = ++gen.current;

    const schedule = (first: boolean) => {
      const wait = first
        ? rand(2800, 5200) + index * 220
        : rand(3200, 7000);
      timeout = setTimeout(() => {
        if (!alive.current || gen.current !== myGen) return;
        burstOut();
        timeout = setTimeout(() => {
          if (!alive.current || gen.current !== myGen) return;
          setEmoji((prev) => pickEmoji(pool, prev));
          popIn(40);
          schedule(false);
        }, 360);
      }, wait);
    };

    schedule(true);
    return () => {
      if (timeout) clearTimeout(timeout);
      gen.current += 1;
    };
  }, [burstOut, cycling, index, pool, popIn]);

  const style = useAnimatedStyle(() => {
    const shown = Math.min(1, appear.value);
    const dx = interpolate(drift.value, [-1, 1], [-5.5, 5.5]);
    const dy = interpolate(drift.value, [-1, 1], [-4.5, 4.5]);
    const tiltExtra = interpolate(wobble.value, [-1, 1], [-7, 7]);
    return {
      opacity: shown,
      transform: [
        { translateX: slot.x + dx },
        {
          translateY:
            slot.y + dy + (1 - shown) * 24,
        },
        { scale: appear.value },
        { rotate: `${slot.tilt * shown + tiltExtra}deg` },
      ],
    };
  });

  return (
    <Animated.View pointerEvents="none" style={[styles.bud, style]}>
      <Text
        allowFontScaling={false}
        style={{ fontSize: slot.size, lineHeight: slot.size + 6 }}
      >
        {emoji}
      </Text>
    </Animated.View>
  );
}

type Props = {
  variant?: Variant;
  /** Extra delay before the first pop wave (menu intro stagger). */
  introDelayMs?: number;
  /** Keep bursting & swapping emojis (menu default). */
  cycling?: boolean;
  /** Bump to remount / replay (results open). */
  replayKey?: number;
};

/** Popping emoji buds drawn ABOVE the brand / badge disc. */
export function EmojiBuds({
  variant = 'menu',
  introDelayMs = 0,
  cycling = variant === 'menu',
  replayKey = 0,
}: Props) {
  const slots = variant === 'results' ? RESULTS_SLOTS : MENU_SLOTS;
  const pool = variant === 'results' ? RESULTS_POOL : MENU_POOL;

  return (
    <View pointerEvents="none" style={styles.layer}>
      {slots.map((slot, index) => (
        <BudSlot
          key={`${variant}-${replayKey}-${index}`}
          slot={slot}
          pool={pool}
          index={index}
          introDelayMs={introDelayMs}
          cycling={cycling}
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
