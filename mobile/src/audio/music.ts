import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';

export type MusicTrack = 'menu' | 'game';

const SOURCES: Record<MusicTrack, number> = {
  menu: require('../../assets/music/menu.wav'),
  game: require('../../assets/music/game.wav'),
};

const TRACK_VOLUME: Record<MusicTrack, number> = {
  menu: 0.28,
  game: 0.24,
};

const players = new Map<MusicTrack, AudioPlayer>();
let current: MusicTrack | null = null;
let unlocked = false;
let desired: MusicTrack | null = null;
let musicEnabled = true;
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((l) => l());
}

function ensureMode(): void {
  void setAudioModeAsync({
    playsInSilentMode: true,
    interruptionMode: 'mixWithOthers',
    shouldPlayInBackground: false,
    shouldRouteThroughEarpiece: false,
    allowsRecording: false,
  }).catch(() => {});
}

function ensurePlayer(track: MusicTrack): AudioPlayer | null {
  const existing = players.get(track);
  if (existing) return existing;
  try {
    const next = createAudioPlayer(SOURCES[track], { updateInterval: 1000 });
    next.loop = true;
    next.volume = TRACK_VOLUME[track];
    players.set(track, next);
    return next;
  } catch {
    return null;
  }
}

function pauseAll(): void {
  players.forEach((p) => {
    try {
      if (p.playing) p.pause();
    } catch {
      // ignore
    }
  });
}

function applyDesired(): void {
  if (!unlocked || !musicEnabled || desired === null) {
    pauseAll();
    current = null;
    return;
  }

  // Keep both decoded so track switches don't hitch mid-animation.
  ensurePlayer('menu');
  ensurePlayer('game');

  const next = ensurePlayer(desired);
  if (!next) {
    current = null;
    return;
  }

  players.forEach((p, track) => {
    if (track === desired) return;
    try {
      if (p.playing) p.pause();
    } catch {
      // ignore
    }
  });

  try {
    next.volume = TRACK_VOLUME[desired];
    if (current !== desired) {
      void next.seekTo(0).catch(() => {});
    }
    if (!next.playing) next.play();
    current = desired;
  } catch {
    current = null;
  }
}

const unlockMusic = (): void => {
  if (unlocked) return;
  unlocked = true;
  ensureMode();
  applyDesired();
};

const setMusicTrack = (track: MusicTrack | null): void => {
  desired = track;
  applyDesired();
};

const stopMusic = (): void => {
  desired = null;
  pauseAll();
  current = null;
};

const isMusicEnabled = (): boolean => musicEnabled;

const setMusicEnabled = (enabled: boolean): void => {
  musicEnabled = enabled;
  applyDesired();
  notify();
};

const toggleMusicEnabled = (): boolean => {
  setMusicEnabled(!musicEnabled);
  return musicEnabled;
};

const subscribeMusicEnabled = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export {
  unlockMusic,
  setMusicTrack,
  stopMusic,
  isMusicEnabled,
  setMusicEnabled,
  toggleMusicEnabled,
  subscribeMusicEnabled,
};
