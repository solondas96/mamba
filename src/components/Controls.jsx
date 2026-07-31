import { GAME_STATES } from '../utils/constants';
import { sound } from '../utils/sound';

export default function Controls({
  gameState,
  onStart,
  onPause,
  onResume,
  onRestart,
}) {
  const handleClick = (fn) => {
    sound.click();
    fn();
  };

  const isPlaying = gameState === GAME_STATES.PLAYING;
  const isPaused = gameState === GAME_STATES.PAUSED;
  const isIdle = gameState === GAME_STATES.IDLE;
  const isGameOver = gameState === GAME_STATES.GAME_OVER;

  return (
    <div className="controls" role="toolbar" aria-label="Game controls">
      {(isIdle || isGameOver) && (
        <button
          className="md-button md-button-primary"
          onClick={() => handleClick(onStart)}
          aria-label="Start game"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
          Start
        </button>
      )}

      {isPlaying && (
        <button
          className="md-button md-button-secondary"
          onClick={() => handleClick(onPause)}
          aria-label="Pause game"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
          Pause
        </button>
      )}

      {isPaused && (
        <button
          className="md-button md-button-primary"
          onClick={() => handleClick(onResume)}
          aria-label="Resume game"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
          Resume
        </button>
      )}

      <button
        className="md-button md-button-outlined"
        onClick={() => handleClick(onRestart)}
        aria-label="Restart game"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
        Restart
      </button>
    </div>
  );
}