<div align="center">

```
 ██████╗ ██╗   ██╗██╗███████╗███╗   ███╗██╗███╗   ██╗██████╗
██╔═══██╗██║   ██║██║╚══███╔╝████╗ ████║██║████╗  ██║██╔══██╗
██║   ██║██║   ██║██║  ███╔╝ ██╔████╔██║██║██╔██╗ ██║██║  ██║
██║▄▄ ██║██║   ██║██║ ███╔╝  ██║╚██╔╝██║██║██║╚██╗██║██║  ██║
╚██████╔╝╚██████╔╝██║███████╗██║ ╚═╝ ██║██║██║ ╚████║██████╔╝
 ╚══▀▀═╝  ╚═════╝ ╚═╝╚══════╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═════╝
</div>

<div align="center">

# QuizMind

### A premium, interactive quiz experience — dark, fast, beautiful.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Zustand](https://img.shields.io/badge/Zustand-5-593D88?style=flat-square&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjUwIiBmaWxsPSIjNTkzRDg4Ii8+PC9zdmc+&logoColor=white)](https://zustand-demo.pmnd.rs)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055FF?style=flat-square&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![CSS Modules](https://img.shields.io/badge/CSS_Modules-🪄-e94560?style=flat-square)](https://github.com/css-modules/css-modules)

</div>

---

## 🎯 Overview

QuizMind is a sleek, single-page quiz application crafted with **React + Vite + TypeScript**. It loads quiz tests from JSON files, presents questions with multiple answer modes, tracks your progress in real time, and delivers a polished results page with animated statistics.

Built with a **premium dark UI** inspired by Linear and Raycast — glassmorphism panels, smooth microinteractions, gradient accents, and a carefully tuned design system. No Tailwind. No Bootstrap. Pure CSS Modules and CSS Variables.

> **Drop new quiz JSON files into `public/tests/` and they appear automatically. Drop MP3 files into `public/sounds/` and the music player picks them up.**

---

## ✨ Features

```
🎯 Quiz Engine          │  Single & multiple choice, skip, review
📊 Live Progress        │  Bar + counter with skipped tracking
🎉 Results Page         │  Animated SVG gauge, stats breakdown
🎨 3 Themes             │  Dark · Light · Catppuccin
🔊 Audio System         │  Sound effects (Web Audio API) + Music (MP3)
🎵 Music Rotation       │  Random track on end, toggle per‑file
✨ Microinteractions    │  Hover glow, press effects, subtle gradients
🧭 Animated Navigation  │  Page transitions with blur & fade
📱 Responsive           │  Mobile‑first, clean on all screens
🧩 JSON‑driven Tests    │  Add tests without touching the code
```

### Quiz flow

```
HomePage ──▶ TestStartPage ──▶ QuizPage ──▶ ResultsPage
  │                │                │               │
  │ pick test      │ review info    │ answer         │ see score
  │                │ begin          │ skip / nav     │ gauge + %
  ▼                ▼                ▼               ▼
```

---

## 🛠️ Tech stack

| Layer            | Technology                   |
| ---------------- | ---------------------------- |
| Framework        | React 19                    |
| Language         | TypeScript 6 (strict)       |
| Bundler          | Vite 8                      |
| State management | Zustand 5                   |
| Animations       | Framer Motion 12            |
| Routing          | React Router DOM 7          |
| Validation       | Zod 4                       |
| Audio (effects)  | Web Audio API (no deps)     |
| Audio (music)    | HTML5 Audio + JSON index    |
| Styling          | CSS Modules + CSS Variables |

**Zero runtime CSS framework** — the entire design system lives in `src/styles/variables.css`:

```css
--bg-primary: #0a0a18;
--accent: #e94560;
--text-primary: #f1f4f9;
--glass-bg: rgba(255, 255, 255, 0.02);
--radius-md: 10px;
--space-8: 2rem;
/* + 40 more variables */
```

---

## 🚀 Quick start

```bash
# clone
git clone https://github.com/YOUR_USER/QuizMind.git
cd QuizMind

# install
npm install

# dev
npm run dev        # → http://localhost:5173

# build
npm run build      # → dist/

