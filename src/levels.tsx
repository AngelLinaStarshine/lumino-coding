/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { Zap, Target, RotateCcw, Star, Sparkles, Hash, Palette, HelpCircle } from 'lucide-react';

export interface LevelQuest {
  id: string;
  title: string;
  description: string;
  xp: number;
  icon: React.ReactNode;
  /** JS snippet to detect completion (level-specific) */
  check: (html: string, css: string, js: string) => boolean;
}

export interface Level {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  emoji: string;
  html: string;
  css: string;
  js: string;
  quests: LevelQuest[];
  starterMessages: { text: string; sender: 'bot' }[];
  proTip: string;
}

// --- Level 1: Balloon Lift ---
const LV1_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Balloon Lift</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <main class="app">
    <header class="bar">
      <h1>🎈 Balloon Lift</h1>
      <button id="upBtn" type="button">UP</button>
    </header>

    <section id="stage" class="stage" aria-label="Balloon stage">
      <div class="balloon b1" data-lift="0"><span class="string"></span></div>
      <div class="balloon b2" data-lift="0"><span class="string"></span></div>
      <div class="balloon b3" data-lift="0"><span class="string"></span></div>
      <div class="balloon b4" data-lift="0"><span class="string"></span></div>
      <div class="balloon b5" data-lift="0"><span class="string"></span></div>
      <div class="ground"></div>
    </section>

    <p class="note">
      Click <strong>UP</strong> to lift all balloons by <strong>60px</strong>. When a balloon reaches the top, it wraps back down.
    </p>
  </main>

  <script src="script.js"></script>
</body>
</html>`;

const LV1_CSS = `:root{
  --bg: #f2fbff;
  --card: #ffffff;
  --text: #121212;
}

*{ box-sizing: border-box; }
body{
  margin:0;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  background: var(--bg);
  color: var(--text);
  display:flex;
  justify-content:center;
  padding: 18px;
}

.app{
  width: min(860px, 100%);
  background: var(--card);
  border: 1px solid rgba(0,0,0,.10);
  border-radius: 16px;
  box-shadow: 0 10px 24px rgba(0,0,0,.08);
  overflow:hidden;
}

.bar{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(0,0,0,.08);
}

.bar h1{ margin:0; font-size: 16px; font-weight: 800; }

button{
  border:0;
  background:#111;
  color:#fff;
  padding: 10px 14px;
  border-radius: 12px;
  cursor:pointer;
  font-weight: 800;
  letter-spacing: .02em;
}
button:active{ transform: translateY(1px); }

