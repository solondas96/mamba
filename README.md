# Mamba

<p align="center">
  <img src="public/mamba-logo.svg" alt="Mamba Logo" width="120" height="120" />
</p>

A modern, feature-rich snake game built with **React 18** and **Vite**, styled with the **Material Design 3** design system. Runs entirely in the browser with no backend — scores persist locally via `localStorage`.

![React](https://img.shields.io/badge/React-18.3-blue?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.4-purple?logo=vite&logoColor=white)
![Material Design 3](https://img.shields.io/badge/Material%20Design-3-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ Features

### 🎮 Core Gameplay
- **Smooth grid-based movement** rendered on HTML5 Canvas at 60 FPS via `requestAnimationFrame`
- **Direction input queue** — rapid keypresses are buffered (max 3) so you never miss a turn
- **Wall & self-collision detection** with instant game-over
- **Progressive difficulty** — speed scales with score:

| Score Range | Speed (cells/sec) |
|-------------|-------------------|
| 0–49        | 6                 |
| 50–99       | 7                 |
| 100–199     | 8                 |
| 200–399     | 9                 |
| 400–599     | 10                |
| 600–799     | 11                |
| 800+        | 12 (capped)       |

- **Smart food spawning** — food never spawns inside the snake body
- **Particle effects** + floating `+10` score popups when food is eaten

### 🎨 UI/UX
- **Material Design 3** color system (primary, secondary, tertiary, error, neutral tokens)
- **Light / Dark / System** theme modes that persist across sessions
- **Roboto** typography with clear hierarchy (headline → title → body → label)
- **Elevated surfaces & shadows** for visual depth
- **Responsive mobile-first layout** — works from 320px to 1920px+
- **Smooth animations** — theme transitions, modal slide-ups, food pulse, snake gradient
- **Game state overlays** drawn directly on the canvas:
  - 🏁 *Idle* — start instructions
  - ⏸ *Paused* — resume hint
  - 💀 *Game Over* — restart prompt

### 🏆 Score & Persistence
- **Top 5 high scores** stored in `localStorage` with timestamps
- **Leaderboard** modal with medals (🥇🥈🥉) and dates
- **Clear History** button to reset all scores
- **New High Score celebration** with rank shown in the game-over modal
- **Cheat-proof** — scores are only recorded at game-over, never writable from the console API

### ⌨️ Controls

| Input          | Action            |
|----------------|-------------------|
| `↑ ↓ ← →`      | Change direction  |
| `W A S D`      | Change direction  |
| `Space`        | Pause / Resume    |
| `Enter`        | Start game        |
| `R`            | Restart game      |
| `Esc`          | Close modal       |
| **Swipe** 👆   | Mobile direction  |
| **Tap** 👆     | Mobile start/pause|

### ⚙️ Settings Panel
- **Grid Size** — 15×15, 20×20, 25×25, 30×30
- **Difficulty** — Easy / Normal / Hard (base speed, speed-increment, and cap differ)
- **Theme** — Light / Dark / System
- **Sound Effects** — on/off (Web Audio API, muted by default)
- **Show Grid** — toggle grid lines on the canvas
- **Reduced Motion** — disables food pulse and canvas animations

### 🔊 Sound Effects
All sounds are generated programmatically with the **Web Audio API** — zero audio files needed:

| Event      | Sound                           |
|------------|---------------------------------|
| Eat food   | Ascending sine blip             |
| Game over  | Descending sawtooth tones       |
| High score | 4-note fanfare                  |
| Start      | Rising triangle confirmation    |
| Pause      | Double square blip              |
| UI click   | Short square tick               |

### ♿ Accessibility
- ✅ Full keyboard navigation with visible focus rings
- ✅ ARIA labels, roles, and `aria-live` regions for scores
- ✅ Focus management — modals trap and restore focus on open/close
- ✅ WCAG AA color contrast in both themes
- ✅ Respects `prefers-reduced-motion` media query
- ✅ Respects `prefers-contrast: more` with enhanced borders

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ (Vite 6 requirement)
- **npm** (or your favorite package manager)

### Installation

```bash
# Clone the repository
git clone https://github.com/solondas96/mamba.git
cd mamba

# Install dependencies
npm install

# Start the dev server (http://localhost:5173)
npm run dev

# Build for production (outputs to dist/)
npm run build

# Preview the production build
npm run preview
```

---

## 📁 Project Structure

```
mamba/
├── index.html                  # HTML entry point (fonts, meta, favicon)
├── package.json                # Dependencies & scripts
├── vite.config.js              # Vite configuration
├── dist/                       # Production build output
│
└── src/
    ├── main.jsx                # React entry point
    ├── App.jsx                 # Root component — wires hooks & modals together
    ├── styles.css              # Global Material Design 3 styles
    │
    ├── components/
    │   ├── GameCanvas.jsx      # Canvas renderer (snake, food, particles, overlays)
    │   ├── Header.jsx          # Title bar with theme/settings/help actions
    │   ├── ScoreBoard.jsx      # Score/Speed/Food/Time/MaxSpeed stat cards
    │   ├── Controls.jsx        # Start / Pause / Resume / Restart buttons
    │   └── Modals.jsx          # Settings, Leaderboard, Info, GameOver dialogs
    │
    ├── hooks/
    │   ├── useGame.js          # Game state machine, loop, collision, input queue
    │   ├── useScores.js        # High-score persistence (debounced localStorage)
    │   └── useTheme.js         # Light/Dark/System theme resolution
    │
    └── utils/
        ├── constants.js        # Colors, difficulty table, key maps, defaults
        ├── storage.js          # Safe localStorage wrappers + high-score logic
        └── sound.js            # Web Audio API sound generator
```

---

## 🧠 Architecture & Design Decisions

### Game Loop
The game uses a **fixed-timestep pattern** inside `requestAnimationFrame`:

```
requestAnimationFrame(loop)
  └─ if (now - lastMove >= 1000 / speed) → gameStep()
  └─ update particles & score popups
```

- `speed` is stored in a **ref** so the loop reads the latest value without re-renders
- All mutable game data uses refs (`snakeRef`, `directionQueueRef`, etc.) to avoid stale closures inside the animation loop
- React state updates (`setSnake`, `setScore`, …) trigger re-renders only for **UI elements**, not the loop itself

### Direction Queue
Keypresses push into a bounded queue (max 3). Each game step:
1. Pop the next queued direction
2. Reject it if it's the *opposite* of the current direction (prevents 180° turns)
3. Apply it to the head velocity

This makes the controls feel responsive even during rapid key mashing.

### Collision Detection
- **Wall** — new head coordinate outside `[0, gridSize)`
- **Self** — new head matches any body segment. The tail is excluded when the snake isn't growing (it moves away that tick)

### Color System
CSS custom properties are set dynamically by `useTheme`:

```js
Object.entries(colors).forEach(([key, value]) => {
  root.style.setProperty(`--md-${key}`, value);
});
```

Every component consumes tokens like `var(--md-primary)` — switching themes is a single class-free re-paint.

### Persistence Model
```
localStorage
├── mamba-snake-high-scores   → [{ score, date, id }]  (sorted, max 5)
├── mamba-snake-settings      → { gridSize, difficulty, soundEnabled, … }
└── mamba-snake-theme         → "light" | "dark" | "system"
```

High-score writes are **debounced (300 ms)** to avoid I/O thrash on `localStorage`.

### Performance Optimizations
- Canvas rendering (no DOM churn per frame)
- `useCallback` / `useMemo` throughout to minimize re-renders
- DPR-aware canvas sizing for crisp retinas
- Debounced localStorage writes
- Particle count capped by lifetime decay (auto-expire)
- Zero runtime dependencies beyond React itself

---

## 🧪 Testing Checklist

- [x] Snake moves correctly & direction queue works
- [x] Food spawns randomly, never on snake
- [x] Wall & self collisions trigger game over
- [x] High scores persist and reload from localStorage
- [x] Responsive from 320px to 1920px+
- [x] 60 FPS on mid-range hardware
- [x] Tab navigation + screen-reader friendly landmarks
- [x] Touch swipe controls (no layout shift)
- [x] Dark mode contrast is WCAG-compliant

---

## 📦 Deployment

### Vercel

```bash
npm i -g vercel
vercel            # framework preset: Vite, build: npm run build, output: dist
```

### Netlify

```bash
npm i -g netlify-cli
netlify init      # build command: npm run build, publish dir: dist
```

### GitHub Pages
Set `base: './'` (already configured in `vite.config.js`), then:

```bash
npm run build
npx gh-pages -d dist
```

### Static Hosting
Any static file server works — `dist/` contains only `index.html`, CSS, and JS.

---

## 📖 How to Play

1. Click **Start** (or press `Enter`)
2. Use **arrow keys / WASD** to steer the snake
3. Eat the red food to grow +10 points
4. Speed increases every 50 points — stay ahead!
5. Don't hit walls or your own tail
6. Score lands in the **Top 5** → it's saved to the leaderboard 🏆

---

## 🛠️ Customization

### Add a Difficulty Preset
Edit `DIFFICULTY_PRESETS` in `src/utils/constants.js`:

```js
export const DIFFICULTY_PRESETS = {
  easy:   { baseSpeed: 5, maxSpeed: 8,  speedIncrement: 0.5 },
  normal: { baseSpeed: 6, maxSpeed: 12, speedIncrement: 1 },
  hard:   { baseSpeed: 8, maxSpeed: 15, speedIncrement: 1.5 },
};
```

### Change Grid Sizes
Add/remove entries in `GRID_SIZE_OPTIONS`:

```js
export const GRID_SIZE_OPTIONS = [15, 20, 25, 30];
```

### Restyle the Theme
Modify `LIGHT_COLORS` / `DARK_COLORS` in `src/utils/constants.js` — all tokens follow the [Material Design 3 color spec](https://m3.material.io/styles/color/overview):

```js
export const LIGHT_COLORS = {
  primary: '#6200EE',
  secondary: '#03DAC6',
  tertiary: '#FF6D00',
  error: '#CF6679',
  // … full token set
};
```

### Adjust Difficulty Curve
The speed formula lives in `useGame.js`:

```js
const levels = Math.floor(currentScore / 50);
return Math.min(preset.baseSpeed + levels * preset.speedIncrement, preset.maxSpeed);
```

---

## 🔮 Roadmap (Optional Enhancements)

- [ ] Multiplayer via WebSockets
- [ ] Achievements / badges (100 pts, speed 10+, 20 foods)
- [ ] Power-ups (speed boost, shield, teleport)
- [ ] Custom user color themes
- [ ] Replay recording & playback
- [ ] Social score sharing
- [ ] PWA install + offline support
- [ ] Sound toggle shortcut (`M` key)

---

## 🧑‍💻 Tech Stack

| Layer      | Choice                                  |
|------------|-----------------------------------------|
| Framework  | React 18 (Hooks only)                   |
| Build tool | Vite 6                                  |
| Rendering  | HTML5 Canvas 2D                         |
| Styling    | Hand-rolled CSS with MD3 design tokens  |
| Persistence| localStorage (safe wrappers)            |
| Audio      | Web Audio API (programmatic)            |
| Language   | JavaScript (ES modules)                 |

**Bundle size:** ~56 kB JS + ~3 kB CSS gzipped — loads in under 2s on mid-range networks.

---

## 📄 License

MIT — free to use, modify, and distribute.

---

**Built with ❤️ for a smooth, engaging gaming experience.**