# preview (after build)
npm run preview
```

### Requirements

- **Node.js** ≥ 18
- Modern browser with Web Audio API support (Chrome, Firefox, Edge, Safari)

---

## 📁 Project structure

```
quiz-app/
├── public/
│   ├── themes/              ← Dark, Light, Catppuccin CSS
│   │   └── index.json       ← Theme registry
│   ├── tests/               ← Quiz JSON files (auto‑loaded)
│   │   └── index.json       ← Test catalog
│   └── sounds/              ← MP3 background music
│       ├── index.json       ← Track list
│       └── music-background.mp3
│
├── src/
│   ├── components/
│   │   ├── layout/          ← Header, PageWrapper, AnimatedPage
│   │   ├── quiz/            ← TestCard, TestGrid, AnswerOption,
│   │   │                      QuestionCard, NavigationBar
│   │   ├── settings/        ← AudioPanel, ThemeSelector
│   │   └── ui/              ← Button, Badge, ProgressBar,
│   │                          CircularProgress
│   │
│   ├── pages/               ← HomePage, TestStartPage,
│   │   │                      QuizPage, ResultsPage
│   │
│   ├── services/
│   │   ├── audioManager.ts  ← Sound effects + music playback
│   │   ├── themeManager.ts  ← Theme loading & application
│   │   ├── testLoader.ts    ← JSON test loader
│   │   └── testValidator.ts ← Zod schema validation
│   │
│   ├── stores/
│   │   ├── useQuizStore.ts      ← Quiz state (Zustand)
│   │   ├── useSettingsStore.ts  ← Theme + audio settings
│   │   └── useTestsStore.ts     ← Test catalog + selection
│   │
│   ├── styles/
│   │   ├── variables.css    ← Design system
│   │   └── global.css       ← Reset + defaults
│   │
│   ├── types/               ← TypeScript interfaces
│   └── utils/               ← shuffle, scoring
│
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🎨 Themes

Switch themes from the **header dropdown** — no page reload required.

| Theme      | Preview          |
| ---------- | ---------------- |
| **Dark**   | Deep navy base with magenta accents |
| **Light**  | Clean white with soft shadows |
| **Catppuccin** | Mocha base with lavender highlights |

### Add your own theme

1. Create `public/themes/my-theme.css`
2. Add entry to `public/themes/index.json`

```json
{
  "themes": [
    { "id": "my-theme", "name": "My Theme", "file": "/themes/my-theme.css" }
  ]
}
```

---

## 🎵 Audio system

QuizMind has a dual audio architecture:

| System          | Engine              | What it does                     |
| --------------- | ------------------- | -------------------------------- |
| **Sound effects** | Web Audio API      | Click, correct, skip, win tones  |
| **Background music** | HTML5 Audio    | MP3 playback with random rotation |

### Controls

The **AudioPanel** (visible on every page) lets you:
- Toggle sound effects ON/OFF
- Toggle background music ON/OFF
- Adjust volume for each independently

### Adding your own music

1. Drop `.mp3` files into `public/sounds/`
2. Update `public/sounds/index.json`:

```json
{
  "tracks": [
    "/sounds/ambient-1.mp3",
    "/sounds/lo-fi-beat.mp3",
    "/sounds/piano-chill.mp3"
  ]
}
```

3. The music player picks a random track on start and rotates randomly when each track ends.

---

## 📝 Adding quiz tests

Place JSON files in `public/tests/` and register them in `public/tests/index.json`:

```json
{
  "tests": [
    {
      "id": "math-101",
      "file": "/tests/math-101.json",
      "title": "Basic Math",
      "category": "Mathematics",
      "difficulty": "easy",
      "questionCount": 10
    }
  ]
}
```

### Test JSON schema

```json
{
  "id": "math-101",
  "title": "Basic Math",
  "description": "Arithmetic fundamentals",
  "category": "Mathematics",
  "difficulty": "easy",
  "passThreshold": 70,
  "shuffleQuestions": true,
  "shuffleAnswers": true,
  "questions": [
    {
      "id": "q1",
      "text": "What is 2 + 2?",
      "type": "single",
      "answers": [
        { "id": "a1", "text": "3" },
        { "id": "a2", "text": "4", "correct": true },
        { "id": "a3", "text": "5" }
      ],
      "explanation": "2 + 2 = 4"
    }
  ]
}
```

Supported question types: `single` (one answer) and `multiple` (select several).

---

## 📊 Bundle size

| File          | Size  | Gzip      |
| ------------- | ----: | --------: |
| JS            | 379 kB | 121 kB   |
| CSS           | 17 kB  | 4.1 kB   |
| HTML          | 0.5 kB | 0.3 kB   |

No external CSS framework. No runtime icon library. No audio-file dependencies for effects. Just the essentials.

---

## 📄 License

MIT — feel free to use, modify, and share.

---

<div align="center">
  <sub>Built with 🎯 by QuizMind Team</sub>
</div>
