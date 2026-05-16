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

## 📦 Latest Release — v1.5.4

- **Critical bug fixes**: IndexedDB error handling (try/catch on all operations), iOS private browsing fallback, stale closures in game state (score no longer lags), `crypto.randomUUID()` fallback for insecure contexts, `persistSession` now properly awaited
- **iOS keyboard fix**: `visualViewport` listener on all bottom sheets — inputs no longer hidden by keyboard
- **iOS swipe back**: Added `preventDefault()` to prevent system back gesture conflict, `touchAction: 'pan-y'` on root div, fixed `dy > dx` killing one-handed thumb swipes
- **Timer**: Now Date-based instead of `setInterval` increment — accurate even when iOS Safari backgrounds the tab
- **iOS auto-zoom**: All inputs increased to `font-size: 16px` to prevent iOS zoom on focus
- **Tap targets**: 44pt minimum on all buttons (Apple HIG compliance)
- **Swipe click**: Fixed synthesized click firing 300ms after swipe causing false collapse
- **Card drag**: Added `select-none`, `touchAction: 'none'`, `active:scale-[0.97]` for mobile feedback
- **CSV download**: Fixed `revokeObjectURL` timing for iOS Safari
- **System theme**: Added `matchMedia` listener — system dark/light toggles now reactive while app is open
- **PWA**: Added `purpose: "any maskable"` for Android adaptive icons
- **Accessibility**: Removed `user-scalable=no` from viewport meta, added `inputMode="numeric"` and `pattern="[0-9]*"` on number inputs
- **Input validation**: `calculateLuminance` now validates hex strings (prevents NaN cascade), `pickWeighted` logs warning on all-zero weights
- **`logError` eviction**: Now removes up to 50 entries when limit reached (unbounded growth fix)
- **`deleteDeck` race condition**: Reads quests/sessions inside the transaction (no orphaned records)
- **CardBack**: Added `active:scale-[0.97]` for mobile touch feedback (replaces desktop-only `whileHover`)

## 📦 Previous Release — v1.5.3

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
