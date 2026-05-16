# 🎮 Sully's Sidequests

A personal quest-generator PWA — swipe through a hand of cards, complete sidequests in real life, and track your score. No backend, no accounts, all data stored locally on your device.

[![Deploy to Pages](https://github.com/sulie-macquoid/Sidequester/actions/workflows/deploy.yml/badge.svg)](https://github.com/sulie-macquoid/Sidequester/actions/workflows/deploy.yml)

## ✨ Features

- **Card-based gameplay** — 4-card hand, Tinder-style swipe (right = complete, left = discard)
- **Smart probability** — Discarded cards re-enter with halved weight; cycle resets prevent starvation
- **Game settings** — Time constraint mode with absolute countdown, permanent discard toggle
- **Deck management** — Create, edit, reorder decks; edit quest titles, descriptions, emojis, point values
- **CSV export/import** — Download decks as CSV, import with format guide + file drop zone
- **Custom emoji** — Add/remove emojis from the grid; deleted emojis fall back to 🇴🇲
- **Dark / light / system theme** — Custom background colors, linked theme toggles
- **PWA** — Install on iOS/Android home screen, works offline, portrait standalone mode
- **Session persistence** — Unfinished games resume across tab closes
- **Share score** — Native share sheet on deck complete
- **Swipe back gesture** — iOS-style left-edge drag on non-game screens

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173/Sidequester/`.

## 🏗️ Build

```bash
npm run build
```

Outputs to `dist/`. PWA service worker is generated automatically.

## 🌐 Deployment

Pushes to `main` auto-deploy to GitHub Pages via GitHub Actions.  
Live at: https://sulie-macquoid.github.io/Sidequester/

## 📁 Project Structure

```
src/
├── components/    # Reusable UI (CardFront, CardBack, BottomSheet, EmojiPicker, etc.)
├── context/       # SettingsContext (shared reactive state)
├── db/            # IndexedDB stores + seed data
├── hooks/         # useGame, useDecks, useView, useTimer
├── screens/       # MenuScreen, DeckSelectScreen, GameScreen, etc.
├── utils/         # Colors, CSV parsing, probability, formatters
├── App.tsx         # Screen routing + swipe back gesture
└── types.ts        # Shared TypeScript types
```

## 🧱 Tech Stack

- React 19 + TypeScript
- Tailwind CSS v4
- Framer Motion (animations + drag/swipe)
- Vite + vite-plugin-pwa
- idb (IndexedDB wrapper)
- lucide-react (icons)

## 📝 Keeping README Updated

When adding new features, update the **Features** section above so this README always reflects the current state of the app.

---

*vibecoded by Sulaiman "Bossman" al harthy*
