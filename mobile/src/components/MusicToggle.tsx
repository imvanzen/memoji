import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import {
  isMusicEnabled,
  subscribeMusicEnabled,
  toggleMusicEnabled,
  unlockMusic,
} from '../audio';
import { hapticSelection } from '../haptics';
import { colors, radii } from '../theme';

type Props = {
  style?: StyleProp<ViewStyle>;
};

/** Compact music on/off control for menu & game chrome. */
export function MusicToggle({ style }: Props) {
  const [enabled, setEnabled] = useState(isMusicEnabled);

  useEffect(() => subscribeMusicEnabled(() => setEnabled(isMusicEnabled())), []);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={enabled ? 'Wyłącz muzykę' : 'Włącz muzykę'}
      accessibilityState={{ checked: enabled }}
      hitSlop={10}
      onPress={() => {
        unlockMusic();
        hapticSelection();
        setEnabled(toggleMusicEnabled());
      }}
      style={({ pressed }) => [
        styles.btn,
        style,
        pressed && styles.pressed,
        !enabled && styles.off,
      ]}
    >
      <Text allowFontScaling={false} style={styles.glyph}>
        {enabled ? '🎵' : '🔇'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 2,
    borderColor: 'rgba(197, 198, 138, 0.85)',
  },
  off: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderColor: 'rgba(197, 198, 138, 0.55)',
  },
  pressed: {
    transform: [{ scale: 0.94 }],
    backgroundColor: colors.cellPressed,
  },
  glyph: {
    fontSize: 20,
    lineHeight: 26,
  },
});
