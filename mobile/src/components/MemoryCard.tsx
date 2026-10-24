import { useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
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
import { AnimatedEmoji } from './AnimatedEmoji';
import { ShineOverlay } from './ShineOverlay';
import { colors } from '../theme';

type Props = {
  emoji: string;
  flipped: boolean;
  matched: boolean;
  onPress: () => void;
  disabled?: boolean;
  size?: number;
  /** Stagger delay (ms) when flipping — used for wave close/open */
  flipDelayMs?: number;
  /** Board index 0..15 — staggers the party dance / deal-in */
  boardIndex?: number;
  /** Changes on board-win confetti — triggers joyful dance */
  partyKey?: number;
  /** Changes when a fresh board is dealt — triggers deal-in */
  dealKey?: number;
};

/**
 * Two-sided card:
 * - reverse: yellow disc + "?"
 * - avers: white disc + system emoji glyph
 */
export function MemoryCard({
  emoji,
  flipped,
  matched,
  onPress,
  disabled = false,
  size = 72,
  flipDelayMs = 0,
  boardIndex = 0,
  partyKey = 0,
  dealKey = 0,
}: Props) {
  const open = flipped || matched;
  const rotation = useSharedValue(open ? 180 : 0);
  const pressed = useSharedValue(0);
  const bump = useSharedValue(0);
  const party = useSharedValue(0);
  const deal = useSharedValue(dealKey > 0 ? 0 : 1);

  useEffect(() => {
    const target = open ? 180 : 0;
    // Stagger only when closing to reverse (TL→BR wave on "Zacznij ponownie")
    const delay = open ? 0 : flipDelayMs;
    const timeout = setTimeout(() => {
      rotation.value = withTiming(target, {
        duration: 500,
        easing: Easing.inOut(Easing.ease),
      });
    }, delay);
    return () => clearTimeout(timeout);
  }, [open, rotation, flipDelayMs]);

  useEffect(() => {
    if (!matched) {
      bump.value = 0;
      return;
    }
    // Rotate only — scale blurs the emoji glyph on native
    bump.value = withSequence(
      withTiming(1, { duration: 120, easing: Easing.out(Easing.quad) }),
      withTiming(0.35, { duration: 280, easing: Easing.inOut(Easing.quad) }),
      withTiming(0.7, { duration: 220, easing: Easing.inOut(Easing.quad) }),
      withTiming(0, { duration: 380, easing: Easing.inOut(Easing.quad) }),
    );
  }, [matched, bump]);

  useEffect(() => {
    if (partyKey <= 0) {
      party.value = 0;
      return;
    }
    // Joyful hop + wiggle, staggered TL→BR, loops while confetti falls
    const stagger = boardIndex * 55;
    party.value = 0;
    party.value = withDelay(
      stagger,
      withRepeat(
        withSequence(
          withTiming(1, {
            duration: 160,
            easing: Easing.out(Easing.quad),
          }),
          withTiming(-1, {
            duration: 160,
            easing: Easing.inOut(Easing.quad),
          }),
          withTiming(0.7, {
            duration: 130,
            easing: Easing.inOut(Easing.quad),
          }),
          withTiming(-0.5, {
            duration: 130,
            easing: Easing.inOut(Easing.quad),
          }),
          withTiming(0, {
            duration: 150,
            easing: Easing.in(Easing.quad),
          }),
        ),
        3,
        false,
      ),
    );
  }, [partyKey, boardIndex, party]);

  useEffect(() => {
    if (dealKey <= 0) {
      deal.value = 1;
      return;
    }
    // Deal-in: pop from below with stagger TL→BR
    deal.value = 0;
    deal.value = withDelay(
      boardIndex * 55,
      withTiming(1, {
        duration: 420,
        easing: Easing.out(Easing.back(1.35)),
      }),
    );
  }, [dealKey, boardIndex, deal]);

  const cardStyle = useAnimatedStyle(() => {
    const bumpRot = interpolate(
      bump.value,
      [0, 1, 0.35, 0.7, 0],
      [0, -28, 14, -8, 0],
    );
    const partyRot = interpolate(party.value, [-1, 0, 1], [16, 0, -18]);
    const partyY = interpolate(party.value, [-1, 0, 1], [5, 0, -16]);
    const dealScale = interpolate(deal.value, [0, 1], [0.35, 1]);
    const dealY = interpolate(deal.value, [0, 1], [28, 0]);
    const dealOpacity = interpolate(deal.value, [0, 0.35, 1], [0, 1, 1]);
    return {
      opacity: dealOpacity,
      transform: [
        { translateY: partyY + dealY },
        { rotateZ: `${bumpRot + partyRot}deg` },
        { scale: dealScale },
      ],
    };
  });

  const reverseStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotation.value, [0, 180], [0, 180]);
    return {
      transform: [{ perspective: 900 }, { rotateY: `${rotateY}deg` }],
      opacity: rotation.value >= 90 ? 0 : 1,
      zIndex: rotation.value >= 90 ? 0 : 1,
    };
  });

  const aversStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotation.value, [0, 180], [180, 360]);
    return {
      transform: [{ perspective: 900 }, { rotateY: `${rotateY}deg` }],
      opacity: rotation.value >= 90 ? 1 : 0,
      zIndex: rotation.value >= 90 ? 1 : 0,
    };
  });

  const reverseBgStyle = useAnimatedStyle(() => ({
    backgroundColor: pressed.value ? colors.cellPressed : colors.cardBack,
  }));

  const emojiSize = Math.max(36, Math.round(size * 0.78));
  const markSize = Math.max(30, Math.round(size * 0.48));
  const radius = size / 2;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || matched || flipped}
      onPressIn={() => {
        pressed.value = 1;
      }}
      onPressOut={() => {
        pressed.value = 0;
      }}
      onPress={onPress}
      style={{ width: size, height: size }}
    >
      <Animated.View
        style={[styles.card, { width: size, height: size }, cardStyle]}
      >
        <Animated.View
          style={[
            styles.face,
            { borderRadius: radius },
            reverseStyle,
            reverseBgStyle,
          ]}
        >
          <Text
            allowFontScaling={false}
            style={[styles.mark, { fontSize: markSize, lineHeight: markSize }]}
          >
            ?
          </Text>
          <ShineOverlay
            active={!open}
            delayMs={boardIndex * 180}
            intervalMs={3800}
            borderRadius={radius}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.face,
            styles.avers,
            matched && styles.aversMatched,
            { borderRadius: radius },
            aversStyle,
          ]}
        >
          <AnimatedEmoji emoji={emoji} size={emojiSize} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
  },
  face: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
    borderWidth: 2,
    borderColor: colors.cardBackBorder,
    overflow: 'hidden',
  },
  avers: {
    backgroundColor: colors.cardFront,
    borderColor: colors.cardFrontBorder,
    borderWidth: 3,
    shadowColor: '#1a2a3a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 4,
  },
  aversMatched: {
    backgroundColor: colors.cardMatched,
    borderColor: colors.cardMatchedBorder,
  },
  mark: {
    fontWeight: '700',
    color: colors.ink,
    opacity: 0.55,
    textAlign: 'center',
  },
});
