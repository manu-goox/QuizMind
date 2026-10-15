<div align="center">

<img src="docs/logo.svg" alt="QuizMind — interactive quiz experience" width="460" />

### A premium, interactive quiz experience — dark, fast, beautiful.

[![CI](https://github.com/manu-goox/QuizMind/actions/workflows/ci.yml/badge.svg)](https://github.com/manu-goox/QuizMind/actions/workflows/ci.yml)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Zustand](https://img.shields.io/badge/Zustand-5-593D88?style=flat-square&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjUwIiBmaWxsPSIjNTkzRDg4Ii8+PC9zdmc+&logoColor=white)](https://zustand-demo.pmnd.rs)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055FF?style=flat-square&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![CSS Modules](https://img.shields.io/badge/CSS_Modules-🪄-e94560?style=flat-square)](https://github.com/css-modules/css-modules)
[![PWA](https://img.shields.io/badge/PWA-offline--ready-5A0FC8?style=flat-square&logo=pwa&logoColor=white)](#-pwa--offline)

</div>

---

## 🎯 Overview

QuizMind is a React + Vite + TypeScript quiz platform with a premium **Aurora** UI —
aurora glows, glassmorphism, gradient accents and Space Grotesk display type,
inspired by Linear and Raycast. It ships with a full quiz engine, local history,
practice mode, three themes, an audio system and offline-ready PWA support.

Drop a JSON file into `test/` and it appears on the home screen. Drop an MP3 into
`public/sounds/` and it joins the music rotation. No backend, no accounts —
everything runs locally and your progress is stored in your browser.

## 🗺️ Flow

```
HomePage ──▶ TestStartPage ──▶ QuizPage ──▶ ResultsPage
   │              │                │              │
   │              │                │              └─ stats, review, history
   │              │                └─ questions, timer, shortcuts, skip
   │              └─ details, practice toggle, per-test history
   └─ search, filters, tags, resume banner
```

## ✨ Features

|     | Feature              | Details                                                           |
| --- | -------------------- | ----------------------------------------------------------------- |
| 🎯  | **Quiz engine**      | Single choice, skip, review, annulled-question aware              |
| 📊  | **Live progress**    | Answered + skipped segments with counter                          |
| 🎉  | **Results page**     | Animated gauge (success/error ring), bento stats grid             |
| 🧠  | **Practice mode**    | Instant feedback, no grade, not recorded in history               |
| 🔁  | **Failed review**    | Retry only missed questions, no inherited time limit              |
| 📚  | **Test history**     | Attempts, best & average per test, clearable                      |
| ⏱️  | **Time limit**       | Countdown + auto-finish; pauses while the finish dialog is open   |
| 🏷️  | **Tags & sections**  | Collapsible categories, tag chips, semantic difficulty pills      |
| 🎨  | **3 themes**         | Dark · Light · Catppuccin, instant switching, dynamic theme-color |
| 🔊  | **Audio system**     | Web Audio effects + HTML5 music with rotation and auto-recovery   |
| ✨  | **Animated brand**   | Gradient color wave on the logo, aurora background with glints    |
| ♿  | **Accessible**       | Skip link, focus management, aria-live, reduced-motion support    |
| 📱  | **Responsive & PWA** | Mobile-first, safe-area aware, installable, offline-ready         |
| 🧩  | **JSON-driven**      | Add a file to `test/` — validated with Zod, duplicate-safe        |
| 🔎  | **Filters**          | Search, category select, difficulty pills, tag filtering          |
| 💾  | **Resume**           | Refresh-safe session restore with stale-data reconciliation       |
| ⌨️  | **Keyboard**         | `1-9`, arrows, `Enter`, `S` — ignored while dialogs are open      |
| ✅  | **Pass threshold**   | Configurable per test, boundary-safe scoring                      |
| ⚡  | **Fast**             | Registry parsed once per session, lazy chunks, precached offline  |

## 🛠️ Tech stack

| Layer      | Technology                                    |
| ---------- | --------------------------------------------- |
| UI         | React 19, CSS Modules, Space Grotesk + Inter  |
| Language   | TypeScript 6 (strict)                         |
| Build      | Vite 8, vite-plugin-pwa                       |
| State      | Zustand 5                                     |
| Routing    | React Router DOM 7                            |
| Animation  | Framer Motion 12                              |
| Validation | Zod 4                                         |
| Audio      | Web Audio API (effects) + HTML5 Audio (music) |
| Testing    | Vitest 5 + coverage-v8                        |
| Quality    | ESLint 10 (flat config) + Prettier 3          |

### Design tokens

Every theme is driven by CSS variables — components never hardcode colors.

```css
:root {
  --bg-primary: #0a0a18;
  --accent: #e94560;
  --accent-gradient: linear-gradient(
    135deg,
    var(--accent) 0%,
    var(--accent-2) 100%
  );
  --font-display: 'Space Grotesk', var(--font-family);
  --glass-bg: rgba(255, 255, 255, 0.02);
  --space-8: 2rem;
  /* + 90 more */
}
```

## 🚀 Quick start

```bash
git clone https://github.com/manu-goox/QuizMind.git
cd QuizMind
npm install
npm run dev
```

| Script                  | What it does                                   |
| ----------------------- | ---------------------------------------------- |
| `npm run dev`           | Start the Vite dev server                      |
| `npm run build`         | Type-check + production build                  |
| `npm run preview`       | Preview the production build                   |
| `npm test`              | Run the test suite                             |
| `npm run test:coverage` | Tests + coverage report (gated at 85/70/90/85) |
| `npm run lint`          | ESLint                                         |
| `npm run format`        | Prettier — write                               |
| `npm run format:check`  | Prettier — check (used in CI)                  |

**Requirements:** Node.js ≥ 22.12 (enforced via `engines`) and a modern browser with Web Audio support.

## 📁 Project structure

```
QuizMind/
├── test/                       # Quiz definitions (JSON, auto-discovered)
├── documents/                  # Study material
├── docs/                       # Guides + brand assets (logo.svg)
├── public/
│   ├── themes/                 # Theme CSS files + index.json
│   └── sounds/                 # Music tracks + index.json
├── src/
│   ├── components/
│   │   ├── layout/             # Header, PageWrapper, AnimatedPage, ErrorBoundary,
│   │   │                       # UpdateBanner
│   │   ├── quiz/               # TestCard, TestGrid, TestSections, QuestionCard,
│   │   │                       # AnswerOption, NavigationBar
│   │   ├── settings/           # AudioMenu, AudioPanel, ThemeSelector
│   │   └── ui/                 # Button, Badge, ProgressBar, Modal,
│   │                           # CircularProgress, Select
│   ├── pages/                  # HomePage, TestStartPage, QuizPage, ResultsPage
│   ├── services/               # audioManager, themeManager, testValidator
│   ├── stores/                 # useQuizStore (session), useSettingsStore,
│   │                           # useHistoryStore (local), useTestsStore
│   ├── styles/                 # variables.css, global.css
│   ├── types/
│   └── utils/                  # scoring, shuffle, timer, formatTime, difficulty,
│                               # failedQuestions, historyStats, testGroups,
│                               # desktop, autoUpdate
├── .github/workflows/ci.yml    # CI: quality · test + coverage · build
├── .github/workflows/release.yml  # Signed desktop release from main
├── eslint.config.js
├── pwa-assets.config.ts
└── vite.config.ts
```

## 🎨 Themes

Switch themes from the header dropdown — the choice persists and the browser
theme-color follows along.

| Theme      | Mood                                                 |
| ---------- | ---------------------------------------------------- |
| Dark       | Deep navy `#0a0a18` with magenta `#e94560` — default |
| Light      | Soft blue-grey surfaces with a rose accent           |
| Catppuccin | Mocha palette with lavender accent                   |

**Add your own:** drop a CSS file in `public/themes/` and register it in
`public/themes/index.json`. Every theme defines the full token set — including
the Aurora block (`--aurora-1/2/3`, `--accent-gradient`, `--grain-opacity`).
See [`docs/THEME_GUIDE.md`](docs/THEME_GUIDE.md) for the canonical variable list.

## 🎵 Audio system

Two independent layers, controlled from the speaker menu in the header.

| Layer         | Engine        | Behaviour                                                     |
| ------------- | ------------- | ------------------------------------------------------------- |
| Sound effects | Web Audio API | Synthesized tones for clicks, answers, start and finish       |
| Music         | HTML5 Audio   | Random rotation from `public/sounds/`, recovers from failures |

**Add music:** drop MP3 files in `public/sounds/` and list them in
`public/sounds/index.json` under `tracks`.

## 📝 Adding quiz tests

Drop a JSON file into `test/` — it is validated at load time and appears on the
home screen automatically.

```json
{
  "id": "my-test",
  "title": "My Test",
  "description": "Optional description shown on the start page",
  "category": "Computer Science",
  "tags": ["algorithms", "basics"],
  "difficulty": "medium",
  "passThreshold": 0.6,
  "timeLimit": 15,
  "shuffleQuestions": true,
  "shuffleAnswers": true,
  "questions": [
    {
      "id": "q1",
      "text": "What does HTML stand for?",
      "answers": [
        { "id": "a1", "text": "HyperText Markup Language", "correct": true },
        { "id": "a2", "text": "HighText Machine Language" }
      ],
      "explanation": "Optional — shown in review and practice modes"
    }
  ]
}
```

| Field                 | Notes                                     |
| --------------------- | ----------------------------------------- |
| `difficulty`          | `easy` · `medium` · `hard` · `mixed`      |
| `passThreshold`       | 0 – 1, defaults to `0.6`                  |
| `timeLimit`           | Minutes; omit for untimed tests           |
| `tags`                | Max 10 tags, 1–30 characters each         |
| `questions[].answers` | 2–6 per question; single choice supported |

A question **without a correct answer** is treated as _annulled_: it is shown in
review but excluded from scoring, progress and pending counts.

Full schema: [`docs/TEST_FORMAT.md`](docs/TEST_FORMAT.md).

## ⌨️ Keyboard shortcuts

| Key       | Action                                        |
| --------- | --------------------------------------------- |
| `1` – `9` | Select answer                                 |
| `←` `→`   | Previous / next question                      |
| `Enter`   | Continue / finish                             |
| `S`       | Skip question (disabled on the last question) |

Shortcuts are ignored while a dialog is open and never hijack typing or button focus.

## 📴 PWA & offline

QuizMind is an installable PWA with a generated service worker:

- App shell, themes, icons and all test chunks are **precached** for offline use
- Google Fonts are **runtime-cached** (CacheFirst, one-year expiry)
- Updates apply automatically and the page reloads once on `controllerchange`
- The `<meta name="theme-color">` tracks the active theme at runtime

## 🖥️ Desktop app (Tauri)

QuizMind also runs as a native desktop app built with [Tauri 2](https://v2.tauri.app)
(WebView2 on Windows — no browser chrome, everything local):

```bash
npm run tauri dev     # native window with HMR
npm run tauri build   # .exe + NSIS installer (src-tauri/target/release/bundle/)
```

The webview is detected at runtime (`src/utils/desktop.ts`): desktop builds use a
hash router so reloading any route (e.g. resuming a quiz) keeps working, while the
web build keeps clean URLs. Needs the Rust MSVC toolchain and the WebView2 runtime
(preinstalled on Windows 10/11). Desktop builds auto-update from GitHub
Releases — see below. They ship without the PWA service worker (the frontend is
embedded in the executable) and clear stale webview caches on startup, so an
update can never serve an outdated frontend.

## 🔄 Releases & auto-updates

Installed desktop builds check for newer releases on every launch and install
them automatically, showing live download progress in a banner before the app
restarts itself (`src/utils/autoUpdate.ts`).
Releases are therefore always built from `main`:

1. Bump `version` in `src-tauri/tauri.conf.json`.
2. Merge into `main` (CI must be green).
3. Push a `vX.Y.Z` tag **or** run the **Release** workflow on `main`
   (Actions → Release → Run workflow). The version in the config decides the tag
   when running the workflow manually.

The workflow rejects any tag/commit that is not an ancestor of `main`, then
builds the signed NSIS installer on `windows-latest` and publishes the GitHub
release together with `latest.json`, the feed the updater reads.

**One-time setup (repo secret):** add `TAURI_SIGNING_PRIVATE_KEY` in
Settings → Secrets and variables → Actions with the contents of your private
updater key. The keypair lives outside the repo (private key in `~/.tauri/`,
public key pinned in `src-tauri/tauri.conf.json`); local builds pick the private
key up from the `TAURI_SIGNING_PRIVATE_KEY` environment variable. Never commit
it — losing the key means installed apps can no longer receive updates.

## 🧪 Quality & CI

| Check    | Detail                                                        |
| -------- | ------------------------------------------------------------- |
| Lint     | ESLint 10 flat config                                         |
| Format   | Prettier check                                                |
| Types    | `tsc --noEmit` (strict)                                       |
| Tests    | Vitest — 160 tests across 18 files                            |
| Coverage | Statements 85 · Branches 70 · Functions 90 · Lines 85 (gated) |

CI runs three parallel jobs on every push and PR — `quality`, `test` (coverage
artifact) and `build` (dist artifact) — with redundant runs cancelled
automatically. Node 22 on `ubuntu-latest`.

## 📊 Bundle size

| Asset                        | Raw     | Gzip    |
| ---------------------------- | ------- | ------- |
| Initial JS (index + vendor)  | ~479 kB | ~148 kB |
| Largest chunk (vendor-react) | 216 kB  | 68 kB   |
| CSS                          | 46 kB   | 8.4 kB  |
| Test chunks (29, lazy)       | ~356 kB | —       |

Test definitions are bundled as individual chunks and precached for offline use;
the registry is parsed once per session.

## 📄 License

Released under the MIT License.
