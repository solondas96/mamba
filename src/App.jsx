import { useState, useCallback, useEffect, useRef } from 'react';
import Header from './components/Header';
import GameCanvas from './components/GameCanvas';
import ScoreBoard from './components/ScoreBoard';
import Controls from './components/Controls';
import {
  SettingsModal,
  LeaderboardModal,
  InfoModal,
  GameOverModal,
} from './components/Modals';
import { useGame } from './hooks/useGame';
import { useScores } from './hooks/useScores';
import { useTheme } from './hooks/useTheme';
import { loadSettings, saveSettings } from './utils/storage';
import { GAME_STATES } from './utils/constants';
import { sound } from './utils/sound';

export default function App() {
  // Theme
  const { themePreference, resolvedTheme, colors, isDark, toggleTheme, setTheme } = useTheme();

  // Settings
  const [settings, setSettings] = useState(() => loadSettings());

  // Game
  const game = useGame(settings);

  // Scores
  const scores = useScores();

  // Modal states
  const [showSettings, setShowSettings] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);

  // Touch controls
  const touchStartRef = useRef(null);
  const canvasContainerRef = useRef(null);

  // Sync sound enabled setting
  useEffect(() => {
    sound.setEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Update settings
  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      return next;
    });
  }, []);

  // Handle game over - submit score and show modal
  const gameOverHandledRef = useRef(false);

  useEffect(() => {
    if (game.gameState === GAME_STATES.GAME_OVER && !gameOverHandledRef.current) {
      gameOverHandledRef.current = true;
      scores.submitScore(game.score);
      setShowGameOver(true);
    }

    if (game.gameState !== GAME_STATES.GAME_OVER) {
      gameOverHandledRef.current = false;
    }
  }, [game.gameState, game.score, scores]);

  // Handle restart from game over modal
  const handleRestartFromModal = useCallback(() => {
    setShowGameOver(false);
    game.resetGame();
  }, [game]);

  // Handle leaderboard from game over modal
  const handleLeaderboardFromModal = useCallback(() => {
    setShowGameOver(false);
    setShowLeaderboard(true);
  }, []);

  // Touch controls for mobile
  const handleTouchStart = useCallback((event) => {
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback((event) => {
    if (!touchStartRef.current) return;

    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const minSwipeDistance = 30;

    if (Math.abs(dx) < minSwipeDistance && Math.abs(dy) < minSwipeDistance) {
      // Tap - if idle or game over, start game
      if (game.gameState === GAME_STATES.IDLE || game.gameState === GAME_STATES.GAME_OVER) {
        game.startGame();
      } else if (game.gameState === GAME_STATES.PLAYING || game.gameState === GAME_STATES.PAUSED) {
        game.togglePause();
      }
      touchStartRef.current = null;
      return;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal swipe
      game.queueDirection(dx > 0 ? 'RIGHT' : 'LEFT');
    } else {
      // Vertical swipe
      game.queueDirection(dy > 0 ? 'DOWN' : 'UP');
    }

    touchStartRef.current = null;
  }, [game]);

  // Prevent scrolling on touch when interacting with game
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const preventScroll = (event) => {
      if (game.gameState === GAME_STATES.PLAYING) {
        event.preventDefault();
      }
    };

    container.addEventListener('touchmove', preventScroll, { passive: false });
    return () => container.removeEventListener('touchmove', preventScroll);
  }, [game.gameState]);

  // Get highest score
  const highestScore = scores.getHighestScore();

  // Handle game over modal close
  const handleGameOverClose = useCallback(() => {
    setShowGameOver(false);
  }, []);

  return (
    <div className="app" data-theme={resolvedTheme}>
      <Header
        isDark={isDark}
        toggleTheme={toggleTheme}
        onOpenSettings={() => setShowSettings(true)}
        onOpenInfo={() => setShowInfo(true)}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
      />

      <main className="app-main">
        <div
          ref={canvasContainerRef}
          className="game-wrapper"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <GameCanvas
            snake={game.snake}
            food={game.food}
            gridSize={settings.gridSize}
            gameState={game.gameState}
            colors={colors}
            showGrid={settings.showGrid}
            particles={game.particles}
            scorePopups={game.scorePopups}
            reducedMotion={settings.reducedMotion}
          />
        </div>

        <ScoreBoard
          score={game.score}
          highScore={highestScore}
          speed={game.speed}
          foodsEaten={game.foodsEaten}
          gameTime={game.gameTime}
          maxSpeedAchieved={game.maxSpeedAchieved}
        />

        <Controls
          gameState={game.gameState}
          onStart={game.startGame}
          onPause={game.pauseGame}
          onResume={game.resumeGame}
          onRestart={game.resetGame}
        />
      </main>

      <footer className="app-footer">
        <span>Mamba</span>
        <span className="footer-dot">·</span>
        <span>Material Design 3</span>
      </footer>

      {/* Modals */}
      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSetting={updateSetting}
        themePreference={themePreference}
        onThemeChange={setTheme}
      />

      <LeaderboardModal
        open={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        highScores={scores.highScores}
        onClearScores={scores.resetScores}
      />

      <InfoModal
        open={showInfo}
        onClose={() => setShowInfo(false)}
      />

      <GameOverModal
        open={showGameOver}
        onClose={handleGameOverClose}
        score={game.score}
        isHighScore={scores.lastResult?.isHighScore}
        rank={scores.lastResult?.rank}
        onRestart={handleRestartFromModal}
        onLeaderboard={handleLeaderboardFromModal}
      />
    </div>
  );
}