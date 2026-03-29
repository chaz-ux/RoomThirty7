<!--  github.com/chaz-ux/RoomThirty7  -->

<div align="center">

```
 ____  ___  ___  __  __    ____  ____
(  _ \(  _)(  _)(  \/  )  (__  )(__  )
 )   / ) _)  ) _) )    (   / _/  / _/
(_)\_)(___)(___)(\_/\_/  (____)(____)
```

[![typing](https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=700&size=16&pause=1200&color=FF1744&center=true&vCenter=true&width=600&lines=No+boards.+No+pieces.+Just+chaos.;6+games.+One+room.+Maximum+damage.;Play+at+roomthirty7-baefb.web.app)](https://git.io/typing-svg)

[![Live](https://img.shields.io/badge/LIVE-roomthirty7.web.app-FF1744?style=for-the-badge&logoColor=white)](https://roomthirty7-baefb.web.app)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://roomthirty7-baefb.web.app)
[![YouTube](https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/@ROOMTHIRTY7)

</div>

---

```
$ cat ./about.txt

  ROOM 37 is a mobile-first party games PWA built for real friend groups.
  No downloads. No accounts. Scan, join, play.
  Local pass-and-play or online multiplayer — your room, your rules.
```

---

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🎮  THE GAMES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

| game | vibe | players |
|------|------|---------|
| 🎭 **Mafia** | Social deduction. Find the killers before it's too late. | 5–15 |
| 🍿 **Guess the Movie** | Decode emoji clues before the clock hits zero. | 2–10 |
| 🕵️ **Imposter** | One of you doesn't belong. Find them. | 4–12 |
| ⏱️ **30 Seconds** | 5 words. 30 seconds. Describe without saying the word. | 2–10 |
| 🎬 **Charades** | Act it out. No sounds. No words. Pure chaos. | 2–10 |
| ⚡ **Hangman** | One wrong letter at a time. Classic. Ruthless. | 2–8 |

---

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ⚙️  STACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Frontend    →  React 19 · TypeScript · Vite 7
  Styling     →  CSS Modules · Custom design system
  Routing     →  React Router v6
  Realtime    →  Firebase Realtime Database
  Auth        →  Firebase Authentication
  Hosting     →  Firebase Hosting
  PWA         →  vite-plugin-pwa (offline support)
  Physics     →  Matter.js
  Videos      →  YouTube RSS (no API key, no quota)
```

---

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🗂️  STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  src/
  ├── games/          individual game implementations
  │   ├── mafia/
  │   ├── movie/
  │   ├── imposter/
  │   ├── 30seconds/
  │   ├── charades/
  │   └── hangman/
  ├── pages/          Home · Lobby · Support
  ├── context/        ThemeContext · MultiplayerContext
  ├── hooks/          custom React hooks
  ├── services/       youtube.ts (RSS feed)
  └── styles/         global design system
```

---

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🚀  GETTING STARTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

```bash
git clone https://github.com/chaz-ux/RoomThirty7.git
cd RoomThirty7
npm install
npm run dev
```

**Firebase setup** — replace the config in `src/firebase.ts`:

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
```

**Deploy:**
```bash
npm run build
firebase deploy
```

---

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📺  THE CHANNEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

<div align="center">

We play these games on camera so you can play along.
Subscribe and watch the chaos unfold.

[![YouTube](https://img.shields.io/badge/Subscribe-@ROOMTHIRTY7-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/@ROOMTHIRTY7)

**M-Pesa Till:** `4942130` — keep the servers alive 💝

</div>

---

<div align="center">

*Private project · All rights reserved · Built in Nairobi 🇰🇪*

</div>