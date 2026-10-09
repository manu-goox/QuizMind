██████╗ ██╗ ██╗██╗███████╗███╗ ███╗██╗███╗ ██╗██████╗
██╔═══██╗██║ ██║██║╚══███╔╝████╗ ████║██║████╗ ██║██╔══██╗
██║ ██║██║ ██║██║ ███╔╝ ██╔████╔██║██║██╔██╗ ██║██║ ██║
██║▄▄ ██║██║ ██║██║ ███╔╝ ██║╚██╔╝██║██║██║╚██╗██║██║ ██║
╚██████╔╝╚██████╔╝██║███████╗██║ ╚═╝ ██║██║██║ ╚████║██████╔╝
╚══▀▀═╝ ╚═════╝ ╚═╝╚══════╝╚═╝ ╚═╝╚═╝╚═╝ ╚═══╝╚═════╝

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

Built with a **premium "Aurora" UI** inspired by Linear and Raycast — layered aurora glows, glassmorphism surfaces, gradient accents, Space Grotesk display type, and smooth microinteractions. No Tailwind. No Bootstrap. Pure CSS Modules and CSS Variables.

> **Drop quiz JSON files into the `test/` folder and they are loaded automatically — no index, no registration. Drop MP3 files into `public/sounds/` and the music player picks them up.**

---

## ✨ Features

```
🎯 Quiz Engine          │  Single choice, skip, review
📊 Live Progress        │  Bar + counter with skipped tracking
🎉 Results Page         │  Animated SVG gauge, stats breakdown
🧠 Practice Mode        │  Instant feedback, no grade, not recorded
🔁 Failed Review        │  Retry only the questions you missed
📚 Test History         │  Local stats: attempts, best & average
⏱️ Time Limit           │  Optional per‑test countdown + auto‑finish
🏷️ Tags & Sections      │  Collapsible categories + tag chips
🎨 3 Themes             │  Dark · Light · Catppuccin
🔊 Audio System         │  Sound effects (Web Audio API) + Music (MP3)
🎵 Music Rotation       │  Random track on end, toggle per‑file
✨ Microinteractions    │  Hover glow, press effects, subtle gradients
🧭 Animated Navigation  │  Page transitions with blur & fade
📱 Responsive           │  Mobile‑first, clean on all screens
🧩 JSON‑driven Tests    │  Add tests without touching the code
🔍 Filters & Search     │  Filter by category/difficulty, search by title
⏸️ Resume Quiz          │  Refresh‑safe: continue where you left off
⌨️ Keyboard Shortcuts   │  1‑9 answer · ← → navigate · Enter advance · S skip
✅ Pass Threshold       │  Configurable per test, shown on results
🛡️ Validated JSON      │  Friendly errors for malformed tests
⚠️ Blank Warning        │  Review unanswered questions before finishing
📦 Code Splitting       │  Lazy‑loaded tests, vendor chunks
📲 PWA                  │  Installable + offline (auto‑update)
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

| Layer            | Technology                  |
| ---------------- | --------------------------- |
| Framework        | React 19                    |
| Language         | TypeScript 6 (strict)       |
| Bundler          | Vite 8                      |
| State management | Zustand 5                   |
| Animations       | Framer Motion 12            |
| Routing          | React Router DOM 7          |
| Validation       | Zod 4                       |
| PWA              | vite-plugin-pwa             |
| Testing          | Vitest 5 + coverage-v8      |
| Lint / Format    | ESLint 10 + Prettier 3      |
| Audio (effects)  | Web Audio API (no deps)     |
| Audio (music)    | HTML5 Audio + JSON index    |
| Styling          | CSS Modules + CSS Variables |

**Zero runtime CSS framework** — the entire design system lives in `src/styles/variables.css`:

```css
--bg-primary: #0a0a18;
--accent: #e94560;
--accent-gradient: linear-gradient(135deg, var(--accent), var(--accent-2));
--font-display: 'Space Grotesk', var(--font-family);
--glass-bg: rgba(255, 255, 255, 0.02);
--radius-md: 10px;
--space-8: 2rem;
/* + 70 more variables */
```

---

## 🚀 Quick start

```bash
# clone
git clone https://github.com/YOUR_USER/QuizMind.git
cd QuizMind

# install
npm install

# dev — drop .json files in test/ and they reload automatically
npm run dev        # → http://localhost:5173

# unit tests (Vitest)
npm test

# coverage (thresholds enforced)
npm run test:coverage

# lint & format
npm run lint
npm run format

# build
npm run build      # → dist/

