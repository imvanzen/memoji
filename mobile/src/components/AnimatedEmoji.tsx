import { Platform, StyleSheet, Text, View } from 'react-native';

type Props = {
  emoji: string;
  size?: number;
  active?: boolean;
  matched?: boolean;
};

/**
 * System emoji glyph centered in a square slot.
 *
 * Avoid fixed Text height/lineHeight === fontSize — that pins the glyph to the
 * wrong optical center on iOS/Android. Flex-center a natural-sized Text instead;
 * Android drops font padding; iOS uses System + verticalAlign middle.
 */
export function AnimatedEmoji({ emoji, size = 40 }: Props) {
  const fontSize = Math.round(size);
  // Native Apple/Noto Color Emoji sits low + slightly right; web is already fine.
  const liftX = Platform.OS === 'web' ? 0 : -Math.round(fontSize * 0.03);
  const liftY = Platform.OS === 'web' ? 0 : -Math.round(fontSize * 0.085);

  return (
    <View
      pointerEvents="none"
      style={[styles.slot, { width: size, height: size }]}
    >
      <Text
        allowFontScaling={false}
        maxFontSizeMultiplier={1}
        style={[styles.emoji, { fontSize, marginTop: liftY, marginLeft: liftX }]}
      >
        {emoji}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  emoji: {
    textAlign: 'center',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
        // RN 0.7+: verticalAlign middle helps Apple Color Emoji in a flex slot
        verticalAlign: 'middle',
      },
      android: {
        includeFontPadding: false,
        textAlignVertical: 'center',
        verticalAlign: 'middle',
      },
      default: {},
    }),
  },
});
