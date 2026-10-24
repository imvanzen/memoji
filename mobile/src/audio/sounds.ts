import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';

/**
 * Game SFX via expo-audio (works in Expo Go, native, and web).
 *
 * Why not cuelume?
 * - `cuelume` is Web Audio only (`window.AudioContext`) — silent on React Native.
 * - `cuelume-native` needs `react-native-audio-api` + a custom dev build (not Expo Go).
 * Short synthesized WAVs + expo-audio give the same playful mobile-game feel everywhere.
 */

export type SoundName =
  | 'flip'
  | 'match'
  | 'firstTry'
  | 'mismatch'
  | 'boardWin'
  | 'results'
  | 'playStart'
  | 'playAgain'
  | 'cancel'
  | 'tap';

const SOURCES: Record<SoundName, number> = {
  flip: require('../../assets/sfx/flip.wav'),
  match: require('../../assets/sfx/match.wav'),
  firstTry: require('../../assets/sfx/firstTry.wav'),
  mismatch: require('../../assets/sfx/mismatch.wav'),
  boardWin: require('../../assets/sfx/boardWin.wav'),
  results: require('../../assets/sfx/results.wav'),
  playStart: require('../../assets/sfx/playStart.wav'),
  playAgain: require('../../assets/sfx/playAgain.wav'),
  cancel: require('../../assets/sfx/cancel.wav'),
  tap: require('../../assets/sfx/tap.wav'),
};

const DEFAULT_VOLUME = 0.7;

let enabled = true;
let globalVolume = DEFAULT_VOLUME;
let unlocked = false;
const players = new Map<SoundName, AudioPlayer>();

function ensurePlayer(name: SoundName): AudioPlayer | null {
  const existing = players.get(name);
  if (existing) {
    return existing;
  }
  try {
    const player = createAudioPlayer(SOURCES[name], { updateInterval: 500 });
    player.volume = globalVolume;
    players.set(name, player);
    return player;
  } catch {
    return null;
  }
}

const setSoundsEnabled = (value: boolean): void => {
  enabled = value;
};

const isSoundsEnabled = (): boolean => enabled;

const setSoundsVolume = (volume: number): void => {
  if (!Number.isFinite(volume)) return;
  globalVolume = Math.min(1, Math.max(0, volume));
  players.forEach((player) => {
    player.volume = globalVolume;
  });
};

const playSound = (name: SoundName, volumeScale = 1): void => {
  if (!enabled) return;
  const player = ensurePlayer(name);
  if (!player) return;
  player.volume = Math.min(1, Math.max(0, globalVolume * volumeScale));
  void player.seekTo(0).then(() => {
    player.play();
  });
};

/**
 * Unlock / warm audio on a user gesture (required on iOS & web autoplay policy).
 */
const unlockSounds = (): void => {
  if (unlocked) return;
  unlocked = true;
  void setAudioModeAsync({
    playsInSilentMode: true,
    interruptionMode: 'mixWithOthers',
    shouldPlayInBackground: false,
    shouldRouteThroughEarpiece: false,
    allowsRecording: false,
  }).catch(() => {
    // Mode setup is best-effort — playback may still work with defaults.
  });
  // Warm a silent seek so the first real cue isn't delayed.
  ensurePlayer('tap');
  // Lazy import avoids a circular init with music.ts
  void import('./music').then(({ unlockMusic }) => unlockMusic());
};

const sounds = {
  flip: () => playSound('flip', 0.9),
  match: () => playSound('match', 0.85),
  firstTry: () => playSound('firstTry', 0.95),
  mismatch: () => playSound('mismatch', 0.75),
  boardWin: () => playSound('boardWin', 1),
  results: () => playSound('results', 0.85),
  playStart: () => playSound('playStart', 0.9),
  playAgain: () => playSound('playAgain', 0.8),
  cancel: () => playSound('cancel', 0.8),
  button: () => playSound('tap', 0.85),
} as const;

export {
  DEFAULT_VOLUME,
  setSoundsEnabled,
  isSoundsEnabled,
  setSoundsVolume,
  playSound,
  sounds,
  unlockSounds,
};
