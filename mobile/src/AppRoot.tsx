import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
} from '@expo-google-fonts/fredoka';
import { setMusicTrack } from './audio';
import { MenuScreen } from './screens/MenuScreen';
import { GameScreen } from './screens/GameScreen';
import { useMemoryGame } from './game';
import { colors } from './theme';

export function AppRoot() {
  const [fontsLoaded] = useFonts({
    Fredoka_400Regular,
    Fredoka_500Medium,
    Fredoka_600SemiBold,
  });

  const game = useMemoryGame();

  // Lobby vs in-round beds — starts after first unlockSounds() gesture.
  useEffect(() => {
    setMusicTrack(game.screen === 'menu' ? 'menu' : 'game');
  }, [game.screen]);

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.ink} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {game.screen === 'menu' ? (
        <MenuScreen
          difficulty={game.difficulty}
          onDifficultyChange={game.setDifficulty}
          onPlay={game.startGame}
          fontsLoaded
        />
      ) : (
        <GameScreen
          cards={game.cards}
          timerStartedAt={game.timerStartedAt}
          finalTimeMs={game.finalTimeMs}
          firstTryCards={game.firstTryCards}
          games={game.stats.games}
          onCardPress={game.onCardPress}
          onCancel={game.cancelGame}
          onPlayAgain={game.playAgain}
          boardDisabled={game.busy || game.result !== null}
          fontsLoaded
          celebration={game.celebration}
          onCelebrationDone={game.onCelebrationDone}
          result={game.result}
          flipDelayById={game.flipDelayById}
          dealKey={game.dealKey}
        />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.skyLight,
  },
});
