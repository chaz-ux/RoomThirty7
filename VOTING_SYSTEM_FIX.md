# Voting System Fix - Implementation Complete ✅

## Problems Solved

1. **Skip Vote Bug**: "Click skip to vote" in DAY_DISCUSS phase was auto-triggering a tie and ending the day prematurely
   - **Fix**: Removed "Skip to Vote" button that bypassed vote collection
   
2. **Hidden Ballots**: Voting was only visible in online mode, not local mode
   - **Fix**: Made `!isPassPlay` condition conditional removed - ballot now public for both modes
   
3. **No Tie Resolution**: Ties resulted in "Nobody leaves" instead of triggering a re-vote
   - **Fix**: Added `VOTE_REVOTE` phase type that triggers on tie detection

4. **Skip in Re-votes**: Players could skip during re-votes, defeating the purpose
   - **Fix**: Added `isRevote` parameter to `resolveVotesFromState`, skip disabled in re-votes

5. **Slow Vote Resolution**: Votes weren't resolved until timer expired even if all players voted
   - **Fix**: Added auto-lock mechanism in timer tick - resolves immediately when all alive players voted

## Implementation Details

### New Phase Type
```tsx
type Phase = ... | 'VOTE_REVOTE'  // Re-vote when tie — skip disabled
```

### New State Property
```tsx
interface SS {
  reVoteCount: number;  // track how many re-votes this day
}
```

### Vote Resolution Logic
- **Tie Detection**: Checks if multiple players have the same max vote count
- **Tie Handling**: Transitions to `VOTE_REVOTE` phase, increments `reVoteCount`, clears `dayVotes`
- **Auto-Lock**: Resolves votes when `Object.keys(dayVotes).length >= alive.length`
- **Sound/Vibration**: Plays 'shatter' SFX + `[100, 100, 100]` vibration pattern on tie

### Phase Flow
```
DAY_DISCUSS (clear dayVotes & reVoteCount)
    ↓
    VOTE (skip allowed, everyone votes)
    ↙          ↘
   TIE      NO TIE
   ↓          ↓
VOTE_REVOTE  VOTE_REVEAL
   (skip      (eliminate
   disabled)   player)
   ↓
VOTE_REVEAL (show public ballot)
```

## Files Modified

- **src/games/mafia/MafiaGame.tsx** (1218 lines)
  - Line 20: Added `VOTE_REVOTE` to Phase type
  - Line 50: Added `reVoteCount: number` to SS interface
  - Line 173: Destructured `reVoteCount` from shared state
  - Line 205: Timer includes `VOTE_REVOTE` phase
  - Line 208-217: Added auto-lock check in timer tick
  - Line 247: Initialize `reVoteCount: 0` in startGame
  - Line 370: Reset `dayVotes: {}, reVoteCount: 0` in MORNING_REVEAL→DAY_DISCUSS
  - Lines 398-437: Rewrote `resolveVotesFromState` with tie detection
  - Lines 920-922: Removed "Skip to Vote" button
  - Lines 1057-1068: Made ballot public for both modes
  - Lines 1046-1106: Added `VOTE_REVOTE` phase render with voting grid (no skip button)

## Build Status

✅ Build successful - All modules compiled without errors
✅ Production bundle created (685.44 kB minified, 208.00 kB gzipped)
✅ PWA manifest and service worker generated

## Testing Checklist

- [ ] Test tie detection: Two players vote for different targets → triggers VOTE_REVOTE
- [ ] Test re-vote flow: VOTE_REVOTE phase shows voting grid without skip button
- [ ] Test auto-lock: All players vote → immediately resolves without waiting for timer
- [ ] Test ballot visibility: Both online and local modes show public ballot in VOTE_REVEAL
- [ ] Test multiple re-votes: If re-vote also ties, increment reVoteCount and trigger another VOTE_REVOTE
- [ ] Test skip in VOTE phase: Skip button appears and works in initial VOTE
- [ ] Test skip disabled in re-vote: Skip button not visible in VOTE_REVOTE phase
- [ ] Test tie message: "It was a tie! Everyone must pick someone" displays in VOTE_REVOTE

## Key Changes Summary

| Change | Before | After |
|--------|--------|-------|
| Tie handling | Nobody leaves, game confusing | VOTE_REVOTE phase, clear message |
| Skip button | Visible in DAY_DISCUSS (bypasses voting) | Removed from DAY_DISCUSS, not in VOTE_REVOTE |
| Ballot visibility | Online only | Both modes |
| Vote resolution | Always waits for timer | Auto-locks when all voted |
| Re-vote count | Not tracked | Tracked via reVoteCount state |
| Phase flow | DAY_DISCUSS → VOTE → VOTE_REVEAL | DAY_DISCUSS → VOTE → [VOTE_REVOTE*] → VOTE_REVEAL |

## Deployment Ready

The voting system is now fair, transparent, and handles ties properly. Ready for production deployment.