# preview (after build)
npm run preview
```

### Requirements

- **Node.js** ≥ 22.12
- Modern browser with Web Audio API support (Chrome, Firefox, Edge, Safari)

---

## 📁 Project structure

```
quiz-app/
├── test/                    ← Quiz JSON files (auto‑loaded, no index)
├── documents/               ← Source material (PDFs, notes — not bundled)
├── docs/                    ← Project documentation
│
├── public/
│   ├── themes/              ← Dark, Light, Catppuccin CSS
│   │   └── index.json       ← Theme registry
│   └── sounds/              ← MP3 background music
│       ├── index.json       ← Track list
│       └── music-background.mp3
│
├── src/
│   ├── components/
│   │   ├── layout/          ← Header, PageWrapper, AnimatedPage
│   │   ├── quiz/            ← TestCard, TestGrid, TestSections,
│   │   │                      QuestionCard, AnswerOption, NavigationBar
│   │   ├── settings/        ← AudioPanel, AudioMenu, ThemeSelector
│   │   └── ui/              ← Button, Badge, ProgressBar, Modal,
│   │                          CircularProgress, Select
│   │
│   ├── pages/               ← HomePage, TestStartPage,
│   │   │                      QuizPage, ResultsPage
│   │
│   ├── services/
│   │   ├── audioManager.ts  ← Sound effects + music playback
│   │   ├── themeManager.ts  ← Theme loading & application
│   │   └── testValidator.ts ← Zod schema validation
│   │
│   ├── stores/
│   │   ├── useQuizStore.ts      ← Quiz state (Zustand + sessionStorage)
│   │   ├── useSettingsStore.ts  ← Theme + audio settings
│   │   ├── useHistoryStore.ts   ← Attempt history (localStorage)
│   │   └── useTestsStore.ts     ← Test catalog (loaded from test/)
│   │
│   ├── styles/
│   │   ├── variables.css    ← Design system
│   │   └── global.css       ← Reset + defaults
│   │
│   ├── types/               ← TypeScript interfaces
│   └── utils/               ← shuffle, scoring, difficulty,
│                              failedQuestions, historyStats, testGroups
│
├── .github/workflows/ci.yml ← CI: lint + tsc + test + build
├── eslint.config.js         ← ESLint flat config
├── pwa-assets.config.ts     ← PWA icon generation
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts           ← Vite + Vitest + PWA + chunking
```

---

## 🎨 Themes

Switch themes from the **header dropdown** — no page reload required.

| Theme          | Preview                             |
| -------------- | ----------------------------------- |
| **Dark**       | Deep navy base with magenta accents |
| **Light**      | Clean white with soft shadows       |
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

| System               | Engine        | What it does                      |
| -------------------- | ------------- | --------------------------------- |
| **Sound effects**    | Web Audio API | Click, skip, win, start tones     |
| **Background music** | HTML5 Audio   | MP3 playback with random rotation |

### Controls

The **audio menu** (speaker icon in the header, available on every page) opens the AudioPanel controls:

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

Drop a `.json` file into the root **`test/`** folder — that's it. There is no index to maintain:

1. With `npm run dev` running, the app reloads automatically and the test shows up.
2. For production, run `npm run build` again so the embedded tests include the new file.
3. Files that fail validation are ignored with a warning on the home page — malformed JSON never breaks the app.

### Test JSON schema

```json
{
  "id": "math-101",
  "title": "Basic Math",
  "description": "Arithmetic fundamentals",
  "category": "Mathematics",
  "tags": ["math", "basics"],
  "difficulty": "easy",
  "passThreshold": 0.7,
  "timeLimit": 30,
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

- `difficulty`: `easy`, `medium`, `hard` or `mixed`.
- `passThreshold`: fraction from 0 to 1 (default `0.6`) used for the pass/fail verdict on the results page.
- `timeLimit`: optional time limit in minutes; adds a countdown and auto-finishes at zero.
- `tags`: optional labels (max 10, 1-30 chars each) shown as filter chips on the home page.
- Question types: `single` is supported. `multiple` is rejected at validation (the file is skipped with a warning).

See `docs/TEST_FORMAT.md` for the full reference.

---

## ⌨️ Keyboard shortcuts (quiz screen)

| Key       | Action                                |
| --------- | ------------------------------------- |
| `1`–`9`   | Select answer by position             |
| `←` / `→` | Previous / next question              |
| `Enter`   | Next question / finish the test       |
| `S`       | Skip current question (if unanswered) |

---

## 📊 Bundle size

| File               |   Size |   Gzip |
| ------------------ | -----: | -----: |
| JS (initial load)  | 469 kB | 148 kB |
| JS (largest chunk) | 220 kB |  70 kB |
| CSS                |  25 kB | 5.3 kB |
| HTML               | 0.9 kB | 0.4 kB |

Test data is bundled as individual chunks and precached for offline use; the registry is parsed once per session.

No external CSS framework. No runtime icon library. No audio-file dependencies for effects. Just the essentials.

---

## 📄 License

MIT — feel free to use, modify, and share.

---

<div align="center">
  <sub>Built with 🎯 by ManuGooX</sub>
</div>
