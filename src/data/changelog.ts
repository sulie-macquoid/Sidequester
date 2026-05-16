export interface ReleaseEntry {
  version: string
  label: string
  items: string[]
}

export const CHANGELOG: ReleaseEntry[] = [
  {
    version: '1.5.4',
    label: 'Bug Fix Pass',
    items: [
      'IndexedDB error handling on every operation — no more unhandled rejections',
      'Fixed stale closures in game state — score no longer lags behind',
      'iOS private browsing fallback — graceful error instead of crash',
      'iOS keyboard no longer hides bottom sheet inputs (visualViewport listener)',
      'Date-based timer — accurate even when iOS Safari backgrounds the tab',
      'Fixed iOS swipe-back conflict with browser gesture',
      'Fixed synthesized click firing 300ms after swipe (false collapse)',
      '44pt minimum tap targets on all buttons (Apple HIG)',
      'All inputs are 16px font — no more iOS auto-zoom on focus',
      'Reactive system theme — toggling dark/light mode works while app is open',
      'CSV download works on iOS Safari (delayed revokeObjectURL)',
      'Android adaptive icons (maskable)',
      'Input validation, color validation, accessibility improvements',
    ],
  },
  {
    version: '1.5.3',
    label: 'Share & Polish',
    items: [
      'Share link in settings — copies game URL with "Copied!" toast',
      'Fixed reset from continue popup now properly deactivates session',
      'Reset deck in game now shows game settings popup',
      'Cards remaining count displayed in game header',
    ],
  },
  {
    version: '1.5.2',
    label: 'Swipe & Session Fixes',
    items: [
      'Fixed swipe back gesture interfering with game',
      'Session detection improvements for continuing games',
      'Card drag zone refined',
      'CSV import shows format example',
    ],
  },
  {
    version: '1.5.1',
    label: 'Timer & Input Fixes',
    items: [
      'Fixed timer persistence across page reloads',
      'Fixed swipe back from game screen',
      'Point value stepper buttons now update in real-time',
      'Improved CSV import flow with instructions',
    ],
  },
  {
    version: '1.5.0',
    label: 'Major Update',
    items: [
      'Native Share button on Deck Complete screen',
      'Pre-game settings popup (time constraint, permanent discard)',
      'CSV import/export for quests',
      'Custom swipe-back gesture (left-edge drag)',
      'Beautified card front and back layouts',
      'Per-deck game settings saved automatically',
    ],
  },
  {
    version: '1.4.1',
    label: 'UI Polish',
    items: [
      'Drag snap-to-origin on card swipe (no fly-away)',
      'Raised bottom buttons to avoid iPhone home indicator',
    ],
  },
  {
    version: '1.4.0',
    label: 'Animations & Deployment',
    items: [
      'Card expand animation with overlay',
      'Sticky header with bezel color',
      'Emoji picker improvements',
      'GitHub Pages auto-deploy',
      'Fixed asset paths for subdirectory',
    ],
  },
  {
    version: '1.3.0',
    label: 'Robustness & Settings Polish',
    items: [
      'Error Boundary component to catch render crashes gracefully',
      'Error logging to IndexedDB (last 200 entries stored automatically)',
      'Debug Sheet to view, clear, and copy error logs',
      'Emoji grid improvements — add custom emojis, tap to remove from grid',
      'Background color picker in settings with live preview',
      'Version number display in settings',
    ],
  },
  {
    version: '1.2.0',
    label: 'Card Flip & Game Flow',
    items: [
      'Card Front face with description text and swipe direction hints',
      '3D card flip animation on tap (rotateY)',
      'Staggered card deal spring animation (80ms delay between cards)',
      'Score bounce animation on quest complete',
      '"Show Completed" popup with animated entries and timestamps',
      'Deck Complete screen with final score, elapsed time, and play again',
      'Haptic feedback on card swipe and quest actions',
      'Card front color bar matching quest color',
    ],
  },
  {
    version: '1.1.0',
    label: 'Deck Manager',
    items: [
      'Deck List screen with add, edit, delete, and drag-to-reorder',
      'Deck Detail screen for managing quests in a deck',
      'Edit Deck bottom sheet (name, subtext, emoji, color)',
      'Edit Quest bottom sheet (emoji, title, description, value, color)',
      'Point value stepper buttons (+/- 10, range 10–500)',
      'Color strips on quest rows for visual identification',
      'Empty deck state with helpful message',
      'Delete confirmation before removing quests',
      'Back navigation button on all edit screens',
    ],
  },
  {
    version: '1.0.0',
    label: 'Initial Release',
    items: [
      'Full PWA — installable on iOS/Android home screen',
      'Card-based gameplay: 4-card hand, Tinder-style swipe',
      'Smart probability: discarded cards re-enter with halved weight',
      'Deck management: create, edit, delete decks',
      'Emoji picker with custom emoji support',
      'Color swatches with auto theme detection',
      'Session persistence (unfinished games resume)',
      'Dark/light/system theme modes',
      'Seed decks: Tokyo and Airport',
    ],
  },
]

export const CURRENT_VERSION = '1.5.4'

export function getLatestRelease(): ReleaseEntry {
  return CHANGELOG[0]
}
