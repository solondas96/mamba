import { useState, useCallback, useRef, useEffect } from 'react';
import {
  GAME_STATES,
  DIRECTIONS,
  OPPOSITE_DIRECTIONS,
  KEY_MAPPINGS,
  DIFFICULTY_PRESETS,
  SCORE_PER_FOOD,
} from '../utils/constants';
import { sound } from '../utils/sound';

// Helper: generate random food position not on snake
function generateFood(snake, gridSize) {
  const occupied = new Set(snake.map((cell) => `${cell.x},${cell.y}`));
  const freeCells = [];

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (!occupied.has(`${x},${y}`)) {
        freeCells.push({ x, y });
      }
    }
  }

  if (freeCells.length === 0) return null;
  return freeCells[Math.floor(Math.random() * freeCells.length)];
}

// Helper: create initial snake
function createInitialSnake(gridSize) {
  const center = Math.floor(gridSize / 2);
  return [
    { x: center, y: center },
    { x: center - 1, y: center },
    { x: center - 2, y: center },
  ];
}

export function useGame(settings) {
  const [gameState, setGameState] = useState(GAME_STATES.IDLE);
  const [snake, setSnake] = useState(() => createInitialSnake(settings.gridSize));
  const [food, setFood] = useState(null);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(DIFFICULTY_PRESETS[settings.difficulty].baseSpeed);
  const [foodsEaten, setFoodsEaten] = useState(0);
  const [maxSpeedAchieved, setMaxSpeedAchieved] = useState(DIFFICULTY_PRESETS[settings.difficulty].baseSpeed);
  const [gameTime, setGameTime] = useState(0);
  const [particles, setParticles] = useState([]);
  const [scorePopups, setScorePopups] = useState([]);

  // Refs for game loop and input queue
  const directionQueueRef = useRef([]);
  const currentDirectionNameRef = useRef('RIGHT');
  const snakeRef = useRef(snake);
  const foodRef = useRef(food);
  const scoreRef = useRef(score);
  const speedRef = useRef(speed);
  const foodsEatenRef = useRef(0);
  const gameStateRef = useRef(gameState);
  const settingsRef = useRef(settings);
  const lastMoveTimeRef = useRef(0);
  const animationFrameRef = useRef(null);
  const gameTimeRef = useRef(0);
  const lastGameTimeRef = useRef(0);
  const particlesRef = useRef([]);
  const scorePopupsRef = useRef([]);

  // Keep refs in sync
  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);

  useEffect(() => {
    foodRef.current = food;
  }, [food]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    particlesRef.current = particles;
  }, [particles]);

  useEffect(() => {
    scorePopupsRef.current = scorePopups;
  }, [scorePopups]);

  // Calculate speed based on score and difficulty
  const calculateSpeed = useCallback((currentScore, difficulty) => {
    const preset = DIFFICULTY_PRESETS[difficulty];
    const levels = Math.floor(currentScore / 50);
    return Math.min(preset.baseSpeed + levels * preset.speedIncrement, preset.maxSpeed);
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    const currentSettings = settingsRef.current;
    const initialSnake = createInitialSnake(currentSettings.gridSize);
    const initialSpeed = DIFFICULTY_PRESETS[currentSettings.difficulty].baseSpeed;

    snakeRef.current = initialSnake;
    currentDirectionNameRef.current = 'RIGHT';
    directionQueueRef.current = [];
    scoreRef.current = 0;
    speedRef.current = initialSpeed;
    foodsEatenRef.current = 0;
    gameTimeRef.current = 0;
    lastGameTimeRef.current = 0;
    particlesRef.current = [];
    scorePopupsRef.current = [];

    setSnake(initialSnake);
    setScore(0);
    setSpeed(initialSpeed);
    setFoodsEaten(0);
    setMaxSpeedAchieved(initialSpeed);
    setGameTime(0);
    setParticles([]);
    setScorePopups([]);
    setGameState(GAME_STATES.IDLE);

    const newFood = generateFood(initialSnake, currentSettings.gridSize);
    setFood(newFood);
    foodRef.current = newFood;
  }, []);

  // Start game
  const startGame = useCallback(() => {
    const currentSettings = settingsRef.current;
    const initialSpeed = DIFFICULTY_PRESETS[currentSettings.difficulty].baseSpeed;

    // Reset if starting from game over or idle with no food
    if (gameStateRef.current === GAME_STATES.GAME_OVER || !foodRef.current) {
      const freshSnake = createInitialSnake(currentSettings.gridSize);
      snakeRef.current = freshSnake;
      currentDirectionNameRef.current = 'RIGHT';
      directionQueueRef.current = [];
      scoreRef.current = 0;
      speedRef.current = initialSpeed;
      foodsEatenRef.current = 0;
      gameTimeRef.current = 0;
      lastGameTimeRef.current = 0;
      particlesRef.current = [];
      scorePopupsRef.current = [];

      setSnake(freshSnake);
      setScore(0);
      setSpeed(initialSpeed);
      setFoodsEaten(0);
      setMaxSpeedAchieved(initialSpeed);
      setGameTime(0);
      setParticles([]);
      setScorePopups([]);

      const newFood = generateFood(freshSnake, currentSettings.gridSize);
      setFood(newFood);
      foodRef.current = newFood;
    }

    setGameState(GAME_STATES.PLAYING);
    lastMoveTimeRef.current = performance.now();
    lastGameTimeRef.current = performance.now();
    sound.start();
  }, []);

  // Pause game
  const pauseGame = useCallback(() => {
    if (gameStateRef.current === GAME_STATES.PLAYING) {
      setGameState(GAME_STATES.PAUSED);
      sound.pause();
    }
  }, []);

  // Resume game
  const resumeGame = useCallback(() => {
    if (gameStateRef.current === GAME_STATES.PAUSED) {
      setGameState(GAME_STATES.PLAYING);
      lastMoveTimeRef.current = performance.now();
      lastGameTimeRef.current = performance.now();
      sound.start();
    }
  }, []);

  // Toggle pause
  const togglePause = useCallback(() => {
    if (gameStateRef.current === GAME_STATES.PLAYING) {
      pauseGame();
    } else if (gameStateRef.current === GAME_STATES.PAUSED) {
      resumeGame();
    }
  }, [pauseGame, resumeGame]);

  // Queue direction input
  const queueDirection = useCallback((direction) => {
    if (gameStateRef.current !== GAME_STATES.PLAYING) return;

    const lastQueued = directionQueueRef.current[directionQueueRef.current.length - 1] || currentDirectionNameRef.current;
    if (direction === lastQueued || direction === OPPOSITE_DIRECTIONS[lastQueued]) return;

    // Limit queue size to prevent input spam
    if (directionQueueRef.current.length < 3) {
      directionQueueRef.current.push(direction);
    }
  }, []);

  // Spawn particles at position
  const spawnParticles = useCallback((x, y, color) => {
    const newParticles = [];
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.5;
      const velocity = 2 + Math.random() * 3;
      newParticles.push({
        id: `${Date.now()}-${i}-${Math.random()}`,
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: 1,
        decay: 0.02 + Math.random() * 0.02,
        size: 2 + Math.random() * 3,
        color,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
  }, []);

  // Spawn score popup
  const spawnScorePopup = useCallback((x, y, points) => {
    const popup = {
      id: `${Date.now()}-${Math.random()}`,
      x,
      y,
      points,
      life: 1,
      decay: 0.03,
    };
    setScorePopups((prev) => [...prev, popup]);
  }, []);

  // Game over
  const handleGameOver = useCallback(() => {
    setGameState(GAME_STATES.GAME_OVER);
    sound.gameOver();
  }, []);

  // Main game step - move snake
  const gameStep = useCallback(() => {
    const currentSnake = snakeRef.current;
    const currentFood = foodRef.current;
    const currentSettings = settingsRef.current;
    const gridSize = currentSettings.gridSize;

    // Process direction queue
    if (directionQueueRef.current.length > 0) {
      const nextDirection = directionQueueRef.current.shift();
      if (nextDirection !== OPPOSITE_DIRECTIONS[currentDirectionNameRef.current]) {
        currentDirectionNameRef.current = nextDirection;
      }
    }

    const direction = DIRECTIONS[currentDirectionNameRef.current];
    const head = currentSnake[0];
    const newHead = {
      x: head.x + direction.x,
      y: head.y + direction.y,
    };

    // Wall collision
    if (
      newHead.x < 0 ||
      newHead.x >= gridSize ||
      newHead.y < 0 ||
      newHead.y >= gridSize
    ) {
      handleGameOver();
      return;
    }

    // Self collision (check against body, excluding tail if not growing)
    const willEat = currentFood && newHead.x === currentFood.x && newHead.y === currentFood.y;
    const bodyToCheck = willEat ? currentSnake : currentSnake.slice(0, -1);
    if (bodyToCheck.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
      handleGameOver();
      return;
    }

    // Move snake
    const newSnake = [newHead, ...currentSnake];
    if (!willEat) {
      newSnake.pop();
    }

    snakeRef.current = newSnake;
    setSnake(newSnake);

    // Handle food consumption
    if (willEat) {
      const newScore = scoreRef.current + SCORE_PER_FOOD;
      const newSpeed = calculateSpeed(newScore, currentSettings.difficulty);
      const newFoodsEaten = foodsEatenRef.current + 1;

      scoreRef.current = newScore;
      speedRef.current = newSpeed;
      foodsEatenRef.current = newFoodsEaten;

      setScore(newScore);
      setSpeed(newSpeed);
      setFoodsEaten(newFoodsEaten);
      setMaxSpeedAchieved((prev) => Math.max(prev, newSpeed));

      // Spawn effects
      const foodPixelX = currentFood.x + 0.5;
      const foodPixelY = currentFood.y + 0.5;
      spawnParticles(foodPixelX, foodPixelY, currentSettings.difficulty === 'hard' ? '#FF6D00' : '#03DAC6');
      spawnScorePopup(foodPixelX, foodPixelY, SCORE_PER_FOOD);

      sound.eat();

      // Spawn new food
      const newFood = generateFood(newSnake, gridSize);
      setFood(newFood);
      foodRef.current = newFood;
    }
  }, [calculateSpeed, handleGameOver, spawnParticles, spawnScorePopup]);

  // Game loop with requestAnimationFrame
  useEffect(() => {
    if (gameState !== GAME_STATES.PLAYING) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const loop = (timestamp) => {
      const interval = 1000 / speedRef.current;

      // Move snake at fixed intervals
      if (timestamp - lastMoveTimeRef.current >= interval) {
        gameStep();
        lastMoveTimeRef.current = timestamp;
      }

      // Track game time
      if (lastGameTimeRef.current > 0) {
        const delta = timestamp - lastGameTimeRef.current;
        gameTimeRef.current += delta;
        setGameTime(gameTimeRef.current);
      }
      lastGameTimeRef.current = timestamp;

      // Update particles
      if (particlesRef.current.length > 0) {
        const updatedParticles = particlesRef.current
          .map((p) => ({
            ...p,
            x: p.x + p.vx * 0.016,
            y: p.y + p.vy * 0.016,
            vy: p.vy + 0.05,
            life: p.life - p.decay,
          }))
          .filter((p) => p.life > 0);
        setParticles(updatedParticles);
      }

      // Update score popups
      if (scorePopupsRef.current.length > 0) {
        const updatedPopups = scorePopupsRef.current
          .map((p) => ({
            ...p,
            y: p.y - 0.02,
            life: p.life - p.decay,
          }))
          .filter((p) => p.life > 0);
        setScorePopups(updatedPopups);
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [gameState, gameStep]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Prevent arrow key scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
        event.preventDefault();
      }

      // Space toggles pause
      if (event.key === ' ') {
        if (gameStateRef.current === GAME_STATES.PLAYING || gameStateRef.current === GAME_STATES.PAUSED) {
          togglePause();
        }
        return;
      }

      // R restarts
      if (event.key === 'r' || event.key === 'R') {
        resetGame();
        return;
      }

      // Enter starts game
      if (event.key === 'Enter') {
        if (gameStateRef.current === GAME_STATES.IDLE || gameStateRef.current === GAME_STATES.GAME_OVER) {
          startGame();
        }
        return;
      }

      // Direction keys
      const direction = KEY_MAPPINGS[event.key];
      if (direction) {
        queueDirection(direction);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [queueDirection, togglePause, resetGame, startGame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Reset when settings change
  useEffect(() => {
    resetGame();
  }, [settings.gridSize, settings.difficulty, resetGame]);

  return {
    gameState,
    snake,
    food,
    score,
    speed,
    foodsEaten,
    maxSpeedAchieved,
    gameTime,
    particles,
    scorePopups,
    startGame,
    pauseGame,
    resumeGame,
    togglePause,
    resetGame,
    queueDirection,
  };
}