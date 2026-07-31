// Game configuration constants
export const GRID_SIZE = 20;
export const BASE_SPEED = 6; // cells per second
export const MAX_SPEED = 12;
export const SPEED_INCREMENT = 1;
export const SCORE_PER_FOOD = 10;
export const HIGH_SCORE_KEY = 'mamba-snake-high-scores';
export const SETTINGS_KEY = 'mamba-snake-settings';
export const THEME_KEY = 'mamba-snake-theme';
export const MAX_HIGH_SCORES = 5;

// Difficulty progression: [minScore, speed]
export const DIFFICULTY_LEVELS = [
  { minScore: 0, speed: 6 },
  { minScore: 50, speed: 7 },
  { minScore: 100, speed: 8 },
  { minScore: 200, speed: 9 },
  { minScore: 400, speed: 10 },
  { minScore: 600, speed: 11 },
  { minScore: 800, speed: 12 },
];

// Material Design 3 color tokens
export const LIGHT_COLORS = {
  primary: '#6200EE',
  onPrimary: '#FFFFFF',
  primaryContainer: '#EADDFF',
  onPrimaryContainer: '#21005D',
  secondary: '#03DAC6',
  onSecondary: '#003731',
  secondaryContainer: '#CCFBF5',
  onSecondaryContainer: '#00201C',
  tertiary: '#FF6D00',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#FFDCC2',
  onTertiaryContainer: '#2D1600',
  error: '#CF6679',
  onError: '#FFFFFF',
  errorContainer: '#F9DEDC',
  onErrorContainer: '#410E0B',
  background: '#FFFFFF',
  onBackground: '#1C1B1F',
  surface: '#F5F5F5',
  onSurface: '#1C1B1F',
  surfaceVariant: '#E7E0EC',
  onSurfaceVariant: '#49454F',
  outline: '#E0E0E0',
  outlineVariant: '#CAC4D0',
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#313033',
  inverseOnSurface: '#F4EFF4',
  inversePrimary: '#D0BCFF',
  surfaceTint: '#6200EE',
};

export const DARK_COLORS = {
  primary: '#BB86FC',
  onPrimary: '#381E72',
  primaryContainer: '#4F378B',
  onPrimaryContainer: '#EADDFF',
  secondary: '#03DAC6',
  onSecondary: '#003731',
  secondaryContainer: '#00504A',
  onSecondaryContainer: '#CCFBF5',
  tertiary: '#FF6D00',
  onTertiary: '#4A2500',
  tertiaryContainer: '#6D3800',
  onTertiaryContainer: '#FFDCC2',
  error: '#CF6679',
  onError: '#690005',
  errorContainer: '#8C1D18',
  onErrorContainer: '#F9DEDC',
  background: '#121212',
  onBackground: '#E6E1E5',
  surface: '#1F1F1F',
  onSurface: '#E6E1E5',
  surfaceVariant: '#49454F',
  onSurfaceVariant: '#CAC4D0',
  outline: '#383838',
  outlineVariant: '#49454F',
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#E6E1E5',
  inverseOnSurface: '#313033',
  inversePrimary: '#6200EE',
  surfaceTint: '#BB86FC',
};

// Direction vectors
export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

export const OPPOSITE_DIRECTIONS = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

// Keyboard key mappings
export const KEY_MAPPINGS = {
  ArrowUp: 'UP',
  ArrowDown: 'DOWN',
  ArrowLeft: 'LEFT',
  ArrowRight: 'RIGHT',
  w: 'UP',
  W: 'UP',
  s: 'DOWN',
  S: 'DOWN',
  a: 'LEFT',
  A: 'LEFT',
  d: 'RIGHT',
  D: 'RIGHT',
};

// Game states
export const GAME_STATES = {
  IDLE: 'idle',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'gameOver',
};

// Grid size options for settings
export const GRID_SIZE_OPTIONS = [15, 20, 25, 30];

// Difficulty presets
export const DIFFICULTY_PRESETS = {
  easy: { baseSpeed: 5, maxSpeed: 8, speedIncrement: 0.5 },
  normal: { baseSpeed: 6, maxSpeed: 12, speedIncrement: 1 },
  hard: { baseSpeed: 8, maxSpeed: 15, speedIncrement: 1.5 },
};

// Default settings
export const DEFAULT_SETTINGS = {
  gridSize: 20,
  difficulty: 'normal',
  soundEnabled: false,
  showGrid: true,
  reducedMotion: false,
};

// Storage keys for settings
export const STORAGE_KEYS = {
  highScores: HIGH_SCORE_KEY,
  settings: SETTINGS_KEY,
  theme: THEME_KEY,
};