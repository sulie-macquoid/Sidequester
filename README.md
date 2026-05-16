# 🎮 Sully's Sidequests

A personal quest-generator PWA — swipe through a hand of cards, complete sidequests in real life, and track your score. No backend, no accounts, all data stored locally on your device.

[![Deploy to Pages](https://github.com/sulie-macquoid/Sidequester/actions/workflows/deploy.yml/badge.svg)](https://github.com/sulie-macquoid/Sidequester/actions/workflows/deploy.yml)

## ✨ Features

- **Card-based gameplay** — 4-card hand, Tinder-style swipe (right = complete, left = discard)
- **Smart probability** — Discarded cards re-enter with halved weight, cycle resets prevent starvation
- **Pre-game settings** — Time constraint mode with absolute countdown, permanent discard toggle
- **Deck management** — Create, edit, reorder decks; CSV export/import with format guide
- **Session persistence** — Unfinished games resume across tab closes
- **PWA** — Install on home screen, works offline, portrait standalone mode

## 📦 Latest Release — v1.5.3

- Share link in settings — copies the game URL to clipboard with "Copied!" toast
- Fixed reset from continue game popup now properly deactivates the session
- Reset deck in game now shows game settings popup to apply new settings
- Cards remaining count displayed in game header
- Bug fixes and polish

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

---
*vibecoded by Sulaiman "Bossman" Al Harthy*
