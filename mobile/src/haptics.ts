import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const canHaptic = Platform.OS !== 'web';

/** Light tap when a card is revealed. */
export function hapticFlip(): void {
  if (!canHaptic) return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

/** Soft success for a normal match. */
export function hapticMatch(): void {
  if (!canHaptic) return;
  void Haptics.notificationAsync(
    Haptics.NotificationFeedbackType.Success,
  ).catch(() => {});
}

/** Stronger success for first-try / board clear. */
export function hapticFirstTry(): void {
  if (!canHaptic) return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  void Haptics.notificationAsync(
    Haptics.NotificationFeedbackType.Success,
  ).catch(() => {});
}

export function hapticBoardWin(): void {
  if (!canHaptic) return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
  void Haptics.notificationAsync(
    Haptics.NotificationFeedbackType.Success,
  ).catch(() => {});
}

/** Mismatch buzz. */
export function hapticMismatch(): void {
  if (!canHaptic) return;
  void Haptics.notificationAsync(
    Haptics.NotificationFeedbackType.Error,
  ).catch(() => {});
}

export function hapticSelection(): void {
  if (!canHaptic) return;
  void Haptics.selectionAsync().catch(() => {});
}
