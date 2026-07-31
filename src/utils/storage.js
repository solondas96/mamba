import { MAX_HIGH_SCORES, STORAGE_KEYS, DEFAULT_SETTINGS } from './constants';

// Safe localStorage wrapper with error handling
const safeStorage = {
  get(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.warn(`Failed to read from localStorage: ${key}`, error);
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Failed to write to localStorage: ${key}`, error);
      return false;
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove from localStorage: ${key}`, error);
    }
  },
};

// High score management
export function loadHighScores() {
  const scores = safeStorage.get(STORAGE_KEYS.highScores);
  return Array.isArray(scores) ? scores : [];
}

export function saveHighScores(scores) {
  return safeStorage.set(STORAGE_KEYS.highScores, scores);
}

export function addHighScore(score) {
  const scores = loadHighScores();
  const entry = {
    score,
    date: Date.now(),
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  };

  scores.push(entry);
  scores.sort((a, b) => b.score - a.score);
  const trimmed = scores.slice(0, MAX_HIGH_SCORES);

  saveHighScores(trimmed);
  return {
    scores: trimmed,
    isHighScore: trimmed.some((s) => s.id === entry.id),
    rank: trimmed.findIndex((s) => s.id === entry.id),
  };
}

export function clearHighScores() {
  safeStorage.remove(STORAGE_KEYS.highScores);
}

export function isHighScore(score) {
  if (score <= 0) return false;
  const scores = loadHighScores();
  if (scores.length < MAX_HIGH_SCORES) return true;
  return score > scores[scores.length - 1].score;
}

// Settings management
export function loadSettings() {
  const settings = safeStorage.get(STORAGE_KEYS.settings);
  return { ...DEFAULT_SETTINGS, ...settings };
}

export function saveSettings(settings) {
  return safeStorage.set(STORAGE_KEYS.settings, settings);
}

// Theme management
export function loadTheme() {
  return safeStorage.get(STORAGE_KEYS.theme) || 'system';
}

export function saveTheme(theme) {
  return safeStorage.set(STORAGE_KEYS.theme, theme);
}

// Debounced save helper for frequent writes
export function createDebouncedSave(fn, delay = 300) {
  let timeoutId = null;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}