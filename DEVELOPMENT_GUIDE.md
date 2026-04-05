# ROOM 37 — Development Guide

Complete developer reference for the Party Games PWA platform.

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Mafia Game Deep Dive](#mafia-game-deep-dive)
3. [Charades Game Updates](#charades-game-updates)
4. [State Management](#state-management)
5. [Game Loop & Timers](#game-loop--timers)
6. [UI Patterns](#ui-patterns)
7. [Adding New Games](#adding-new-games)
8. [Deployment & Testing](#deployment--testing)

---

## Architecture Overview

### Project Stack

```
Frontend        React 19 + TypeScript + Vite 7
Styling         CSS3 + Design System (no CSS-in-JS)
Routing         React Router v6
State           Firebase Realtime Database (RTDB)
Auth            Firebase Authentication
Hosting         Firebase Hosting + CDN
PWA             vite-plugin-pwa + Service Workers
Physics         Matter.js (Imposter game only)
```

### Folder Structure

```
src/
├── games/
│   ├── mafia/
│   │   ├── MafiaGame.tsx          (1,600+ lines - main game)
│   │   └── Mafia.css              (styling)
│   ├── charades/
│   │   ├── CharadesGame.tsx       (930 lines - team-based acting)
│   │   └── Charades.css           (styling)
│   ├── movie/                     (emoji decode game)
│   ├── imposter/                  (physics-based game)
│   ├── 30seconds/                 (team description)
│   └── hangman/                   (word guessing)
├── pages/
│   ├── Home.tsx                   (game selection)
│   ├── Lobby.tsx                  (room creation/joining)
│   └── Support.tsx                (links & donations)
├── context/
│   ├── MultiplayerContext.tsx     (Firebase sync + game state)
│   └── ThemeContext.tsx           (dark/light mode)
├── components/
│   └── NeonLogo.tsx               (animated branding)
├── hooks/
│   └── useMatterDOM.ts            (Matter.js wrapper)
├── services/
│   └── youtube.ts                 (YouTube RSS parser)
└── styles/
    └── animations.css            (global keyframes)
```

---

## Mafia Game Deep Dive

### Game Phases

The Mafia game is completely redesigned around a crystal-clear phase model:

```
LOBBY              Everyone joins, host configures
  ↓
ROLE_REVEAL        Each player sees their role privately
  ↓
NIGHT_PASS*        Local mode: device passes, mafia votes sequentially
  ↓
NIGHT_ONLINE*      Online mode: digital voting with 30s timer
  ↓
MORNING_REVEAL     Announcement of who died + their role
  ↓
DAY_DISCUSS        120 seconds of debate/chat (everyone alive)
  ↓
VOTE               45 seconds voting (no skip allowed)
  ├─ TIE?
  │  ↓
  │  VOTE_REVOTE    Fresh vote (skip disabled, no re-vote on 2nd tie)
  │  ↓
  │  VOTE_REVEAL    Show ballot + eliminated player
  └─ NO TIE?
     ↓
     VOTE_REVEAL    Show ballot + eliminated player
  ↓
EXECUTION          Dramatic reveal of eliminated player
  ↓
ELIMINATED_CHOICE  Dead player picks: stay & chat OR watch silently
  ↓
[Check win conditions]
  ├─ VILLAGERS WIN? → GAME_OVER
  ├─ MAFIA WIN?     → GAME_OVER
  └─ NO WINNER?     → Loop back to NIGHT_PASS/NIGHT_ONLINE
```

### Shared State Interface

```typescript
interface SS {
  // Phase & flow
  phase: Phase;
  roundNumber: number;
  
  // Players & roles
  players: Player[];
  roles: Record<string, 'MAFIA' | 'VILLAGER'>;
  health: Record<string, 'healthy' | 'wounded' | 'dead'>;
  
  // Voting
  dayVotes: Record<string, string | 'skip'>;
  reVoteCount: number;          // Increments when tie triggered
  mafiaVotes: Record<string, string>;
  
  // Night phase (pass-device)
  passOrder: string[];
  passIndex: number;
  nightActions: NightAction[];
  
  // Elimination tracking
  eliminatedThisRound: string | null;
  woundedThisRound: string | null;
  
  // Timers & revealing
  endTime: number;              // Timestamp when phase ends
  revealIdx: number;            // Role reveal progress
  
  // Outcomes
  winner: 'VILLAGERS' | 'MAFIA' | null;
  
  // Chat
  chat: ChatMsg[];              // Public discussion
  ghostChat: ChatMsg[];         // Dead player only chat
  
  // Spectator choice
  spectators: string[];         // Players who chose "watch silently"
  localSpectate: 'stay' | 'spectate' | null;
  
  // Sequential voting (pass-device mode)
  currentVoter: string | null;  // Who's currently voting
}
```

### Key Functions

**Vote Resolution with Tie Detection**
```typescript
const resolveVotesFromState = useCallback(async (
  dv: Record<string, string | 'skip'>,
  h: Record<string, Health>,
  isRevote: boolean = false
) => {
  // Count votes (excluding 'skip')
  const counted = Object.entries(dv)
    .filter(([_, v]) => v && v !== 'skip')
    .reduce((acc, [_, v]) => ({ ...acc, [v]: (acc[v] ?? 0) + 1 }), {} as Record<string, number>)
  
  // Find max votes
  const maxVotes = Math.max(...Object.values(counted), 0)
  const tied = Object.entries(counted).filter(([_, count]) => count === maxVotes)
  
  if (tied.length > 1) {
    // TIE! Go to re-vote
    if (!isRevote) {
      await setSharedState({
        phase: 'VOTE_REVOTE',
        dayVotes: {},
        reVoteCount: reVoteCount + 1
      })
    }
  } else {
    // NO TIE: Eliminate the player
    const eliminated = tied[0][0]
    await setSharedState({
      phase: 'VOTE_REVEAL',
      eliminatedThisRound: eliminated
    })
  }
}, [reVoteCount, setSharedState])
```

**Win Condition Check**
```typescript
const checkWin = (h: Record<string, Health>) => {
  const aliveM = Object.entries(h).filter(
    ([id, health]) => health !== 'dead' && roles[id] === 'MAFIA'
  ).length
  
  const aliveV = Object.entries(h).filter(
    ([id, health]) => health !== 'dead' && roles[id] !== 'MAFIA'
  ).length
  
  if (aliveM === 0) return 'VILLAGERS'
  if (aliveM >= aliveV) return 'MAFIA'
  return null
}
```

**Health Damage System**
```typescript
// Mafia target someone
const newHealth = { ...h }
if (h[target] === 'healthy') {
  newHealth[target] = 'wounded'
} else if (h[target] === 'wounded') {
  newHealth[target] = 'dead'
}

// Doctor heals
newHealth[healed] = 'healthy'
```

---

## Charades Game Updates

### Recent Enhancements (April 2026)

**Team System**
- Teams randomly assigned at game start
- Each player sees their team in HUDDLE phase
- Teams score independently
- Game ends when all players have acted once

**Actor Rotation**
- Sequential cycling through players (not random)
- `playersWhoActed` array tracks completion
- `totalRounds` set to player count
- Game transitions to FINAL_SCORE when everyone has acted

### State Interface

```typescript
interface SS {
  // ... other fields
  playerTeams: Record<string, 'red' | 'blue'>;  // Persistent team assignment
  playersWhoActed: string[];                      // Tracks who has performed
  totalRounds: number;                            // Total number of rounds (= player count)
  currentTeam: 'red' | 'blue';                   // Which team's turn
  activePlayerId: string;                        // Current actor
  roundNumber: number;                           // Current round (1 to totalRounds)
}
```

### Team Display

In HUDDLE phase, player sees:
```tsx
<div className="cr-my-team-badge">
  {myTeam === 'red' ? '🔴 RED TEAM' : '🔵 BLUE TEAM'}
</div>
```

---

## State Management

### Firebase Realtime Database Pattern

All games share a single Firebase RTDB collection per room:

```
/rooms/{roomId}/
├── mode: 'local' | 'online'
├── host: string (playerId)
├── players: Player[]
├── game: string ('mafia' | 'movie' | 'imposter' | '30seconds' | 'hangman')
└── state: SharedState (game-specific fields)
```

### MultiplayerContext Usage

```typescript
const { players, sharedState, setSharedState, isHost, currentPlayerId, mode } = 
  useMultiplayer()

// Reading state
const phase = sharedState?.phase ?? 'LOBBY'
const myRole = sharedState?.roles[currentPlayerId] ?? null

// Updating state (async)
await setSharedState({
  phase: 'NIGHT_PASS',
  dayVotes: {},
  reVoteCount: 0
})
```

### Local Component State

Keep per-component state separate from shared state:

```typescript
// Component-level (not synced)
const [timeLeft, setTimeLeft] = useState(0)          // Timer display
const [chatInput, setChatInput] = useState('')       // Form input
const [selected, setSelected] = useState<string | null>(null)  // UI selection
```

### State Resets at Phase Boundaries

**When entering DAY_DISCUSS:**
```typescript
dayVotes: {}
reVoteCount: 0
chat: []
```

**When entering NIGHT:**
```typescript
mafiaVotes: {}
dayVotes: {}
nightActions: []
passIndex: 0
```

---

## Game Loop & Timers

### Timer System

Phases with timers:
- `DAY_DISCUSS`: 120 seconds (auto-advance to VOTE)
- `VOTE`: 45 seconds (auto-resolve when all voted OR timer expires)
- `VOTE_REVOTE`: 45 seconds (same as VOTE)
- `NIGHT_ONLINE`: 30 seconds (auto-advance to MORNING_REVEAL)
- `MORNING_REVEAL`: 5 seconds (auto-advance to DAY_DISCUSS)
- `VOTE_REVEAL`: 4 seconds (auto-advance to EXECUTION)
- `EXECUTION`: 4 seconds (auto-advance to GAME_OVER or ELIMINATED_CHOICE)

### Auto-Lock Voting

When all alive players have voted in VOTE/VOTE_REVOTE:

```typescript
useEffect(() => {
  const tick = () => {
    const alive = players.filter(p => health[p.id] !== 'dead')
    const voted = Object.keys(dayVotes).length
    
    if (voted >= alive.length && phase === 'VOTE') {
      resolveVotesFromState(dayVotes, health, false)
    }
  }
  
  const interval = setInterval(tick, 300)
  return () => clearInterval(interval)
}, [phase, dayVotes, players, health, setSharedState])
```

### Timer Display

```typescript
const timerPercent = Math.max(0, 
  ((endTime - Date.now()) / (PHASE_TIME * 1000)) * 100
)

const isUrgent = timeLeft < 5  // < 5 seconds left
```

---

## UI Patterns

### Phase Header (Standard Pattern)

Every major phase should display:

```tsx
<div className="mf-phase-header">
  <div className="mf-phase-instruct">
    <span className="mf-phase-instruct-icon">🎯</span>
    <h2>PHASE TITLE</h2>
    <p>Clear instruction or hint</p>
  </div>
</div>
```

CSS for phase header:
```css
.mf-phase-header {
  background: linear-gradient(135deg, rgba(14,165,233,0.2), transparent);
  border-top: 2px solid var(--mf-green);
  padding: 1rem;
  margin-bottom: 1.5rem;
  border-radius: 0.5rem;
}
```

### Vote Grid Layout

For voting displays:

```tsx
<div className="mf-vote-grid">
  {players.map(p => (
    <div key={p.id} className={`mf-vote-player ${selected === p.id ? 'selected' : ''}`}>
      <button onClick={() => handleVote(p.id)}>
        {p.name}
        {voteCount > 0 && <span className="mf-vote-dot">{voteCount}</span>}
      </button>
    </div>
  ))}
</div>
```

### Chat Pattern

```tsx
{!spectating && (
  <div className="mf-chat-panel">
    {/* Feed */}
    <div className="mf-chat-feed">
      {chat.map((msg, i) => (
        <div key={i} className={`mf-chat-msg ${isDead(msg.playerId) ? 'dead' : ''}`}>
          <span className="mf-chat-name">{names[msg.playerId]}</span>
          <span className="mf-chat-text">{msg.text}</span>
        </div>
      ))}
    </div>
    {/* Input */}
    <form onSubmit={sendChat}>
      <input 
        value={chatInput} 
        onChange={e => setChatInput(e.target.value)}
        placeholder="Say something..."
      />
      <button type="submit">→</button>
    </form>
  </div>
)}
```

---

## Adding New Games

### Step 1: Create Game Structure

```
src/games/mygame/
├── MyGameComponent.tsx   (main React component)
├── MyGame.css           (game styling)
└── README.md            (game rules)
```

### Step 2: Implement Component Template

```typescript
import React, { useState, useEffect } from 'react'
import { useMultiplayer } from '../../context/MultiplayerContext'
import './MyGame.css'

type Phase = 'LOBBY' | 'PLAYING' | 'RESULTS'

interface MyGameState {
  phase: Phase
  players: Player[]
  scores: Record<string, number>
  // ... your fields
}

const MyGame: React.FC = () => {
  const { players, sharedState, setSharedState, isHost, mode } = useMultiplayer()
  
  const s = (sharedState ?? {}) as Partial<MyGameState>
  const phase = s.phase ?? 'LOBBY'
  
  // LOBBY
  if (phase === 'LOBBY') {
    return (
      <div className="my-root">
        {isHost && (
          <button onClick={() => setSharedState({ phase: 'PLAYING' })}>
            Start Game
          </button>
        )}
      </div>
    )
  }
  
  // PLAYING
  if (phase === 'PLAYING') {
    return (
      <div className="my-root my-playing">
        {/* Your game UI */}
      </div>
    )
  }
  
  // RESULTS
  if (phase === 'RESULTS') {
    return (
      <div className="my-root my-results">
        {/* Scores & rankings */}
      </div>
    )
  }
  
  return null
}

export default MyGame
```

### Step 3: Register in App.tsx

```typescript
import MyGame from './games/mygame/MyGameComponent'

<Route path="/mygame/*" element={<MyGame />} />
```

### Step 4: Add to Lobby.tsx & Home.tsx

```typescript
const GAME_BUTTONS = [
  // ... existing games
  { title: 'My Game', desc: 'Game description', emoji: '🎮', link: '/lobby?game=mygame' }
]
```

### Step 5: Implement Core Gameplay

- Define your phase model
- Implement state transitions
- Add player interactions
- Keep local state separate from shared state
- Test timer/auto-advance logic

---

## Deployment & Testing

### Build Pipeline

```bash
# Development
npm run dev              # Start Vite dev server (localhost:5173)

# Build
npm run build           # Create optimized dist/ bundle

# Deploy
firebase deploy         # Deploy to Firebase Hosting
```

### Pre-Deployment Checklist

- [ ] `npm run build` completes with 0 errors
- [ ] All 75 modules transform successfully
- [ ] PWA service worker generated
- [ ] No console errors/warnings
- [ ] Test all game phases locally
- [ ] Verify timers are accurate
- [ ] Test state resets between games
- [ ] Mobile responsiveness verified
- [ ] Offline PWA functionality works
- [ ] Firebase config is correct

### Testing Strategy

**Manual Testing Per Game:**
1. Create lobby
2. Add min & max players
3. Test each phase transition
4. Test early skip (where applicable)
5. Test elimination/scoring
6. Verify winner detection
7. Test reset for new round

**Edge Cases:**
- Min player count (too few to win)
- Max player count (no limit)
- Player disconnect mid-game
- Timer expiry (should auto-advance)
- Chat with dead/spectating players
- Rapid repeated votes

---

## Performance Considerations

- **Bundle Size**: ~670 kB minified JS, ~124 kB minified CSS
- **Render Optimization**: Component re-renders on shared state change
- **Timer Polling**: 300ms interval (not 16ms) to reduce CPU
- **Firebase Sync**: Real-time listeners (no polling needed)
- **PWA Cache**: Service worker caches all assets + API responses

---

## Common Patterns

### Check if Player is Alive

```typescript
const isDead = health[playerId] === 'dead'
const isAlive = health[playerId] !== 'dead'
```

### Get Player Name

```typescript
const player = players.find(p => p.id === playerId)
const name = player?.name ?? 'Unknown'
```

### Filter by Condition

```typescript
const alivePlayers = players.filter(p => health[p.id] !== 'dead')
const mafiaPlayers = Object.entries(roles)
  .filter(([_, role]) => role === 'MAFIA')
  .map(([id]) => id)
```

### Check if I'm the Host

```typescript
const amHost = isHost
if (amHost) {
  // Show host controls
}
```

---

## Resources

- **Project README**: [README.md](./README.md)
- **Voting System Details**: [VOTING_SYSTEM_FIX.md](./VOTING_SYSTEM_FIX.md)
- **Game Flow Details**: [GAME_FLOW_REDESIGN.md](./GAME_FLOW_REDESIGN.md)
- **Completion Report**: [PROJECT_COMPLETION_REPORT.md](./PROJECT_COMPLETION_REPORT.md)
- **Firebase Docs**: https://firebase.google.com/docs
- **React Hooks**: https://react.dev/reference/react

---

**Last Updated**: April 5, 2026  
**Version**: 3.0 (Comprehensive with Charades updates)  
**Status**: Production Ready ✅

