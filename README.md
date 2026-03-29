# ROOM 37 - Party Games

A web-based multiplayer party game platform. Play classic party games with friends in real-time — no boards, no pieces, just pure chaotic fun.

**Live:** https://roomthirty7-baefb.web.app

## Games

- **Mafia** - Social deduction with roles and voting
- **Movie** - Guess the movie from clues
- **Imposter** - Find the imposter among players
- **30 Seconds** - Describe and guess in rapid rounds
- **Charades** - Act it out!
- **Hangman** - Classic word guessing

## Tech Stack

- **Frontend:** React 19 + TypeScript
- **Routing:** React Router v6
- **Build Tool:** Vite 7
- **Database:** Firebase Realtime Database
- **Auth:** Firebase Authentication
- **Physics:** Matter.js (for game interactions)
- **PWA:** Vite PWA Plugin (offline support)

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Firebase Setup

To enable online multiplayer sync, replace the placeholder config in `src/firebase.ts` with your Firebase project credentials:

```typescript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

## Project Structure

```
src/
├── games/           # Individual game implementations
│   ├── mafia/
│   ├── movie/
│   ├── imposter/
│   ├── 30seconds/
│   ├── charades/
│   └── hangman/
├── pages/           # Route pages (Home, Lobby, Support)
├── context/         # React contexts (Theme, Multiplayer)
├── hooks/           # Custom React hooks
├── services/        # API integrations
└── styles/          # Global styles and animations
```

## Deployment

Deployed automatically to Firebase Hosting via `firebase deploy`.

## License

Private project - All rights reserved.