.stage{
  position: relative;
  height: 420px;
  background: linear-gradient(#eaf9ff, #ffffff 70%);
  overflow:hidden;
}

.ground{
  position:absolute;
  left:0; right:0; bottom:0;
  height: 90px;
  background: linear-gradient(#ffffff, #e8f6e8);
  border-top: 1px solid rgba(0,0,0,.04);
}

.balloon{
  position:absolute;
  bottom: 20px;
  width: 64px;
  height: 76px;
  border-radius: 50% 50% 45% 45%;
  transition: transform 350ms ease;
  box-shadow: inset -10px -10px 0 rgba(0,0,0,.08);
}

.balloon::after{
  content:"";
  position:absolute;
  bottom:-10px;
  left:50%;
  transform: translateX(-50%);
  width: 14px;
  height: 14px;
  background: inherit;
  clip-path: polygon(50% 100%, 0 0, 100% 0);
  filter: brightness(.96);
}

.string{
  position:absolute;
  left: 50%;
  top: 70px;
  width:2px;
  height: 80px;
  background: rgba(0,0,0,.25);
  transform: translateX(-50%);
  border-radius: 2px;
}

.b1{ left: 90px;  background:#ff5c7a; }
.b2{ left: 210px; background:#ffd166; }
.b3{ left: 330px; background:#06d6a0; }
.b4{ left: 450px; background:#4ea8de; }
.b5{ left: 570px; background:#c77dff; }

.note{
  margin:0;
  padding: 10px 14px 14px;
  font-size: 13px;
  color: rgba(0,0,0,.70);
}`;

const LV1_JS = `// Balloon Lift - Level 1
// TASK 1: Select the UP button and the balloons.
// TASK 2: Add a click event listener to the UP button.
// TASK 3: Loop through each balloon and increase its 'lift'.

const STEP = 60;

// TODO: Select the button with id "upBtn"
const upBtn = null; 

// TODO: Select all elements with class "balloon"
const balloons = [];

function maxLift(){
  const stage = document.getElementById("stage");
  return stage.clientHeight - 100;
}

// TODO: Add click listener to upBtn
// Inside: loop balloons, update dataset.lift, wrap at top, set style.transform
`;

// --- Level 2: Click Counter ---
const LV2_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Click Counter</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <main class="app">
    <h1>🔢 Click Counter</h1>
    <div class="display">
      <span id="count">0</span>
    </div>
    <div class="controls">
      <button id="decrement">−</button>
      <button id="reset">Reset</button>
      <button id="increment">+</button>
    </div>
    <p class="note">Make the + and − buttons update the number. Reset should set it to 0.</p>
  </main>
  <script src="script.js"></script>
</body>
</html>`;

const LV2_CSS = `*{ box-sizing: border-box; }
body{
  margin:0;
  font-family: system-ui, sans-serif;
  background: #1a1a2e;
  color: #eee;
  display:flex;
  justify-content:center;
  align-items:center;
  min-height:100vh;
}

.app{
  text-align:center;
  padding: 2rem;
}

h1{ font-size: 1.5rem; margin-bottom: 2rem; }

.display{
  font-size: 4rem;
  font-weight: 800;
  margin-bottom: 2rem;
  padding: 1.5rem 2.5rem;
  background: #16213e;
  border-radius: 16px;
  display: inline-block;
  min-width: 120px;
}

.controls{
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

button{
  width: 56px;
  height: 56px;
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.15s;
}
button:active{ transform: scale(0.95); }

#increment{ background: #06d6a0; color: #0f172a; }
#decrement{ background: #ef476f; color: white; }
#reset{ background: #64748b; color: white; width: auto; padding: 0 1.5rem; border-radius: 28px; }

.note{ margin-top: 2rem; font-size: 0.85rem; opacity: 0.7; }`;

const LV2_JS = `// Click Counter - Level 2
// TASK 1: Select the count span and all three buttons.
// TASK 2: Add click listeners to increment, decrement, and reset.
// TASK 3: Update the displayed number when buttons are clicked.

// TODO: Select the element showing the count
const countEl = null;

// TODO: Select increment, decrement, reset buttons
const incrementBtn = null;
const decrementBtn = null;
const resetBtn = null;

// TODO: Track the current count (start at 0)
let count = 0;

// TODO: Function to update the display
function updateDisplay() {
  // countEl.textContent = count;
}

// TODO: Add click listeners
`;

// --- Level 3: RGB Color Mixer ---
const LV3_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>RGB Color Mixer</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <main class="app">
    <h1>🎨 RGB Color Mixer</h1>
    <div id="swatch" class="swatch"></div>
    <div class="sliders">
      <label>R <input type="range" id="r" min="0" max="255" value="128"></label>
      <label>G <input type="range" id="g" min="0" max="255" value="128"></label>
      <label>B <input type="range" id="b" min="0" max="255" value="128"></label>
    </div>
    <p id="rgbText" class="rgb-text">rgb(128, 128, 128)</p>
  </main>
  <script src="script.js"></script>
</body>
</html>`;

const LV3_CSS = `*{ box-sizing: border-box; }
body{
  margin:0;
  font-family: system-ui, sans-serif;
  background: #0f172a;
  color: #f8fafc;
  display:flex;
  justify-content:center;
  align-items:center;
  min-height:100vh;
}

.app{
  text-align:center;
  padding: 2rem;
}

h1{ font-size: 1.5rem; margin-bottom: 2rem; }

.swatch{
  width: 200px;
  height: 200px;
  margin: 0 auto 2rem;
  border-radius: 16px;
  background: rgb(128,128,128);
  box-shadow: 0 10px 40px rgba(0,0,0,0.4);
}

.sliders{
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 300px;
  margin: 0 auto;
}

label{
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

input[type="range"]{
  flex: 1;
  height: 8px;
  border-radius: 4px;
  accent-color: #f97316;
}

.rgb-text{
  margin-top: 1rem;
  font-family: monospace;
  font-size: 0.9rem;
  opacity: 0.8;
}`;

const LV3_JS = `// RGB Color Mixer - Level 3
// TASK 1: Select the swatch div and all three range inputs.
// TASK 2: Add 'input' event listeners to each slider.
// TASK 3: Read slider values and update the swatch background + rgb text.

const swatch = null;
const rInput = null;
const gInput = null;
const bInput = null;
const rgbText = null;

function updateColor() {
  // const r = rInput.value;
  // const g = gInput.value;
  // const b = bInput.value;
  // swatch.style.background = \`rgb(\${r}, \${g}, \${b})\`;
  // rgbText.textContent = \`rgb(\${r}, \${g}, \${b})\`;
}

// TODO: Add input listeners to each slider, call updateColor
`;

// --- Level 4: Mini Quiz ---
const LV4_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Mini Quiz</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <main class="app">
    <h1>📚 Quick Quiz</h1>
    <p id="question">What does CSS stand for?</p>
    <div class="options">
      <button class="opt" data-correct="true">Cascading Style Sheets</button>
      <button class="opt" data-correct="false">Computer Style System</button>
      <button class="opt" data-correct="false">Creative Style Setup</button>
    </div>
    <p id="feedback" class="feedback"></p>
  </main>
  <script src="script.js"></script>
</body>
</html>`;

const LV4_CSS = `*{ box-sizing: border-box; }
body{
  margin:0;
  font-family: system-ui, sans-serif;
  background: linear-gradient(135deg, #1e293b, #0f172a);
  color: #f8fafc;
  display:flex;
  justify-content:center;
  align-items:center;
  min-height:100vh;
}

.app{
  max-width: 400px;
  padding: 2rem;
}

h1{ font-size: 1.5rem; margin-bottom: 1.5rem; }

#question{
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.options{
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.opt{
  padding: 1rem 1.25rem;
  border: 2px solid #334155;
  border-radius: 12px;
  background: #1e293b;
  color: #f8fafc;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}
.opt:hover{ border-color: #f97316; background: #334155; }
.opt.correct{ border-color: #22c55e; background: #166534; }
.opt.wrong{ border-color: #ef4444; background: #991b1b; }

.feedback{
  margin-top: 1.5rem;
  font-weight: 600;
  min-height: 1.5em;
}`;

const LV4_JS = `// Mini Quiz - Level 4
// TASK 1: Select all option buttons and the feedback paragraph.
// TASK 2: Add click listeners to each option.
// TASK 3: When clicked, check data-correct. If true, show "Correct! 🎉", else "Try again!"

const options = null;
const feedback = null;

// TODO: Loop options, add click listener
// On click: if (btn.dataset.correct === "true") show correct msg, else show wrong msg
`;

// --- Levels config ---
export const LEVELS: Level[] = [
  {
    id: 'balloon',
    title: 'Balloon Lift',
    description: 'Select elements, add event listeners, and loop through balloons.',
    difficulty: 'beginner',
    emoji: '🎈',
    html: LV1_HTML,
    css: LV1_CSS,
    js: LV1_JS,
    quests: [
      { id: 'run', title: 'The Spark', description: 'Run your code for the first time.', xp: 50, icon: <Zap size={16} />, check: () => true },
      { id: 'select', title: 'The Selector', description: 'Select the UP button and balloons in JS.', xp: 100, icon: <Target size={16} />, check: (_, __, js) => js.includes('getElementById("upBtn")') && js.includes('querySelectorAll(".balloon")') },
      { id: 'loop', title: 'The Loop', description: 'Add a forEach loop to move balloons.', xp: 150, icon: <RotateCcw size={16} />, check: (_, __, js) => js.includes('.forEach') && js.includes('style.transform') },
      { id: 'color', title: 'Color Splash', description: 'Change a balloon color in CSS.', xp: 100, icon: <Star size={16} />, check: (_, css) => css !== LV1_CSS },
      { id: 'asset', title: 'Artistic Touch', description: 'Generate an asset in the Lab.', xp: 200, icon: <Sparkles size={16} />, check: () => false },
    ],
    starterMessages: [
      { text: "Hi! I'm Flame Bot 🔥 Here to help with Level 1: Balloon Lift.", sender: 'bot' },
      { text: "Tip: Use querySelectorAll('.balloon') to get all balloons.", sender: 'bot' },
      { text: "Tip: Use balloon.dataset.lift to store movement. Set style.transform for position.", sender: 'bot' },
    ],
    proTip: "Use CSS transition on .balloon for smooth movement!",
  },
  {
    id: 'counter',
    title: 'Click Counter',
    description: 'Handle multiple buttons and update DOM text.',
    difficulty: 'intermediate',
    emoji: '🔢',
    html: LV2_HTML,
    css: LV2_CSS,
    js: LV2_JS,
    quests: [
      { id: 'run', title: 'Run It', description: 'Run your code.', xp: 50, icon: <Zap size={16} />, check: () => true },
      { id: 'select', title: 'Select Elements', description: 'Select count span and all three buttons.', xp: 100, icon: <Target size={16} />, check: (_, __, js) => js.includes('getElementById("count")') && js.includes('getElementById("increment")') },
      { id: 'increment', title: 'Increment Works', description: 'Make + button increase the count.', xp: 150, icon: <Hash size={16} />, check: (_, __, js) => js.includes('++') || js.includes('+ 1') || js.includes('+= 1') },
      { id: 'decrement', title: 'Decrement Works', description: 'Make − button decrease the count.', xp: 150, icon: <RotateCcw size={16} />, check: (_, __, js) => js.includes('--') || js.includes('- 1') || js.includes('-= 1') },
      { id: 'asset', title: 'Artistic Touch', description: 'Generate an asset in the Lab.', xp: 200, icon: <Sparkles size={16} />, check: () => false },
    ],
    starterMessages: [
      { text: "Level 2: Click Counter! You'll wire up + and − buttons.", sender: 'bot' },
      { text: "Tip: Use getElementById for 'count', 'increment', 'decrement', 'reset'.", sender: 'bot' },
      { text: "Tip: countEl.textContent = count updates the display.", sender: 'bot' },
    ],
    proTip: "Keep a single 'count' variable and update it in each button's click handler.",
  },
  {
    id: 'colorpicker',
    title: 'RGB Color Mixer',
    description: 'Use range inputs and input events for real-time updates.',
    difficulty: 'advanced',
    emoji: '🎨',
    html: LV3_HTML,
    css: LV3_CSS,
    js: LV3_JS,
    quests: [
      { id: 'run', title: 'Run It', description: 'Run your code.', xp: 50, icon: <Zap size={16} />, check: () => true },
      { id: 'select', title: 'Select Sliders', description: 'Select swatch and all three range inputs.', xp: 100, icon: <Target size={16} />, check: (_, __, js) => js.includes('getElementById("r")') && js.includes('getElementById("swatch")') },
      { id: 'input', title: 'Input Listeners', description: "Add 'input' event listeners to sliders.", xp: 150, icon: <Palette size={16} />, check: (_, __, js) => js.includes("'input'") || js.includes('"input"') },
      { id: 'update', title: 'Update Swatch', description: 'Update swatch background with rgb(r,g,b).', xp: 200, icon: <Star size={16} />, check: (_, __, js) => js.includes('style.background') && js.includes('rgb') },
      { id: 'asset', title: 'Artistic Touch', description: 'Generate an asset in the Lab.', xp: 200, icon: <Sparkles size={16} />, check: () => false },
    ],
    starterMessages: [
      { text: "Level 3: RGB Color Mixer! Sliders control Red, Green, Blue values.", sender: 'bot' },
      { text: "Tip: range inputs use .value (a string). Use it in rgb(r,g,b).", sender: 'bot' },
      { text: "Tip: Add 'input' event listeners so it updates as you drag.", sender: 'bot' },
    ],
    proTip: "input.value returns a string—it still works in template literals like rgb(r, g, b).",
  },
  {
    id: 'quiz',
    title: 'Mini Quiz',
    description: 'Handle click events, dataset attributes, and conditional logic.',
    difficulty: 'expert',
    emoji: '📚',
    html: LV4_HTML,
    css: LV4_CSS,
    js: LV4_JS,
    quests: [
      { id: 'run', title: 'Run It', description: 'Run your code.', xp: 50, icon: <Zap size={16} />, check: () => true },
      { id: 'select', title: 'Select Options', description: 'Select all option buttons and feedback element.', xp: 100, icon: <Target size={16} />, check: (_, __, js) => js.includes('querySelectorAll') && js.includes('.opt') },
      { id: 'dataset', title: 'Check data-correct', description: "Use dataset.correct to know if an option is correct.", xp: 150, icon: <HelpCircle size={16} />, check: (_, __, js) => js.includes('dataset.correct') || js.includes('getAttribute("data-correct")') },
      { id: 'feedback', title: 'Show Feedback', description: 'Display correct or try-again message.', xp: 200, icon: <Star size={16} />, check: (_, __, js) => js.includes('textContent') && (js.includes('Correct') || js.includes('correct')) },
      { id: 'asset', title: 'Artistic Touch', description: 'Generate an asset in the Lab.', xp: 200, icon: <Sparkles size={16} />, check: () => false },
    ],
    starterMessages: [
      { text: "Level 4: Mini Quiz! Each button has data-correct='true' or 'false'.", sender: 'bot' },
      { text: "Tip: Use querySelectorAll('.opt') to get all option buttons.", sender: 'bot' },
      { text: "Tip: btn.dataset.correct tells you if it's the right answer.", sender: 'bot' },
    ],
    proTip: "Loop through options with forEach and add a click listener that checks e.target.dataset.correct.",
  },
];

export function getLevelById(id: string): Level | undefined {
  return LEVELS.find(l => l.id === id);
}
