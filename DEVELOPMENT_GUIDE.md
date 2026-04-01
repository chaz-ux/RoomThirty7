# Mafia Game — Development Guide

## Code Architecture

### Component Structure
- **Main**: `MafiaGame.tsx` (1270+ lines)
- **Styling**: `Mafia.css` (1200+ lines)
- **Context**: `MultiplayerContext.tsx` (manages shared state)

### Key Patterns

#### Phase Management
```tsx
type Phase = 'LOBBY' | 'ROLE_REVEAL' | 'NIGHT_PASS' | 'NIGHT_ONLINE' | 'MORNING_REVEAL' | 'DAY_DISCUSS' | 'VOTE' | 'VOTE_REVOTE' | 'VOTE_REVEAL' | 'EXECUTION' | 'GAME_OVER'
```

Each phase has:
1. Conditional render block: `if (phase === 'PHASE_NAME') { return (...) }`
2. Timer/countdown if needed
3. Auto-advance effect when complete
4. Local state management within phase

#### Shared State Interface
```tsx
interface SS {
  phase: Phase;
  roles: Record<string, Role>;                // 'MAFIA' | 'VILLAGER'
  health: Record<string, Health>;             // 'healthy' | 'wounded' | 'dead'
  revealIdx: number;                          // Role reveal progress
  passOrder: string[];                        // Night pass order
  passIndex: number;
  nightActions: NightAction[];                // Night action log
  mafiaVotes: Record<string, string>;         // Mafia voting
  dayVotes: Record<string, string | 'skip'>; // Day voting
  reVoteCount: number;                        // Tie-break counter
  endTime: number;                            // Timer end timestamp
  roundNumber: number;
  eliminatedThisRound: string | null;
  woundedThisRound: string | null;
  winner: 'VILLAGERS' | 'MAFIA' | null;
  chat: ChatMsg[];                            // Public discussion
  ghostChat: ChatMsg[];                       // Dead player chat
}
```

#### Local State
```tsx
const [localNightPhase, setLocalNightPhase] = useState<'waiting'|'identity'|'action'|'locking'>('waiting');
const [spectateChoice, setSpectateChoice] = useState<'playing'|'spectate'|null>(null);
const [chatInput, setChatInput] = useState('');
const [timeLeft, setTimeLeft] = useState(0);
```

---

## Key Functions

### Game Initialization
```tsx
const startGame = async () => {
  // Shuffle players for mafia assignment
  // Assign roles based on player count
  // Initialize health records
  // Set phase to ROLE_REVEAL
  // Reset all counters
}
```

### Win Checking
```tsx
const checkWin = (h: Record<string, Health>): 'VILLAGERS' | 'MAFIA' | null => {
  const aM = /* count alive mafia */
  const aV = /* count alive villagers */
  if (aM === 0) return 'VILLAGERS';  // All mafia dead
  if (aM >= aV) return 'MAFIA';      // Mafia >= villagers
  return null;
}
```

### Vote Resolution
```tsx
const resolveVotesFromState = useCallback(async (
  dv: Record<string, string | 'skip'>,   // day votes
  h: Record<string, Health>,              // current health
  isRevote: boolean = false               // is this a re-vote?
) => {
  // Count non-skip votes
  // Find max vote recipient
  // Check for tie: multiple players with same max
  // On tie: transition to VOTE_REVOTE, clear dayVotes, increment reVoteCount
  // On no-tie: eliminate player, show VOTE_REVEAL
}
```

### Night Resolution
```tsx
const resolveNightOnline = useCallback(async (
  mVotes: Record<string, string>,    // mafia votes
  currentHealth: Record<string, Health>
) => {
  // Count mafia votes
  // Require majority (floor(count/2) + 1)
  // Apply wound or elimination
  // Auto-advance to MORNING_REVEAL
})
```

---

## Important State Resets

### When Entering DAY_DISCUSS
```tsx
dayVotes: {}              // Fresh ballot
reVoteCount: 0           // Tie counter resets
```

### When Entering NIGHT (either mode)
```tsx
mafiaVotes: {}           // Clear mafia votes
dayVotes: {}             // Clear day votes
nightActions: []         // Clear night log
chat: []                 // Clear discussion
passIndex: 0             // Reset device pass
```

### When Starting New Game
```tsx
const newHealth: Record<string, Health> = {}
const newRoles: Record<string, Role> = {}
players.forEach(p => newHealth[p.id] = 'healthy')
```

---

## Timer System

### Phases That Need Timer
- `DAY_DISCUSS` (DISCUSS_TIME = 120s)
- `VOTE` (VOTE_TIME = 45s)
- `VOTE_REVOTE` (VOTE_TIME = 45s)
- `NIGHT_ONLINE` (NIGHT_TIME = 30s)

### Auto-Lock Voting
When all alive players have voted in VOTE or VOTE_REVOTE:
```tsx
const votedCount = Object.keys(latest.dayVotes).length;
const aliveCount = latest.alive.length;
if (votedCount >= aliveCount) {
  resolveVotesFromState(...)  // Resolve immediately
}
```

### Timer Tick Pattern
```tsx
useEffect(() => {
  const needsTimer = /* phase check */
  if (!needsTimer) return
  
  const tick = () => {
    const rem = Math.ceil((endTime - Date.now()) / 1000)
    setTimeLeft(rem)
    
    // Check auto-lock
    // Check timer expiry
    // Resolve accordingly
  }
  
  tick()  // Run immediately
  const interval = setInterval(tick, 300)  // Poll every 300ms
  return () => clearInterval(interval)
}, [phase, endTime])
```

---

## UI Patterns

