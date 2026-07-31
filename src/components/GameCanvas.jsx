import { useEffect, useRef, useCallback } from 'react';
import { GAME_STATES } from '../utils/constants';

export default function GameCanvas({
  snake,
  food,
  gridSize,
  gameState,
  colors,
  showGrid,
  particles,
  scorePopups,
  reducedMotion,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Calculate canvas size based on container
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const size = Math.min(containerWidth, containerHeight, 600);
    const dpr = window.devicePixelRatio || 1;

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  // Handle resize
  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  // Draw rounded rectangle with fallback for older browsers
  const drawRoundRect = useCallback((ctx, x, y, width, height, radius) => {
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, width, height, radius);
    } else {
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    }
  }, []);

  // Draw the game
  const draw = useCallback((timestamp) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const size = canvas.width / (window.devicePixelRatio || 1);
    const cellSize = size / gridSize;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw background
    ctx.fillStyle = colors.surface;
    ctx.fillRect(0, 0, size, size);

    // Draw grid lines
    if (showGrid) {
      ctx.strokeStyle = colors.outlineVariant;
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = 0.3;

      for (let i = 1; i < gridSize; i++) {
        const pos = i * cellSize;
        ctx.beginPath();
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, size);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, pos);
        ctx.lineTo(size, pos);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // Draw food with pulse animation
    if (food) {
      const pulse = reducedMotion ? 1 : 1 + Math.sin(timestamp / 300) * 0.08;
      const foodSize = cellSize * 0.4 * pulse;
      const foodX = food.x * cellSize + cellSize / 2;
      const foodY = food.y * cellSize + cellSize / 2;

      // Glow effect
      const glowGradient = ctx.createRadialGradient(foodX, foodY, 0, foodX, foodY, foodSize * 2.5);
      glowGradient.addColorStop(0, colors.error);
      glowGradient.addColorStop(1, 'transparent');
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(foodX, foodY, foodSize * 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Food circle
      ctx.fillStyle = colors.error;
      ctx.beginPath();
      ctx.arc(foodX, foodY, foodSize, 0, Math.PI * 2);
      ctx.fill();

      // Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(foodX - foodSize * 0.25, foodY - foodSize * 0.25, foodSize * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw snake
    if (snake.length > 0) {
      // Draw body segments (from tail to head for layering)
      for (let i = snake.length - 1; i >= 0; i--) {
        const segment = snake[i];
        const isHead = i === 0;
        const x = segment.x * cellSize;
        const y = segment.y * cellSize;

        // Calculate color based on position (gradient effect)
        const ratio = i / Math.max(snake.length - 1, 1);

        if (isHead) {
          // Head - brighter, rounded square
          ctx.fillStyle = colors.primary;
          const headPadding = cellSize * 0.08;
          const headSize = cellSize - headPadding * 2;
          const headX = x + headPadding;
          const headY = y + headPadding;

          // Rounded rectangle for head
          const radius = cellSize * 0.3;
          ctx.beginPath();
          drawRoundRect(ctx, headX, headY, headSize, headSize, radius);
          ctx.fill();

          // Eyes
          const eyeSize = cellSize * 0.12;
          const eyeOffset = cellSize * 0.2;
          ctx.fillStyle = colors.onPrimary;

          // Determine eye positions based on direction (approximate from next segment)
          const nextSegment = snake[1];
          let eyeX1, eyeY1, eyeX2, eyeY2;
          const headCenterX = x + cellSize / 2;
          const headCenterY = y + cellSize / 2;

          if (nextSegment) {
            const dx = headCenterX - (nextSegment.x * cellSize + cellSize / 2);
            const dy = headCenterY - (nextSegment.y * cellSize + cellSize / 2);

            if (Math.abs(dx) > Math.abs(dy)) {
              // Moving horizontally
              const dir = dx > 0 ? 1 : -1;
              eyeX1 = headCenterX + dir * eyeOffset;
              eyeX2 = headCenterX + dir * eyeOffset;
              eyeY1 = headCenterY - eyeOffset;
              eyeY2 = headCenterY + eyeOffset;
            } else {
              // Moving vertically
              const dir = dy > 0 ? 1 : -1;
              eyeX1 = headCenterX - eyeOffset;
              eyeX2 = headCenterX + eyeOffset;
              eyeY1 = headCenterY + dir * eyeOffset;
              eyeY2 = headCenterY + dir * eyeOffset;
            }
          } else {
            eyeX1 = headCenterX + eyeOffset;
            eyeX2 = headCenterX + eyeOffset;
            eyeY1 = headCenterY - eyeOffset;
            eyeY2 = headCenterY + eyeOffset;
          }

          ctx.beginPath();
          ctx.arc(eyeX1, eyeY1, eyeSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(eyeX2, eyeY2, eyeSize, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Body - rounded segments with gradient
          const padding = cellSize * 0.12;
          const bodySize = cellSize - padding * 2;
          const bodyX = x + padding;
          const bodyY = y + padding;

          // Interpolate between primary and secondary colors
          const r = Math.round(
            parseInt(colors.primary.slice(1, 3), 16) * (1 - ratio) +
            parseInt(colors.secondary.slice(1, 3), 16) * ratio
          );
          const g = Math.round(
            parseInt(colors.primary.slice(3, 5), 16) * (1 - ratio) +
            parseInt(colors.secondary.slice(3, 5), 16) * ratio
          );
          const b = Math.round(
            parseInt(colors.primary.slice(5, 7), 16) * (1 - ratio) +
            parseInt(colors.secondary.slice(5, 7), 16) * ratio
          );

          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          ctx.globalAlpha = 0.85 + ratio * 0.15;

          const radius = cellSize * 0.25;
          ctx.beginPath();
          drawRoundRect(ctx, bodyX, bodyY, bodySize, bodySize, radius);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }
    }

    // Draw particles
    if (particles.length > 0) {
      particles.forEach((p) => {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x * cellSize, p.y * cellSize, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    }

    // Draw score popups
    if (scorePopups.length > 0) {
      scorePopups.forEach((p) => {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = colors.tertiary;
        ctx.font = `bold ${cellSize * 0.6}px Roboto, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`+${p.points}`, p.x * cellSize, p.y * cellSize);
      });
      ctx.globalAlpha = 1;
    }

    // Draw game state overlays
    if (gameState === GAME_STATES.IDLE) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, size, size);

      // Draw material snake logo
      const logoScale = cellSize * 0.25;
      const logoCenterX = size / 2;
      const logoCenterY = size / 2 - cellSize * 1.5;

      // Snake body - S-curve with gradient
      const bodyGradient = ctx.createLinearGradient(
        logoCenterX - 3 * logoScale, logoCenterY + 2 * logoScale,
        logoCenterX + 3 * logoScale, logoCenterY - 2 * logoScale
      );
      bodyGradient.addColorStop(0, colors.primary);
      bodyGradient.addColorStop(0.5, colors.secondary);
      bodyGradient.addColorStop(1, colors.tertiary);

      ctx.strokeStyle = bodyGradient;
      ctx.lineWidth = logoScale * 0.75;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(logoCenterX - 3.2 * logoScale, logoCenterY + 2.2 * logoScale);
      ctx.bezierCurveTo(
        logoCenterX - 4.2 * logoScale, logoCenterY + 0.8 * logoScale,
        logoCenterX - 2.4 * logoScale, logoCenterY + 0.2 * logoScale,
        logoCenterX - 1.6 * logoScale, logoCenterY + 0.5 * logoScale
      );
      ctx.bezierCurveTo(
        logoCenterX - 0.8 * logoScale, logoCenterY + 0.8 * logoScale,
        logoCenterX - 1.1 * logoScale, logoCenterY - 0.6 * logoScale,
        logoCenterX - 0.1 * logoScale, logoCenterY - 0.6 * logoScale
      );
      ctx.bezierCurveTo(
        logoCenterX + 0.9 * logoScale, logoCenterY - 0.6 * logoScale,
        logoCenterX + 0.6 * logoScale, logoCenterY - 2 * logoScale,
        logoCenterX + 1.7 * logoScale, logoCenterY - 2.2 * logoScale
      );
      ctx.bezierCurveTo(
        logoCenterX + 2.6 * logoScale, logoCenterY - 2.4 * logoScale,
        logoCenterX + 3.2 * logoScale, logoCenterY - 3 * logoScale,
        logoCenterX + 3.2 * logoScale, logoCenterY - 4 * logoScale
      );
      ctx.stroke();

      // Snake head - rounded rectangle
      const headGradient = ctx.createLinearGradient(
        logoCenterX + 2 * logoScale, logoCenterY - 4.8 * logoScale,
        logoCenterX + 3.6 * logoScale, logoCenterY - 3 * logoScale
      );
      headGradient.addColorStop(0, '#7C4DFF');
      headGradient.addColorStop(1, colors.primary);

      ctx.fillStyle = headGradient;
      const headSize = logoScale * 1.4;
      const headX = logoCenterX + 2 * logoScale;
      const headY = logoCenterY - 4.8 * logoScale;
      const headRadius = logoScale * 0.6;
      ctx.beginPath();
      drawRoundRect(ctx, headX, headY, headSize, headSize, headRadius);
      ctx.fill();

      // Tongue fork
      ctx.strokeStyle = colors.tertiary;
      ctx.lineWidth = logoScale * 0.22;
      const tongueBaseX = headX + headSize + logoScale * 0.15;
      const tongueY = headY + headSize * 0.5;
      ctx.beginPath();
      ctx.moveTo(tongueBaseX, tongueY);
      ctx.lineTo(tongueBaseX + logoScale * 0.4, tongueY - logoScale * 0.3);
      ctx.moveTo(tongueBaseX, tongueY);
      ctx.lineTo(tongueBaseX + logoScale * 0.4, tongueY + logoScale * 0.3);
      ctx.stroke();

      // Eye
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(headX + headSize * 0.68, headY + headSize * 0.35, logoScale * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1C1B1F';
      ctx.beginPath();
      ctx.arc(headX + headSize * 0.74, headY + headSize * 0.28, logoScale * 0.07, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = colors.onBackground;
      ctx.font = `bold ${cellSize * 0.8}px Roboto, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Press Start or Enter', size / 2, size / 2 + cellSize * 0.5);

      ctx.font = `${cellSize * 0.4}px Roboto, sans-serif`;
      ctx.fillStyle = colors.onSurfaceVariant;
      ctx.fillText('Arrow keys / WASD to move', size / 2, size / 2 + cellSize * 1.5);
      ctx.fillText('Space to pause · R to restart', size / 2, size / 2 + cellSize * 2.2);
    } else if (gameState === GAME_STATES.PAUSED) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, size, size);

      ctx.fillStyle = colors.onBackground;
      ctx.font = `bold ${cellSize * 1}px Roboto, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⏸ Paused', size / 2, size / 2 - cellSize * 0.5);

      ctx.font = `${cellSize * 0.4}px Roboto, sans-serif`;
      ctx.fillStyle = colors.onSurfaceVariant;
      ctx.fillText('Press Space or Resume to continue', size / 2, size / 2 + cellSize * 0.8);
    } else if (gameState === GAME_STATES.GAME_OVER) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, size, size);

      ctx.fillStyle = colors.error;
      ctx.font = `bold ${cellSize * 1}px Roboto, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Game Over', size / 2, size / 2 - cellSize * 1);

      ctx.fillStyle = colors.onBackground;
      ctx.font = `bold ${cellSize * 0.7}px Roboto, sans-serif`;
      ctx.fillText('Press Enter or Restart', size / 2, size / 2 + cellSize * 0.5);
    }
  }, [snake, food, gridSize, gameState, colors, showGrid, particles, scorePopups, reducedMotion, drawRoundRect]);

  // Animation loop
  useEffect(() => {
    const animate = (timestamp) => {
      draw(timestamp);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [draw]);

  return (
    <div
      ref={containerRef}
      className="game-canvas-container"
      role="img"
      aria-label={`Snake game grid. Score: ${snake.length - 3} food collected.`}
    >
      <canvas
        ref={canvasRef}
        className="game-canvas"
        aria-hidden="true"
      />
    </div>
  );
}