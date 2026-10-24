import { useEffect, useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

export type ConfettiKind = 'pair' | 'firstTry' | 'board';

type Props = {
  /** Change this to retrigger a burst */
  burstId: number;
  kind: ConfettiKind;
  onDone?: () => void;
};

type Particle = {
  id: number;
  x: number;
  color: string;
  size: number;
  drift: number;
  spin: number;
  delay: number;
  duration: number;
  round: boolean;
};

const PAIR_COLORS = ['#F4A261', '#E76F51', '#2A9D8F', '#E9C46A', '#9B5DE5'];
const FIRST_TRY_COLORS = [
  '#FFD700',
  '#FFF3A0',
  '#FFEC70',
  '#FFE066',
  '#FFBF00',
  '#FFFFFF',
  '#FF9F1C',
  '#F4A261',
];
const BOARD_COLORS = [
  '#FF6B6B',
  '#FFD93D',
  '#6BCB77',
  '#4D96FF',
  '#FF8FAB',
  '#C77DFF',
  '#FF9F1C',
  '#2EC4B6',
];

function makeParticles(
  kind: ConfettiKind,
  width: number,
  height: number,
): Particle[] {
  const count = kind === 'board' ? 72 : kind === 'firstTry' ? 40 : 22;
  const colors =
    kind === 'board'
      ? BOARD_COLORS
      : kind === 'firstTry'
        ? FIRST_TRY_COLORS
        : PAIR_COLORS;
  const particles: Particle[] = [];

  for (let i = 0; i < count; i += 1) {
    const spread =
      kind === 'board' ? width : kind === 'firstTry' ? width * 0.7 : width * 0.55;
    const originX = width * 0.5;
    particles.push({
      id: i,
      x: originX + (Math.random() - 0.5) * spread,
      color: colors[i % colors.length]!,
      size:
        kind === 'board'
          ? 6 + Math.random() * 10
          : kind === 'firstTry'
            ? 6 + Math.random() * 9
            : 5 + Math.random() * 6,
      drift:
        (Math.random() - 0.5) *
        (kind === 'board' ? 160 : kind === 'firstTry' ? 110 : 70),
      spin: (Math.random() - 0.5) * (kind === 'firstTry' ? 900 : 720),
      delay: Math.random() * (kind === 'board' ? 280 : kind === 'firstTry' ? 160 : 120),
      duration:
        kind === 'board'
          ? 1600 + Math.random() * 900
          : kind === 'firstTry'
            ? 1100 + Math.random() * 600
            : 900 + Math.random() * 500,
      round: Math.random() > (kind === 'firstTry' ? 0.25 : 0.45),
    });
  }

  void height;
  return particles;
}

function Piece({
  particle,
  fall,
}: {
  particle: Particle;
  fall: number;
}) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = 0;
    t.value = withDelay(
      particle.delay,
      withTiming(1, {
        duration: particle.duration,
        easing: Easing.out(Easing.quad),
      }),
    );
  }, [particle, t, fall]);

  const style = useAnimatedStyle(() => {
    const y = t.value * fall;
    const x = particle.x + t.value * particle.drift;
    const rotate = t.value * particle.spin;
    const opacity =
      t.value < 0.15 ? t.value / 0.15 : 1 - (t.value - 0.15) / 0.85;
    return {
      opacity: Math.max(0, opacity),
      transform: [
        { translateX: x },
        { translateY: y },
        { rotate: `${rotate}deg` },
        { scale: 1 - t.value * 0.25 },
      ],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.piece,
        {
          width: particle.size,
          height: particle.round ? particle.size : particle.size * 0.55,
          borderRadius: particle.round ? particle.size / 2 : 2,
          backgroundColor: particle.color,
          top: particle.round ? -20 : -12,
          left: 0,
        },
        style,
      ]}
    />
  );
}

export function ConfettiBurst({ burstId, kind, onDone }: Props) {
  const { width, height } = useWindowDimensions();

  const particles = useMemo(
    () => makeParticles(kind, width, height),
    // burstId forces a fresh layout each celebration
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [burstId, kind, width, height],
  );

  useEffect(() => {
    if (burstId <= 0 || !onDone) {
      return;
    }
    const maxLife = particles.reduce(
      (max, p) => Math.max(max, p.delay + p.duration),
      0,
    );
    const id = setTimeout(onDone, maxLife + 80);
    return () => clearTimeout(id);
  }, [burstId, kind, onDone, particles]);

  if (burstId <= 0) {
    return null;
  }

  const startY =
    kind === 'board' ? height * 0.08 : kind === 'firstTry' ? height * 0.22 : height * 0.28;
  const fall =
    kind === 'board' ? height * 0.95 : kind === 'firstTry' ? height * 0.55 : height * 0.45;

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { top: startY }]}
    >
      {particles.map((p) => (
        <Piece key={`${burstId}-${p.id}`} particle={p} fall={fall} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  piece: {
    position: 'absolute',
  },
});
