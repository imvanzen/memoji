import { memo, useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../theme';

const { width: W, height: H } = Dimensions.get('window');

type BlobSpec = {
  size: number;
  color: string;
  left: number;
  top: number;
  dx: number;
  dy: number;
  duration: number;
  scaleFrom: number;
  scaleTo: number;
  /** Soft ring like a memory-card disc */
  ring?: boolean;
};

/** Floating discs — soft “ghost cards” + pastel orbs for a playground feel */
const BLOBS: BlobSpec[] = [
  {
    size: W * 0.42,
    color: colors.blobLemon,
    left: -W * 0.08,
    top: H * 0.06,
    dx: 14,
    dy: 22,
    duration: 10000,
    scaleFrom: 1,
    scaleTo: 1.08,
    ring: true,
  },
  {
    size: W * 0.28,
    color: colors.blobMint,
    left: W * 0.62,
    top: H * 0.1,
    dx: -18,
    dy: 16,
    duration: 12000,
    scaleFrom: 1.02,
    scaleTo: 0.94,
  },
  {
    size: W * 0.36,
    color: colors.blobPeach,
    left: W * 0.08,
    top: H * 0.38,
    dx: 12,
    dy: -20,
    duration: 11000,
    scaleFrom: 0.96,
    scaleTo: 1.08,
  },
  {
    size: W * 0.22,
    color: colors.blobLemon,
    left: W * 0.72,
    top: H * 0.42,
    dx: -10,
    dy: 14,
    duration: 9000,
    scaleFrom: 1,
    scaleTo: 1.12,
    ring: true,
  },
  {
    size: W * 0.48,
    color: colors.blobSky,
    left: W * 0.28,
    top: H * 0.62,
    dx: 16,
    dy: -14,
    duration: 13000,
    scaleFrom: 1.05,
    scaleTo: 0.95,
  },
  {
    size: W * 0.2,
    color: colors.blobCoral,
    left: W * 0.05,
    top: H * 0.78,
    dx: 14,
    dy: -12,
    duration: 9500,
    scaleFrom: 1,
    scaleTo: 1.1,
    ring: true,
  },
  {
    size: W * 0.3,
    color: colors.blobCream,
    left: W * 0.58,
    top: H * 0.8,
    dx: -16,
    dy: -18,
    duration: 10500,
    scaleFrom: 1.04,
    scaleTo: 0.96,
  },
];

function FloatingBlob({ spec }: { spec: BlobSpec }) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const scale = useSharedValue(spec.scaleFrom);

  useEffect(() => {
    const ease = Easing.inOut(Easing.sin);
    tx.value = withRepeat(
      withSequence(
        withTiming(spec.dx, { duration: spec.duration / 2, easing: ease }),
        withTiming(-spec.dx * 0.6, {
          duration: spec.duration / 2,
          easing: ease,
        }),
      ),
      -1,
      true,
    );
    ty.value = withRepeat(
      withSequence(
        withTiming(spec.dy, { duration: spec.duration / 2, easing: ease }),
        withTiming(-spec.dy * 0.5, {
          duration: spec.duration / 2,
          easing: ease,
        }),
      ),
      -1,
      true,
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(spec.scaleTo, {
          duration: spec.duration / 2,
          easing: ease,
        }),
        withTiming(spec.scaleFrom, {
          duration: spec.duration / 2,
          easing: ease,
        }),
      ),
      -1,
      true,
    );
  }, [spec, scale, tx, ty]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.blob,
        {
          width: spec.size,
          height: spec.size,
          borderRadius: spec.size / 2,
          backgroundColor: spec.color,
          left: spec.left,
          top: spec.top,
          borderWidth: spec.ring ? 3 : 0,
          borderColor: spec.ring ? 'rgba(197, 198, 138, 0.45)' : 'transparent',
        },
        style,
      ]}
    />
  );
}

function CartoonBackgroundInner() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[colors.skyLight, colors.sky, colors.mint]}
        locations={[0, 0.42, 1]}
        style={StyleSheet.absoluteFill}
      />
      {BLOBS.map((blob, i) => (
        <FloatingBlob key={i} spec={blob} />
      ))}
      {/* Soft white veil so emoji cards stay the focus */}
      <View style={styles.wash} />
    </View>
  );
}

export const CartoonBackground = memo(CartoonBackgroundInner);

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
  },
  wash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay,
  },
});
