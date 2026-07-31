import { useState, useCallback, useEffect, useRef } from 'react';
import {
  loadHighScores,
  saveHighScores,
  addHighScore,
  clearHighScores,
  isHighScore,
} from '../utils/storage';
import { sound } from '../utils/sound';

export function useScores() {
  const [highScores, setHighScores] = useState(() => loadHighScores());
  const [lastResult, setLastResult] = useState(null);
  const saveTimeoutRef = useRef(null);
  const highScoresRef = useRef(highScores);

  // Keep ref in sync
  useEffect(() => {
    highScoresRef.current = highScores;
  }, [highScores]);

  // Debounced save to avoid frequent localStorage writes
  const debouncedSave = useCallback((scores) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveHighScores(scores);
    }, 300);
  }, []);

  // Save scores whenever they change
  useEffect(() => {
    if (highScores.length > 0) {
      debouncedSave(highScores);
    }
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [highScores, debouncedSave]);

  // Submit a score at game over
  const submitScore = useCallback((score) => {
    if (score <= 0) {
      const result = { isHighScore: false, rank: -1, scores: highScoresRef.current };
      setLastResult(result);
      return result;
    }

    const result = addHighScore(score);
    setHighScores(result.scores);
    setLastResult(result);

    if (result.isHighScore) {
      sound.highScore();
    }

    return result;
  }, []);

  // Check if a score would be a high score
  const checkIsHighScore = useCallback((score) => {
    return isHighScore(score);
  }, []);

  // Clear all high scores
  const resetScores = useCallback(() => {
    clearHighScores();
    setHighScores([]);
    setLastResult(null);
  }, []);

  // Get the highest score
  const getHighestScore = useCallback(() => {
    return highScoresRef.current.length > 0 ? highScoresRef.current[0].score : 0;
  }, []);

  return {
    highScores,
    lastResult,
    submitScore,
    checkIsHighScore,
    resetScores,
    getHighestScore,
  };
}