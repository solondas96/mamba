// Web Audio API sound effects - generated programmatically, no external files needed
let audioContext = null;
let enabled = true;

function getAudioContext() {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported', error);
      return null;
    }
  }
  return audioContext;
}

function playTone(frequency, duration, type = 'sine', volume = 0.15, delay = 0) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    if (ctx.state === 'suspended') ctx.resume();

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const startTime = ctx.currentTime + delay;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);

    // Envelope for smooth attack/decay
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.05);
  } catch (error) {
    console.warn('Failed to play sound', error);
  }
}

export const sound = {
  setEnabled(value) {
    enabled = value;
  },

  eat() {
    // Pleasant ascending blip
    playTone(440, 0.08, 'sine', 0.12);
    playTone(660, 0.1, 'sine', 0.1, 0.05);
  },

  gameOver() {
    // Descending sad tones
    playTone(400, 0.2, 'sawtooth', 0.1);
    playTone(300, 0.2, 'sawtooth', 0.1, 0.15);
    playTone(200, 0.4, 'sawtooth', 0.1, 0.3);
  },

  start() {
    // Short rising confirmation
    playTone(523, 0.1, 'triangle', 0.12);
    playTone(784, 0.15, 'triangle', 0.12, 0.08);
  },

  pause() {
    // Two short blips
    playTone(500, 0.06, 'square', 0.08);
    playTone(500, 0.06, 'square', 0.08, 0.1);
  },

  highScore() {
    // Fanfare
    playTone(523, 0.15, 'triangle', 0.12);
    playTone(659, 0.15, 'triangle', 0.12, 0.12);
    playTone(784, 0.15, 'triangle', 0.12, 0.24);
    playTone(1047, 0.3, 'triangle', 0.15, 0.36);
  },

  click() {
    // UI click
    playTone(800, 0.03, 'square', 0.05);
  },
};