### Phase Header
Every phase should start with:
```tsx
<div className="mf-phase-header">
  <h2 className="mf-phase-title">🎯 PHASE NAME</h2>
  <p className="mf-phase-hint">Clear explanation of what to do</p>
</div>
```

### Vote Count Display
```tsx
const voteCountsDay: Record<string, number> = {}
Object.values(dayVotes).forEach(v => {
  if (v && v !== 'skip') voteCountsDay[v] = (voteCountsDay[v] ?? 0) + 1
})
// Display: {vc > 0 && <span className="mf-vote-dot">{vc}</span>}
```

### Timer Visual
```tsx
const timerPct = Math.max(0, ((endTime - Date.now()) / (PHASE_TIME * 1000)) * 100)
<div className="mf-timer-track">
  <div className={`mf-timer-fill ${urgent ? 'urgent' : ''}`}
    style={{ width: `${timerPct}%` }} />
</div>
```

### Chat Pattern
```tsx
{!isPassPlay && spectateChoice !== 'spectate' && (
  <div className="mf-chat-panel">
    {/* Feed */}
    {chat.map((m, i) => (
      <div key={i} className={`mf-chat-msg ${health[m.playerId] === 'dead' ? 'dead-player' : ''}`}>
        <span className="mf-chat-name">{sender?.name} {isDead && '👻'}</span>
        <span className="mf-chat-text">{m.text}</span>
      </div>
    ))}
    {/* Input */}
    <form onSubmit={sendChat}>
      <input value={chatInput} onChange={e => setChatInput(e.target.value)} />
      <button type="submit">→</button>
    </form>
  </div>
)}
```

---

## CSS Architecture

### Theme Variables
```css
--mf-bg:        #060408      /* Dark background */
--mf-red:       #e8182a      /* Mafia/danger */
--mf-green:     #00e887      /* Villager/success */
--mf-amber:     #f5a623      /* Secondary action */
--mf-blue:      #3d8bff      /* Info */
--mf-wound:     #ff7a00      /* Wounded state */
--mf-white:     #ffffff      /* Text */
--mf-muted:     rgba(255,255,255,0.5)
--mf-dim:       rgba(255,255,255,0.25)
--mf-surface:   rgba(255,255,255,0.05)
--mf-border:    rgba(255,255,255,0.08)
```

### Component Modifiers
```css
.mf-target-btn.selected { /* Player tapped this button */ }
.mf-target-btn.wounded  { /* Target is wounded */ }
.mf-chat-msg.dead-player { /* Dead player message */ }
.mf-timer-fill.urgent   { /* Timer < 5s */ }
```

---

## Common Issues & Solutions

### Issue: State not updating in components
**Solution**: Always use `await setSharedState(...)` and check `stateRef.current` in timers

### Issue: Votes not counting correctly
**Solution**: Filter out 'skip' votes before counting: `if (v && v !== 'skip')`

### Issue: Dead players breaking UI
**Solution**: Check `health[p.id] === 'dead'` before rendering interaction elements

### Issue: Timer running during phase transitions
**Solution**: Check `phase` in timer useEffect cleanup and return early if wrong phase

### Issue: Eliminated player still voting
**Solution**: Use `!isDead && !myVote` conditions before showing vote buttons

---

## Adding New Features

### To Add a New Phase:
1. Add to `Phase` type union
2. Add phase header section in render
3. Add conditional render: `if (phase === 'NEW_PHASE')`
4. Handle timer if needed
5. Add state transition from previous phase
6. Add CSS styling for `.mf-new-phase-*` classes

### To Add a New Role:
1. Update `type Role` union
2. Update `getMafiaCount()` if needed
3. Add role-specific action in night phase
4. Add role reveal styling
5. Add to final scoreboard
6. Test win conditions

### To Add Spectator Features:
1. Add to `spectateChoice` state handling
2. Check `spectateChoice !== 'spectate'` in chat
3. Add CSS for spectator styling
4. Update phase access rules

---

## Performance Notes

- Component renders on every shared state change
- Timer ticks 3x per second (300ms interval)
- No expensive re-computations
- Chat limited to last 15 messages shown
- Total bundle size: ~686 kB (acceptably large for feature-rich game)

---

## Testing Strategy

### Manual Testing
1. Create 5+ player room
2. Test each phase transition
3. Trigger tie scenarios
4. Test elimination choices
5. Test chat with dead players
6. Test both local and online modes

### Edge Cases
- Min 3 players (game still works)
- Max players (no limit imposed)
- All mafia elected (game ends)
- All villagers die (game ends)
- Player disconnects mid-game (handled by multiplayer context)

---

## Future Refactoring Ideas

1. **Extract phase components** into separate files for better organization
2. **Use reducer for state** instead of scattered setSharedState calls
3. **Create phase interface** for consistent structure
4. **Separate sound/vibration** into utility module
5. **Component composition** for vote grids, timer displays, etc.

---

## Deployment Checklist

- [ ] Run `npm run build` successfully
- [ ] No console errors/warnings
- [ ] Test all phases work
- [ ] Timer accuracy verified
- [ ] State resets between games
- [ ] Chat works in both modes
- [ ] Eliminated player choice respected
- [ ] Mobile responsive (check on phone)
- [ ] PWA works offline
- [ ] Service worker updates properly

---

## Resources

- **Mafia Rules**: [Wikipedia Mafia]
- **Game Design**: [GAME_FLOW_REDESIGN.md](./GAME_FLOW_REDESIGN.md)
- **Voting Fix**: [VOTING_SYSTEM_FIX.md](./VOTING_SYSTEM_FIX.md)
- **Context**: [MultiplayerContext.tsx](./src/context/MultiplayerContext.tsx)

---

**Last Updated**: April 1, 2026  
**Version**: 2.0 (Comprehensive Game Flow Redesign)
