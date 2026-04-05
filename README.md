<!--  github.com/chaz-ux/RoomThirty7  -->

<div align="center">

```
_____   ____   ____  __  __   _______ _    _ _____ _____ _______ __     __ ______ 
 |  __ \ / __ \ / __ \|  \/  | |__   __| |  | |_   _|  __ \__   __\ \   / /|____  |
 | |__) | |  | | |  | | \  / |    | |  | |__| | | | | |__) | | |   \ \_/ /     / / 
 |  _  /| |  | | |  | | |\/| |    | |  |  __  | | | |  _  /  | |    \   /     / /  
 | | \ \| |__| | |__| | |  | |    | |  | |  | |_| |_| | \ \  | |     | |     / /   
 |_|  \_\\____/ \____/|_|  |_|    |_|  |_|  |_|_____|_|  \_\ |_|     |_|    /_/
```

[![typing](https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=700&size=16&pause=1200&color=FF1744&center=true&vCenter=true&width=600&lines=No+boards.+No+pieces.+Just+chaos.;6+games.+One+room.+Maximum+damage.;Play+at+roomthirty7-baefb.web.app)](https://git.io/typing-svg)

[![Live](https://img.shields.io/badge/LIVE-roomthirty7.web.app-FF1744?style=for-the-badge&logoColor=white)](https://roomthirty7-baefb.web.app)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://roomthirty7-baefb.web.app)
[![YouTube](https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/@ROOMTHIRTY7)

</div>

---

## About

**ROOM 37** is a mobile-first party games PWA built for real friend groups playing together in the same room.

✅ **No downloads** — web app works instantly  
✅ **No accounts** — scan QR code, join immediately  
✅ **Local & Online modes** — pass-the-phone or play remotely  
✅ **6 complete games** — Mafia, Movie, Imposter, 30 Seconds, Country Guesser, Hangman  

Built in Nairobi 🇰🇪 for global chaos.

---

## 🎮 The Games

| Game | Description | Players | Mode |
|------|-------------|---------|------|
| 🎭 **Mafia** | Find the killers before they eliminate you. Deception. Logic. Betrayal. | 5–15 | Local/Online |
| 🍿 **Guess the Movie** | Decode emoji clues before the clock runs out. | 2–10 | Local/Online |
| 🕵️ **Imposter** | One player doesn't belong. Find them or survive as one. | 4–12 | Local |
| ⏱️ **30 Seconds** | Describe 5 words in 30 seconds without saying the word itself. | 2–10 | Local |
| 🌍 **Country Guesser** | Identify countries from emoji clues about culture, food, landmarks. | 2–10 | Local/Online |
| ⚡ **Hangman** | Classic hangman. One wrong letter at a time. Ruthless. | 2–8 | Local/Online |

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 · TypeScript · Vite 7 |
| **Styling** | CSS3 · Custom design system · Neon aesthetics |
| **Routing** | React Router v6 |
| **State** | Firebase Realtime Database |
| **Auth** | Firebase Authentication |
| **Hosting** | Firebase Hosting (CDN) |
| **PWA** | vite-plugin-pwa · Offline support · Service Workers |
| **Physics** | Matter.js (Imposter game) |
| **Videos** | YouTube RSS (no API quota) |

---

## 📂 Project Structure

```
radiant-meteoroid/
├── src/
│   ├── games/
│   │   ├── mafia/              # Social deduction game
│   │   │   ├── MafiaGame.tsx   # Main game (1,600+ lines)
│   │   │   └── Mafia.css       # Styling
│   │   ├── movie/              # Emoji decode game
│   │   ├── country/            # Emoji geography game
│   │   ├── imposter/           # Physics-based imposter finder
│   │   ├── 30seconds/          # Team description game
│   │   ├── hangman/            # Word guessing game
│   │   └── charades/           # Acting game (archived)
│   ├── pages/
│   │   ├── Home.tsx            # Game selection screen
│   │   ├── Lobby.tsx           # Room setup & player join
│   │   └── Support.tsx         # Links to YouTube & donations
│   ├── context/
│   │   ├── MultiplayerContext  # Shared game state & Firebase sync
│   │   └── ThemeContext        # Dark/light mode
│   ├── components/
│   │   ├── NeonLogo.tsx        # Animated branding
│   │   └── NeonLogo.css
│   ├── hooks/
│   │   └── useMatterDOM.ts     # Matter.js integration
│   ├── services/
│   │   └── youtube.ts          # RSS feed parser
│   ├── styles/
│   │   └── animations.css      # Global animations
│   ├── App.tsx                 # Router & layout
│   ├── main.tsx                # Entry point
│   └── firebase.ts             # Firebase config
├── public/
│   └── offline.html            # Fallback for offline
├── dist/                       # Build output (production)
├── DEVELOPMENT_GUIDE.md        # Developer reference
├── PROJECT_COMPLETION_REPORT.md # Implementation details
├── VOTING_SYSTEM_FIX.md        # Voting mechanics documentation
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase account

### Install

```bash
git clone https://github.com/chaz-ux/RoomThirty7.git
cd RoomThirty7
npm install
```

### Development Server

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### Firebase Configuration

Create `src/firebase.ts` with your Firebase credentials:

```typescript
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  databaseURL:       "https://YOUR_PROJECT.firebaseio.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
```

### Build & Deploy

```bash
npm run build
firebase deploy
```

Hosted at: `https://roomthirty7-baefb.web.app`

---

## 🎮 How to Play

### Local Mode (Pass-the-Phone)
1. **Host** creates a room and selects a game
2. **Players** scan QR code and join the room
3. **Phone is passed** around — each player sees their private view
4. **Game progresses** with sequential turns or phases

### Online Mode
1. **Host** creates a room and shares the link
2. **Players** join from their own devices
3. **All see the game simultaneously** with real-time updates
4. **Firebase syncs everything** instantly

---

## 🎯 Mafia Game — Complete Redesign

The **Mafia** game has been completely redesigned with perfect game mechanics and transparent rules.

### Game Phases

```
LOBBY
  ↓
ROLE_REVEAL (each player shown their secret role)
  ↓
NIGHT_PASS / NIGHT_ONLINE
  └─ Mafia chooses a target to eliminate
  └─ Doctor (if assigned) can heal one player
  ↓
MORNING_REVEAL (announce who died)
  ↓
DAY_DISCUSS (120 seconds, everyone debates)
  ↓
VOTE (all players vote, no skip)
  ├─ TIE? → VOTE_REVOTE (fresh vote, skip disabled)
  └─ NO TIE? → VOTE_REVEAL (show ballot, 4s)
  ↓
EXECUTION (show who was eliminated & their role)
  ↓
ELIMINATED_CHOICE (eliminated player chooses: stay & chat or watch silently)
  ↓
[Loop back to NIGHT or GAME_OVER if winner detected]
  ↓
GAME_OVER (declare village or mafia victory)
```

### Key Mechanics

**Voting System**
- ✅ Fully digital voting (both local & online modes)
- ✅ Tie detection: 2+ players with same max votes → automatic re-vote
- ✅ Re-votes are mandatory (no skip allowed)
- ✅ Auto-lock: resolves instantly when all players vote (no timer wait)
- ✅ Public ballot: everyone sees real-time vote counts

**Player Roles**
- 🌾 **Villager** — win by eliminating all mafia
- 🔪 **Mafia** — win when they equal or outnumber villagers
- 👨‍⚕️ **Doctor** (optional in larger groups) — heal one player per night

**Health System**
- 🟢 **Healthy** — takes 1 hit to die
- 🟡 **Wounded** — takes 1 more hit to die
- ⚫ **Dead** — can still chat if chosen

**Death Mechanics**
- Mafia can target anyone
- Doctor can heal/protect one player
- Wounded players take 2 hits total to die
- Dead players choose: continue chatting or spectate silently

---

## 🎬 Development Notes

### Game State Management

All games use **Firebase Realtime Database** for shared state:

```typescript
interface SharedState {
  phase: string;              // Current game phase
  players: Player[];          // All players in room
  roles: Record<string, Role>;     // Player role assignments
  health: Record<string, Health>;  // Player status
  // ... game-specific fields
}
```

### Local vs Online Detection

```typescript
const mode = useMultiplayer().mode;  // 'local' | 'online'

if (mode === 'local') {
  // Pass-the-phone style (one player per turn)
} else {
  // All players see simultaneously with real-time updates
}
```

### Adding New Games

1. Create folder: `src/games/mygame/`
2. Implement: `MyGameComponent.tsx` (main component)
3. Style: `MyGame.css` (game-specific styles)
4. Register in `Lobby.tsx` and `Home.tsx`
5. Export from `App.tsx`

---

## 📺 The Channel

We play these games live on **YouTube** so you can play along.

**Subscribe and watch the chaos unfold**: https://www.youtube.com/@ROOMTHIRTY7

**Support via M-Pesa**: Till `4942130` 💝 — keeps the servers running

---

## 📝 Documentation

- **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** — Code architecture & patterns
- **[PROJECT_COMPLETION_REPORT.md](./PROJECT_COMPLETION_REPORT.md)** — Implementation details
- **[VOTING_SYSTEM_FIX.md](./VOTING_SYSTEM_FIX.md)** — Voting mechanics deep dive

---

## ✨ Recent Updates

- ✅ **Mafia voting system** completely redesigned with tie-breaking
- ✅ **Sequential voting** for pass-the-phone mode with "Waiting for X..." UI
- ✅ **Team visibility** in Charades — players see their team assignment
- ✅ **Actor rotation** — sequential cycling through all players
- ✅ **ELIMINATED_CHOICE phase** — dead players choose stay/spectate in local mode

---

<div align="center">

Built with chaos in mind. Tested with real friends. Ready for global chaos.

*Private project · All rights reserved · Made in Nairobi 🇰🇪*

</div>