export default function ScoreBoard({
  score,
  highScore,
  speed,
  foodsEaten,
  gameTime,
  maxSpeedAchieved,
}) {
  // Format game time as mm:ss
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="score-board" role="status" aria-live="polite">
      <div className="score-card score-card-primary">
        <span className="score-label">Score</span>
        <span className="score-value" aria-label={`Current score ${score}`}>{score}</span>
      </div>

      <div className="score-card">
        <span className="score-label">High</span>
        <span className="score-value" aria-label={`High score ${highScore}`}>{highScore}</span>
      </div>

      <div className="score-card">
        <span className="score-label">Speed</span>
        <span className="score-value" aria-label={`Speed ${speed} cells per second`}>{speed}</span>
      </div>

      <div className="score-card">
        <span className="score-label">Food</span>
        <span className="score-value" aria-label={`${foodsEaten} food collected`}>{foodsEaten}</span>
      </div>

      <div className="score-card">
        <span className="score-label">Time</span>
        <span className="score-value" aria-label={`Time played ${formatTime(gameTime)}`}>{formatTime(gameTime)}</span>
      </div>

      <div className="score-card">
        <span className="score-label">Max Speed</span>
        <span className="score-value" aria-label={`Max speed ${maxSpeedAchieved} cells per second`}>{maxSpeedAchieved}</span>
      </div>
    </div>
  );
}