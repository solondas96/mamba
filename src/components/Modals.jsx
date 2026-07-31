import { useEffect, useRef } from 'react';
import { GRID_SIZE_OPTIONS, DIFFICULTY_PRESETS } from '../utils/constants';
import { sound } from '../utils/sound';

// Reusable Modal wrapper with focus trap and escape handling
function Modal({ open, onClose, title, children, ariaLabel }) {
  const dialogRef = useRef(null);

  // Handle escape key and focus management
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Focus the dialog on open
    const dialog = dialogRef.current;
    if (dialog) {
      const focusable = dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel || title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button
            className="icon-button"
            onClick={() => { sound.click(); onClose(); }}
            aria-label="Close dialog"
            title="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

// Settings Modal
export function SettingsModal({
  open,
  onClose,
  settings,
  onUpdateSetting,
  themePreference,
  onThemeChange,
}) {
  return (
    <Modal open={open} onClose={onClose} title="Settings" ariaLabel="Game settings">
      <div className="settings-group">
        <span className="settings-label">Grid Size</span>
        <div className="segmented-control" role="radiogroup" aria-label="Grid size">
          {GRID_SIZE_OPTIONS.map((size) => (
            <button
              key={size}
              className={`segment ${settings.gridSize === size ? 'segment-active' : ''}`}
              onClick={() => { sound.click(); onUpdateSetting('gridSize', size); }}
              role="radio"
              aria-checked={settings.gridSize === size}
              aria-label={`${size} by ${size} grid`}
            >
              {size}×{size}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-group">
        <span className="settings-label">Difficulty</span>
        <div className="segmented-control" role="radiogroup" aria-label="Difficulty">
          {Object.keys(DIFFICULTY_PRESETS).map((difficulty) => (
            <button
              key={difficulty}
              className={`segment ${settings.difficulty === difficulty ? 'segment-active' : ''}`}
              onClick={() => { sound.click(); onUpdateSetting('difficulty', difficulty); }}
              role="radio"
              aria-checked={settings.difficulty === difficulty}
              aria-label={`${difficulty} difficulty`}
            >
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-group">
        <span className="settings-label">Theme</span>
        <div className="segmented-control" role="radiogroup" aria-label="Theme preference">
          {['light', 'dark', 'system'].map((theme) => (
            <button
              key={theme}
              className={`segment ${themePreference === theme ? 'segment-active' : ''}`}
              onClick={() => { sound.click(); onThemeChange(theme); }}
              role="radio"
              aria-checked={themePreference === theme}
              aria-label={`${theme} theme`}
            >
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-group">
        <label className="switch-row">
          <span>Sound Effects</span>
          <button
            className={`switch ${settings.soundEnabled ? 'switch-on' : ''}`}
            onClick={() => { sound.click(); onUpdateSetting('soundEnabled', !settings.soundEnabled); }}
            role="switch"
            aria-checked={settings.soundEnabled}
            aria-label="Toggle sound effects"
          >
            <span className="switch-thumb" />
          </button>
        </label>
      </div>

      <div className="settings-group">
        <label className="switch-row">
          <span>Show Grid</span>
          <button
            className={`switch ${settings.showGrid ? 'switch-on' : ''}`}
            onClick={() => { sound.click(); onUpdateSetting('showGrid', !settings.showGrid); }}
            role="switch"
            aria-checked={settings.showGrid}
            aria-label="Toggle grid lines"
          >
            <span className="switch-thumb" />
          </button>
        </label>
      </div>

      <div className="settings-group">
        <label className="switch-row">
          <span>Reduced Motion</span>
          <button
            className={`switch ${settings.reducedMotion ? 'switch-on' : ''}`}
            onClick={() => { sound.click(); onUpdateSetting('reducedMotion', !settings.reducedMotion); }}
            role="switch"
            aria-checked={settings.reducedMotion}
            aria-label="Toggle reduced motion"
          >
            <span className="switch-thumb" />
          </button>
        </label>
      </div>
    </Modal>
  );
}

// Leaderboard Modal
export function LeaderboardModal({ open, onClose, highScores, onClearScores }) {
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  return (
    <Modal open={open} onClose={onClose} title="🏆 Leaderboard" ariaLabel="High scores leaderboard">
      {highScores.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">🏆</span>
          <p className="empty-text">No high scores yet!</p>
          <p className="empty-subtext">Play a game to set your first record.</p>
        </div>
      ) : (
        <>
          <ol className="leaderboard-list">
            {highScores.map((entry, index) => (
              <li key={entry.id} className={`leaderboard-item ${index === 0 ? 'leaderboard-first' : ''}`}>
                <span className="leaderboard-rank" aria-hidden="true">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </span>
                <span className="leaderboard-score">{entry.score}</span>
                <span className="leaderboard-date">{formatDate(entry.date)}</span>
              </li>
            ))}
          </ol>
          <div className="modal-actions">
            <button
              className="md-button md-button-text md-button-danger"
              onClick={() => { sound.click(); onClearScores(); }}
              aria-label="Clear all high scores"
            >
              Clear History
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

// Info / Help Modal
export function InfoModal({ open, onClose }) {
  const shortcuts = [
    { keys: ['↑', '↓', '←', '→'], action: 'Change direction' },
    { keys: ['W', 'A', 'S', 'D'], action: 'Change direction' },
    { keys: ['Space'], action: 'Pause / Resume' },
    { keys: ['Enter'], action: 'Start game' },
    { keys: ['R'], action: 'Restart game' },
    { keys: ['Esc'], action: 'Close dialogs' },
  ];

  return (
    <Modal open={open} onClose={onClose} title="How to Play" ariaLabel="Keyboard controls help">
      <div className="info-section">
        <h3 className="info-heading">🎮 Controls</h3>
        <div className="shortcut-list">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="shortcut-row">
              <div className="shortcut-keys">
                {shortcut.keys.map((key, keyIndex) => (
                  <kbd key={keyIndex} className="key-cap">{key}</kbd>
                ))}
              </div>
              <span className="shortcut-action">{shortcut.action}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="info-section">
        <h3 className="info-heading">📖 Rules</h3>
        <ul className="info-list">
          <li>Guide the snake to eat food and grow longer</li>
          <li>Each food gives you <strong>10 points</strong></li>
          <li>Speed increases as your score grows</li>
          <li>Avoid hitting walls or your own tail</li>
          <li>Top 5 scores are saved locally on your device</li>
        </ul>
      </div>

      <div className="info-section">
        <h3 className="info-heading">📱 Mobile</h3>
        <p className="info-text">
          Swipe anywhere on the game grid to change direction. The game is fully optimized for touch devices.
        </p>
      </div>
    </Modal>
  );
}

// Game Over Modal
export function GameOverModal({
  open,
  onClose,
  score,
  isHighScore,
  rank,
  onRestart,
  onLeaderboard,
}) {
  return (
    <Modal open={open} onClose={onClose} title="Game Over" ariaLabel="Game over">
      <div className="game-over-content">
        {isHighScore && (
          <div className="new-high-score" role="alert">
            <span aria-hidden="true">🎉</span>
            <span>New High Score!</span>
            {rank !== undefined && rank >= 0 && <span className="high-score-rank">Rank #{rank + 1}</span>}
          </div>
        )}

        <div className="final-score">
          <span className="final-score-label">Final Score</span>
          <span className="final-score-value">{score}</span>
        </div>

        <div className="modal-actions">
          <button
            className="md-button md-button-primary"
            onClick={() => { sound.click(); onRestart(); }}
            aria-label="Play again"
          >
            Play Again
          </button>
          <button
            className="md-button md-button-outlined"
            onClick={() => { sound.click(); onLeaderboard(); }}
            aria-label="View leaderboard"
          >
            Leaderboard
          </button>
        </div>
      </div>
    </Modal>
  );
}