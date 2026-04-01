import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMultiplayer } from '../../context/MultiplayerContext';
import './Mafia.css';

// ─────────────────────────────────────────────────────────────
//  MAFIA — ROOM 37
//
//  Flow:
//  LOBBY → ROLE_REVEAL (pass device, each sees role) →
//  NIGHT_PASS (mafia picks target, villagers get placebo) →
//  MORNING_REVEAL → DAY_DISCUSS → VOTE → VOTE_REVEAL →
//  EXECUTION → back to NIGHT_PASS (or GAME_OVER)
//
//  Local mode vote fix:
//  No digital voting on one phone. Instead, host calls
//  the vote out loud, physically counts hands, then selects
//  the person to eliminate via a simple tap UI.
// ─────────────────────────────────────────────────────────────

type Phase =
  | 'LOBBY'
  | 'ROLE_REVEAL'      // NEW: pass device, each player sees role
  | 'NIGHT_PASS'       // Local: device passed for night actions
  | 'NIGHT_ONLINE'     // Online: simultaneous mafia voting
  | 'MORNING_REVEAL'
  | 'DAY_DISCUSS'
  | 'VOTE'             // Local: host-selected. Online: digital
  | 'VOTE_REVOTE'      // Re-vote when tie — skip disabled
  | 'VOTE_REVEAL'
  | 'EXECUTION'
  | 'GAME_OVER';

type Role = 'VILLAGER' | 'MAFIA';
type Health = 'healthy' | 'wounded' | 'dead';

interface NightAction { actorId: string; targetId: string | null; isMafia: boolean; }
interface ChatMsg { playerId: string; text: string; ts: number; }

interface SS {
  phase: Phase;
  roles: Record<string, Role>;
  health: Record<string, Health>;
  // Role reveal
  revealIdx: number;        // which player is seeing their role
  // Night
  passOrder: string[];
  passIndex: number;
  nightActions: NightAction[];
  mafiaVotes: Record<string, string>;
  // Day
  dayVotes: Record<string, string | 'skip'>;
  reVoteCount: number;      // track how many re-votes this day
  endTime: number;
  roundNumber: number;
  eliminatedThisRound: string | null;
  woundedThisRound: string | null;
  winner: 'VILLAGERS' | 'MAFIA' | null;
  chat: ChatMsg[];
  ghostChat: ChatMsg[];
}

const DISCUSS_TIME = 90;
const VOTE_TIME    = 30;   // online only
const NIGHT_TIME   = 25;   // online only

const getMafiaCount = (n: number) => n >= 9 ? 3 : n >= 6 ? 2 : 1;

const shuffle = <T,>(a: T[]): T[] => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

const vibe = (p: number | number[]) => { try { navigator.vibrate(p); } catch (_) {} };

// ── Audio ─────────────────────────────────────────────────────
let _ctx: AudioContext | null = null;
const audio = () => {
  if (!_ctx) _ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return _ctx;
};
const sfx = (type: 'night' | 'morning' | 'kill' | 'shatter' | 'vote') => {
  try {
    const ctx = audio();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    if (type === 'night') {
      o.type = 'sine';
      o.frequency.setValueAtTime(180, ctx.currentTime);
      o.frequency.setValueAtTime(120, ctx.currentTime + 0.8);
      g.gain.setValueAtTime(0.18, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
      o.start(); o.stop(ctx.currentTime + 2);
    } else if (type === 'morning') {
      o.frequency.setValueAtTime(523, ctx.currentTime);
      o.frequency.setValueAtTime(659, ctx.currentTime + 0.15);
      o.frequency.setValueAtTime(784, ctx.currentTime + 0.3);
      g.gain.setValueAtTime(0.2, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
      o.start(); o.stop(ctx.currentTime + 0.7);
    } else if (type === 'kill') {
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(320, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.9);
      g.gain.setValueAtTime(0.55, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
      o.start(); o.stop(ctx.currentTime + 1);
    } else if (type === 'shatter') {
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(440, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.5);
      g.gain.setValueAtTime(0.4, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      o.start(); o.stop(ctx.currentTime + 0.6);
    } else if (type === 'vote') {
      o.type = 'square';
      o.frequency.setValueAtTime(200, ctx.currentTime);
      g.gain.setValueAtTime(0.25, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      o.start(); o.stop(ctx.currentTime + 0.3);
    }
  } catch (_) {}
};


// ── Confetti ──────────────────────────────────────────────────
const Confetti: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;
  return (
    <div className="mf-confetti" aria-hidden>
      {Array.from({ length: 24 }, (_, i) => (
        <div key={i} className={`mf-cp mf-cp-${i % 6}`}
          style={{ '--i': i, '--r': Math.random().toFixed(2) } as React.CSSProperties} />
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
const MafiaGame: React.FC = () => {
  const { players, sharedState, setSharedState, isHost, currentPlayerId, mode } =
    useMultiplayer() as any;

  const isPassPlay = mode === 'local';

  // Local state
  const [localNightPhase, setLocalNightPhase] = useState<'waiting'|'identity'|'action'|'locking'>('waiting');
  const [revealStep,      setRevealStep]      = useState<'waiting'|'revealed'|'done'>('waiting');
  const [chatInput,       setChatInput]       = useState('');
  const [ghostInput,      setGhostInput]      = useState('');
  const [timeLeft,        setTimeLeft]        = useState(0);
  const [showConfetti,    setShowConfetti]    = useState(false);

  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Shared state with safe defaults
  const s = (sharedState ?? {}) as Partial<SS>;
  const phase      = s.phase           ?? 'LOBBY';
  const roles      = s.roles           ?? {};
  const health     = s.health          ?? {};
  const revealIdx  = s.revealIdx       ?? 0;
  const passOrder  = s.passOrder       ?? [];
  const passIndex  = s.passIndex       ?? 0;
  const nightActs  = s.nightActions    ?? [];
  const mafiaVotes = s.mafiaVotes      ?? {};
  const dayVotes   = s.dayVotes        ?? {};
  const reVoteCount = s.reVoteCount    ?? 0;
  const endTime    = s.endTime         ?? 0;
  const roundNum   = s.roundNumber     ?? 1;
  const eliminated = s.eliminatedThisRound ?? null;
  const wounded    = s.woundedThisRound    ?? null;
  const winner     = s.winner          ?? null;
  const chat       = s.chat            ?? [];
  const ghostChat  = s.ghostChat       ?? [];

  // Add this to keep track of the absolute latest state for the timer
  const stateRef = useRef(s);
  useEffect(() => { stateRef.current = s; }, [s]);

  const myRole     = roles[currentPlayerId ?? ''] ?? null;
  const myHealth   = health[currentPlayerId ?? ''] ?? 'healthy';
  const isDead     = myHealth === 'dead';
  const isMafia    = myRole === 'MAFIA';
  const alive      = players.filter((p: any) => health[p.id] !== 'dead');
  const mafiaAlive = players.filter((p: any) => roles[p.id] === 'MAFIA' && health[p.id] !== 'dead');

  // Reset reveal step when revealIdx changes
  useEffect(() => { setRevealStep('waiting'); }, [revealIdx]);

  // ── Win check ───────────────────────────────────────────────
  const checkWin = (h: Record<string, Health>): 'VILLAGERS' | 'MAFIA' | null => {
    const aM = players.filter((p: any) => roles[p.id] === 'MAFIA'    && h[p.id] !== 'dead').length;
    const aV = players.filter((p: any) => roles[p.id] === 'VILLAGER' && h[p.id] !== 'dead').length;
    if (aM === 0) return 'VILLAGERS';
    if (aM >= aV) return 'MAFIA';
    return null;
  };

  // ── Timer ────────────────────────────────────────────────────
  useEffect(() => {
    const needsTimer = phase === 'DAY_DISCUSS' || phase === 'VOTE' || phase === 'VOTE_REVOTE' || phase === 'NIGHT_ONLINE';
    if (!needsTimer) { clearInterval(timerRef.current); return; }

    const tick = () => {
      const rem = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setTimeLeft(rem);
      
      // AUTO-LOCK: Check if all alive players have voted
      const latest = stateRef.current;
      if ((phase === 'VOTE' || phase === 'VOTE_REVOTE') && latest.alive && latest.dayVotes) {
        const votedCount = Object.keys(latest.dayVotes).length;
        const aliveCount = latest.alive.length;
        if (votedCount >= aliveCount && (isHost || isPassPlay)) {
          clearInterval(timerRef.current);
          resolveVotesFromState(latest.dayVotes || {}, latest.health || {}, phase === 'VOTE_REVOTE');
          return;
        }
      }
      
      if (rem === 0 && (isHost || isPassPlay)) {
        clearInterval(timerRef.current);
        
        // GRAB THE FRESHEST STATE HERE
        const latest = stateRef.current; 
        
        if (phase === 'DAY_DISCUSS') {
          setSharedState({ phase: 'VOTE', dayVotes: {}, endTime: Date.now() + VOTE_TIME * 1000 });
        } else if (phase === 'VOTE' || phase === 'VOTE_REVOTE') {
          resolveVotesFromState(latest.dayVotes || {}, latest.health || {}, phase === 'VOTE_REVOTE');
        } else if (phase === 'NIGHT_ONLINE') {
          resolveNightOnline(latest.mafiaVotes || {}, latest.health || {});
        }
      }
    };
    tick();
    timerRef.current = setInterval(tick, 300);
    return () => clearInterval(timerRef.current);
  }, [phase, endTime]);

  // ── Start game ───────────────────────────────────────────────
  const startGame = async () => {
    if (!isHost && !isPassPlay) return;
    const nMafia   = getMafiaCount(players.length);
    const shuffled = shuffle(players);
    const newRoles: Record<string, Role> = {};
    const newHealth: Record<string, Health> = {};
    shuffled.slice(0, nMafia).forEach((p: any) => { newRoles[p.id] = 'MAFIA'; });
    shuffled.slice(nMafia).forEach((p: any)   => { newRoles[p.id] = 'VILLAGER'; });
    players.forEach((p: any) => { newHealth[p.id] = 'healthy'; });

    await setSharedState({
      phase: 'ROLE_REVEAL',
      roles: newRoles, health: newHealth,
      revealIdx: 0,
      passOrder: shuffle(players.map((p: any) => p.id)),
      passIndex: 0, nightActions: [],
      mafiaVotes: {}, dayVotes: {}, reVoteCount: 0,
      endTime: 0, roundNumber: 1,
      eliminatedThisRound: null, woundedThisRound: null,
      winner: null, chat: [], ghostChat: [],
    });
    sfx('night'); vibe([200, 100, 200]);
  };

  // ── Role reveal ──────────────────────────────────────────────
  // In local: sequential pass-around reveal
  // In online: each player sees their own screen
  const advanceReveal = async () => {
    const next = revealIdx + 1;
    if (next >= players.length) {
      // Everyone's seen their role — start night
      await setSharedState({
        phase: isPassPlay ? 'NIGHT_PASS' : 'NIGHT_ONLINE',
        endTime: !isPassPlay ? Date.now() + NIGHT_TIME * 1000 : 0,
      });
      setLocalNightPhase('waiting');
    } else {
      await setSharedState({ revealIdx: next });
    }
  };

  // ── Night: local pass ────────────────────────────────────────
  const handleNightAction = async (targetId: string | null) => {
    setLocalNightPhase('locking');
    vibe(100);

    const actor     = passOrder[passIndex];
    const actorRole = roles[actor] ?? 'VILLAGER';
    const action: NightAction = { actorId: actor, targetId, isMafia: actorRole === 'MAFIA' };
    const updated   = actorRole === 'MAFIA'
      ? [...nightActs.filter(a => a.actorId !== actor), action]
      : nightActs;

    const nextIdx = passIndex + 1;
    const isLast  = nextIdx >= passOrder.length;

    await new Promise(r => setTimeout(r, 1600));

    if (isLast) {
      const result = resolveNightLocal(updated);
      await setSharedState({
        nightActions: updated, passIndex: nextIdx,
        phase: 'MORNING_REVEAL',
        health: result.newHealth,
        eliminatedThisRound: result.elim,
        woundedThisRound: result.wound,
        winner: checkWin(result.newHealth),
      });
      setLocalNightPhase('waiting');
      sfx(result.elim ? 'kill' : 'shatter');
    } else {
      await setSharedState({ nightActions: updated, passIndex: nextIdx });
      setLocalNightPhase('waiting');
    }
  };

  const resolveNightLocal = (actions: NightAction[]) => {
    const mActions = actions.filter(a => a.isMafia);
    const last     = mActions[mActions.length - 1];
    const targetId = last?.targetId ?? null;
    const newHealth = { ...health };
    let elim: string | null = null;
    let wound: string | null = null;
    if (targetId) {
      const cur = newHealth[targetId] ?? 'healthy';
      if (cur === 'wounded') { newHealth[targetId] = 'dead'; elim = targetId; }
      else if (cur === 'healthy') { newHealth[targetId] = 'wounded'; wound = targetId; }
    }
    return { newHealth, elim, wound };
  };

  // ── Night: online ────────────────────────────────────────────
  const castMafiaVote = async (targetId: string) => {
    if (!currentPlayerId || !isMafia) return;
    await setSharedState({ mafiaVotes: { ...mafiaVotes, [currentPlayerId]: targetId } });
  };

  const resolveNightOnline = useCallback(async (
    mVotes: Record<string, string>, 
    currentHealth: Record<string, Health>
  ) => {
    const votes: Record<string, number> = {};
    const currentMafiaAlive = players.filter((p: any) => roles[p.id] === 'MAFIA' && currentHealth[p.id] !== 'dead');
    
    currentMafiaAlive.forEach((m: any) => {
      const v = mVotes[m.id];
      if (v) votes[v] = (votes[v] ?? 0) + 1;
    });
    
    // FIX: floor + 1 forces a strict majority (2 mafia = needs 2 votes, 3 mafia = needs 2 votes)
    const threshold = Math.floor(currentMafiaAlive.length / 2) + 1; 
    const agreed    = Object.entries(votes).find(([, c]) => c >= threshold);
    const targetId  = agreed ? agreed[0] : null;
    const newHealth = { ...currentHealth };
    
    let elim: string | null = null;
    let wound: string | null = null;
    
    if (targetId) {
      const cur = newHealth[targetId] ?? 'healthy';
      if (cur === 'wounded') { newHealth[targetId] = 'dead'; elim = targetId; }
      else if (cur === 'healthy') { newHealth[targetId] = 'wounded'; wound = targetId; }
    }
    
    await setSharedState({
      phase: 'MORNING_REVEAL', health: newHealth,
      eliminatedThisRound: elim, woundedThisRound: wound,
      winner: checkWin(newHealth), mafiaVotes: {},
    });
    sfx(elim ? 'kill' : 'shatter');
  }, [players, roles]);

  // Morning → Day auto-advance
  useEffect(() => {
    if (phase !== 'MORNING_REVEAL' || (!isHost && !isPassPlay)) return;
    const t = setTimeout(async () => {
      if (winner) { await setSharedState({ phase: 'GAME_OVER' }); }
      else { await setSharedState({ phase: 'DAY_DISCUSS', endTime: Date.now() + DISCUSS_TIME * 1000, dayVotes: {}, reVoteCount: 0 }); }
      sfx('morning');
    }, 5000);
    return () => clearTimeout(t);
  }, [phase, winner]);

  // ── Day vote ─────────────────────────────────────────────────
  // ONLINE: each player taps their vote → digital ballot
  // LOCAL:  host is the referee, calls the room vote, then
  //         taps to select who gets eliminated
  const castDayVote = async (targetId: string | 'skip') => {
    if (!currentPlayerId || isDead) return;
    sfx('vote');
    await setSharedState({ dayVotes: { ...dayVotes, [currentPlayerId]: targetId } });
  };

  // LOCAL-ONLY: host directly selects who gets eliminated
  const hostSelectElimination = async (targetId: string | null) => {
    const newHealth = { ...health };
    if (targetId) { newHealth[targetId] = 'dead'; sfx('kill'); vibe([300, 100, 300]); }
    const w = checkWin(newHealth);
    await setSharedState({
      phase: 'VOTE_REVEAL', health: newHealth,
      eliminatedThisRound: targetId, woundedThisRound: null,
      winner: w, dayVotes: {},
    });
  };

  // ONLINE: resolve from ballot
  // Key fix: takes dayVotes + health as parameters so it's never stale
  // isRevote param indicates if this is a re-vote (skip votes not allowed)
  const resolveVotesFromState = useCallback(async (
    dv: Record<string, string | 'skip'>,
    h: Record<string, Health>,
    isRevote: boolean = false
  ) => {
    const counts: Record<string, number> = {};
    Object.values(dv).forEach(v => {
      if (v && v !== 'skip') counts[v] = (counts[v] ?? 0) + 1;
    });
    let maxV = 0; let topId: string | null = null;
    Object.entries(counts).forEach(([id, c]) => { if (c > maxV) { maxV = c; topId = id; } });
    
    // Check for tie
    const tied = topId ? Object.entries(counts).filter(([, c]) => c === maxV).length > 1 : false;
    
    if (tied) {
      // On tie: trigger re-vote (skip not allowed next time)
      await setSharedState({
        phase: 'VOTE_REVOTE', dayVotes: {},
        endTime: Date.now() + VOTE_TIME * 1000,
        reVoteCount: reVoteCount + 1,
      });
      sfx('shatter'); vibe([100, 100, 100]);
    } else {
      // No tie: eliminate the player
      const newHealth = { ...h };
      if (topId) { newHealth[topId] = 'dead'; sfx('kill'); vibe([300, 100, 300]); }
      const w = checkWin(newHealth);
      await setSharedState({
        phase: 'VOTE_REVEAL', health: newHealth,
        eliminatedThisRound: topId, woundedThisRound: null,
        winner: w,
      });
    }
  }, [reVoteCount]);

  // VOTE_REVEAL → EXECUTION
  useEffect(() => {
    if (phase !== 'VOTE_REVEAL' || (!isHost && !isPassPlay)) return;
    const t = setTimeout(async () => {
      await setSharedState({ phase: 'EXECUTION' });
      sfx('shatter'); vibe([500, 100, 500]);
    }, 4000);
    return () => clearTimeout(t);
  }, [phase]);

  // EXECUTION → next night or GAME_OVER
  useEffect(() => {
    if (phase !== 'EXECUTION' || (!isHost && !isPassPlay)) return;
    const t = setTimeout(async () => {
      if (winner) {
        await setSharedState({ phase: 'GAME_OVER' });
        setShowConfetti(winner === 'VILLAGERS');
      } else {
        // FIX: Shuffle ONLY the currently alive players so dead players don't get the phone
        const newPassOrder = shuffle(players.filter((p: any) => health[p.id] !== 'dead').map((p: any) => p.id));
        
        await setSharedState({
          phase: isPassPlay ? 'NIGHT_PASS' : 'NIGHT_ONLINE',
          passOrder: newPassOrder,
          passIndex: 0, nightActions: [], mafiaVotes: {}, dayVotes: {},
          endTime: !isPassPlay ? Date.now() + NIGHT_TIME * 1000 : 0,
          roundNumber: roundNum + 1,
          eliminatedThisRound: null, woundedThisRound: null, chat: [],
        });
        setLocalNightPhase('waiting');
        sfx('night');
      }
    }, 4000);
    return () => clearTimeout(t);
  }, [phase, winner, health, players]);

  // ── Chat ─────────────────────────────────────────────────────
  const sendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentPlayerId) return;
    await setSharedState({ chat: [...chat, { playerId: currentPlayerId, text: chatInput.trim(), ts: Date.now() }] });
    setChatInput('');
  };
  const sendGhost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ghostInput.trim() || !currentPlayerId) return;
    await setSharedState({ ghostChat: [...ghostChat, { playerId: currentPlayerId, text: ghostInput.trim(), ts: Date.now() }] });
    setGhostInput('');
  };

  const resetGame = async () => {
    await setSharedState({
      phase: 'LOBBY', roles: {}, health: {}, revealIdx: 0,
      passOrder: [], passIndex: 0, nightActions: [], mafiaVotes: {},
      dayVotes: {}, endTime: 0, roundNumber: 1,
      eliminatedThisRound: null, woundedThisRound: null,
      winner: null, chat: [], ghostChat: [],
    });
    setLocalNightPhase('waiting');
    setRevealStep('waiting');
  };

  // ─────────────────────── GUARDS ──────────────────────────────
  if (!players.length) return (
    <div className="mf-root">
      <div className="mf-center">
        <span className="mf-big-icon">🎭</span>
        <p className="mf-dim">Enter via the Lobby first.</p>
        <a href="/" className="mf-pill-btn">← Back to Hub</a>
      </div>
    </div>
  );

  // Ghost view — dead players in online
  if (isDead && !isPassPlay && phase !== 'LOBBY' && phase !== 'GAME_OVER') {
    return (
      <div className="mf-root mf-ghost-bg">
        <div className="mf-ghost-view">
          <div className="mf-ghost-header">
            <span className="mf-ghost-skull">👻</span>
            <h1 className="mf-ghost-title">YOU'RE DEAD</h1>
            <p className="mf-ghost-sub">Watch in silence. No spoilers.</p>
          </div>
          <div className="mf-alive-list">
            <p className="mf-section-label">Still alive ({alive.length})</p>
            {alive.map((p: any) => (
              <div key={p.id} className={`mf-alive-chip ${health[p.id] === 'wounded' ? 'wounded' : ''}`}>
                {p.name} {health[p.id] === 'wounded' && '⚠️'}
              </div>
            ))}
          </div>
          <div className="mf-ghost-chat-box">
            <p className="mf-section-label">👻 Dead chat</p>
            <div className="mf-ghost-feed">
              {ghostChat.slice(-12).map((m: any, i: number) => {
                const sender = players.find((p: any) => p.id === m.playerId);
                return <div key={i} className="mf-ghost-msg"><span className="mf-ghost-name">{sender?.name}</span><span>{m.text}</span></div>;
              })}
            </div>
            <form className="mf-chat-form" onSubmit={sendGhost}>
              <input className="mf-chat-input" type="text" placeholder="Whisper to the dead…"
                value={ghostInput} onChange={e => setGhostInput(e.target.value)} autoComplete="off"/>
              <button className="mf-chat-send" type="submit">→</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const timerPct = endTime > 0
    ? Math.max(0, ((endTime - Date.now()) / ((phase === 'VOTE' ? VOTE_TIME : phase === 'NIGHT_ONLINE' ? NIGHT_TIME : DISCUSS_TIME) * 1000)) * 100)
    : 0;

  // ─────────────────────── RENDERS ─────────────────────────────

  // ── LOBBY ──────────────────────────────────────────────────
  if (phase === 'LOBBY') {
    const nMafia = getMafiaCount(players.length);
    return (
      <div className="mf-root mf-lobby-bg">
        <div className="mf-stars" aria-hidden>
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i} className="mf-star"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 4}s` }} />
          ))}
        </div>
        <div className="mf-lobby-inner">
          <div className="mf-logo-block">
            <span className="mf-logo-icon">🔪</span>
            <h1 className="mf-logo-title">MAFIA</h1>
            <p className="mf-logo-sub">Trust no one. Watch your back.</p>
          </div>

          <div className="mf-roster">
            {players.map((p: any, i: number) => (
              <div key={p.id} className="mf-roster-row" style={{ animationDelay: `${i * 0.07}s` }}>
                <span className="mf-roster-av">{p.name.charAt(0).toUpperCase()}</span>
                <span className="mf-roster-name">{p.name}</span>
                {p.isHost && <span className="mf-crown">👑</span>}
              </div>
            ))}
          </div>

          <div className="mf-role-count-row">
            <div className="mf-role-pill mafia"><span>{nMafia}</span><span>MAFIA</span></div>
            <span className="mf-vs">vs</span>
            <div className="mf-role-pill village"><span>{players.length - nMafia}</span><span>VILLAGE</span></div>
          </div>

          <div className="mf-rules-compact">
            <div className="mf-rule-line"><span>🌙</span> Night — Mafia picks a target</div>
            <div className="mf-rule-line"><span>🌅</span> Morning — see what happened</div>
            <div className="mf-rule-line"><span>🗣️</span> Day — argue and point fingers</div>
            <div className="mf-rule-line"><span>🗳️</span> Vote — majority eliminates someone</div>
            <div className="mf-rule-line"><span>⚠️</span> Hit twice = dead. One shot if already wounded.</div>
          </div>

          {(isHost || isPassPlay)
            ? <button className="mf-main-btn mf-btn-red" onClick={startGame}
                disabled={players.length < 4}>
                {players.length < 4 ? `Need ${4 - players.length} more players` : 'START GAME →'}
              </button>
            : <p className="mf-wait-pulse">Waiting for host…</p>}

          <a href="/" className="mf-exit">← Back to Hub</a>
        </div>
      </div>
    );
  }

  // ── ROLE REVEAL ─────────────────────────────────────────────
  if (phase === 'ROLE_REVEAL') {
    const player    = players[revealIdx];
    if (!player) return null;
    const thisRole  = roles[player.id] ?? 'VILLAGER';
    const isMafiaP  = thisRole === 'MAFIA';
    const partners  = players.filter((p: any) => roles[p.id] === 'MAFIA' && p.id !== player.id);
    const isLast    = revealIdx + 1 >= players.length;
    const nextName  = !isLast ? players[revealIdx + 1]?.name : '';

    // In online mode, each player sees their own role on their own device
    // In pass-and-play, use 3-step: waiting → revealed → done
    if (!isPassPlay) {
      const isMe = player.id === currentPlayerId;
      if (!isMe) return (
        <div className="mf-root mf-night-bg">
          <div className="mf-center">
            <span className="mf-big-icon">🔐</span>
            <h2 className="mf-section-label">Roles being assigned…</h2>
            <div className="mf-reveal-dots">
              {players.map((_: any, i: number) => (
                <div key={i} className={`mf-rdot ${i < revealIdx ? 'done' : i === revealIdx ? 'cur' : ''}`} />
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`mf-root ${isMafiaP ? 'mf-identity-mafia' : 'mf-night-bg'}`}>
        <div className="mf-reveal-wrap">
          {/* Who's looking */}
          <div className="mf-reveal-who">
            <span className="mf-reveal-av">{player.name.charAt(0)}</span>
            <span className="mf-reveal-name">{player.name}</span>
          </div>
          <div className="mf-reveal-dots">
            {players.map((_: any, i: number) => (
              <div key={i} className={`mf-rdot ${i < revealIdx ? 'done' : i === revealIdx ? 'cur' : ''}`} />
            ))}
          </div>

          <p className="mf-reveal-hint">
            {revealStep === 'waiting'  && `${player.name} — tap to see your role`}
            {revealStep === 'revealed' && 'Memorise it. Then hide it.'}
            {revealStep === 'done'     && (isLast ? 'Everyone has seen their role.' : `Pass to ${nextName}`)}
          </p>

          {/* Role card */}
          <div
            className={`mf-role-card ${isMafiaP ? 'mafia' : 'village'} ${revealStep === 'revealed' ? 'open' : 'closed'}`}
            onClick={() => revealStep === 'waiting' && setRevealStep('revealed')}
          >
            {revealStep === 'revealed' ? (
              <>
                <div className="mf-role-card-icon">{isMafiaP ? '🔪' : '🌾'}</div>
                <div className="mf-role-card-label">{isMafiaP ? 'YOU ARE MAFIA' : 'YOU ARE VILLAGER'}</div>
                {isMafiaP && partners.length > 0 && (
                  <div className="mf-partners">
                    <span className="mf-partners-label">Your crew:</span>
                    {partners.map((p: any) => (
                      <span key={p.id} className="mf-partner-chip">{p.name}</span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="mf-role-card-tap">
                {revealStep === 'waiting' ? '👆 Tap to reveal' : '🔒 Hidden'}
              </div>
            )}
          </div>

          {/* Actions */}
          {revealStep === 'revealed' && (
            <button className="mf-main-btn mf-btn-green" onClick={() => setRevealStep('done')}>
              ✓ Got it — hide my role
            </button>
          )}
          {revealStep === 'done' && (
            <button className="mf-main-btn mf-btn-red" onClick={advanceReveal}>
              {isLast ? 'Start Night →' : `Pass to ${nextName} →`}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── NIGHT PASS (local) ───────────────────────────────────────
  if (phase === 'NIGHT_PASS') {
    const actorId   = passOrder[passIndex];
    const actorName = players.find((p: any) => p.id === actorId)?.name ?? '?';
    const actorRole = roles[actorId] ?? 'VILLAGER';
    const isMafiaA  = actorRole === 'MAFIA';
    const partners  = players.filter((p: any) => roles[p.id] === 'MAFIA' && p.id !== actorId);

    if (localNightPhase === 'waiting') return (
      <div className="mf-root mf-night-bg">
        <div className="mf-stars" aria-hidden>
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="mf-star" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 80}%`, animationDelay: `${Math.random() * 4}s` }} />
          ))}
        </div>
        <div className="mf-night-pass-wrap">
          <div className="mf-moon" />
          <div className="mf-night-label">NIGHT {roundNum}</div>
          <div className="mf-pass-card">
            <p className="mf-pass-inst">Pass to</p>
            <h2 className="mf-pass-name">{actorName}</h2>
            <p className="mf-pass-sub">Keep screen face-down until they have it</p>
          </div>
          <button className="mf-main-btn mf-btn-amber" onClick={() => setLocalNightPhase('identity')}>
            I'm {actorName} →
          </button>
        </div>
      </div>
    );

    if (localNightPhase === 'identity') return (
      <div className={`mf-root ${isMafiaA ? 'mf-identity-mafia' : 'mf-night-bg'}`}
        onClick={() => setLocalNightPhase('action')}>
        <div className="mf-identity-content">
          <div className="mf-role-card-icon" style={{ fontSize: '5rem' }}>{isMafiaA ? '🔪' : '🌾'}</div>
          <h1 className="mf-identity-role">{isMafiaA ? 'YOU ARE MAFIA' : 'YOU ARE VILLAGER'}</h1>
          {isMafiaA && partners.length > 0 && (
            <div className="mf-partners">
              <span className="mf-partners-label">Your crew:</span>
              {partners.map((p: any) => <span key={p.id} className="mf-partner-chip">{p.name}</span>)}
            </div>
          )}
          <p className="mf-identity-tap">Tap anywhere to continue →</p>
        </div>
      </div>
    );

    if (localNightPhase === 'action') return (
      <div className={`mf-root ${isMafiaA ? 'mf-night-bg' : 'mf-placebo-bg'}`}>
        <div className="mf-action-wrap">
          <h2 className="mf-action-title">
            {isMafiaA ? '🎯 Pick your target' : '🤔 Who do you suspect?'}
          </h2>
          {isMafiaA && <p className="mf-action-hint">You can target yourself as a false flag.</p>}
          <div className="mf-target-grid">
            {alive.map((p: any) => (
              <button key={p.id}
                className={`mf-target-btn ${health[p.id] === 'wounded' ? 'wounded' : ''}`}
                onClick={() => handleNightAction(p.id)}>
                <span className="mf-target-av">{p.name.charAt(0)}</span>
                <span className="mf-target-name">{p.name}</span>
                {health[p.id] === 'wounded' && <span className="mf-target-wound">⚠️</span>}
              </button>
            ))}
          </div>
          {isMafiaA && (
            <button className="mf-ghost-btn" onClick={() => handleNightAction(null)}>
              Skip — don't attack tonight
            </button>
          )}
          {!isMafiaA && (
            <button className="mf-ghost-btn" onClick={() => handleNightAction(null)}>
              Continue →
            </button>
          )}
        </div>
      </div>
    );

    if (localNightPhase === 'locking') return (
      <div className="mf-root mf-night-bg">
        <div className="mf-center">
          <div className="mf-spinner" />
          <p className="mf-dim">Locking in…</p>
        </div>
      </div>
    );

    return null;
  }

  // ── NIGHT ONLINE ─────────────────────────────────────────────
  if (phase === 'NIGHT_ONLINE') {
    const myMafiaVote = mafiaVotes[currentPlayerId ?? ''];
    const voteCounts: Record<string, number> = {};
    Object.values(mafiaVotes).forEach((v: any) => { voteCounts[v] = (voteCounts[v] ?? 0) + 1; });

    if (isMafia && !isDead) return (
      <div className="mf-root mf-night-bg mf-mafia-night">
        <div className="mf-stars" aria-hidden>
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="mf-star" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 70}%`, animationDelay: `${Math.random() * 4}s` }} />
          ))}
        </div>
        <div className="mf-online-night-inner">
          <div className="mf-night-hud">
            <div className="mf-online-phase-label">🔪 MAFIA STRIKES</div>
            <div className="mf-night-timer">{timeLeft}s</div>
          </div>
          <div className="mf-timer-track"><div className="mf-timer-fill night" style={{ width: `${(timeLeft / NIGHT_TIME) * 100}%` }} /></div>

          <div className="mf-mafia-crew">
            {players.filter((p: any) => roles[p.id] === 'MAFIA').map((p: any) => (
              <div key={p.id} className="mf-crew-chip">
                <span>{p.name.charAt(0)}</span>
                <span>{p.name}</span>
                {mafiaVotes[p.id] && <span className="mf-voted-tick">✓</span>}
              </div>
            ))}
          </div>

          <h3 className="mf-action-title">Pick your target ({Math.ceil(mafiaAlive.length / 2)} votes needed)</h3>
          <div className="mf-target-grid">
            {alive.map((p: any) => {
              const vc = voteCounts[p.id] ?? 0;
              return (
                <button key={p.id}
                  className={`mf-target-btn ${myMafiaVote === p.id ? 'selected' : ''} ${health[p.id] === 'wounded' ? 'wounded' : ''}`}
                  onClick={() => castMafiaVote(p.id)}
                  disabled={!!myMafiaVote}>
                  <span className="mf-target-av">{p.name.charAt(0)}</span>
                  <span className="mf-target-name">{p.name}</span>
                  {health[p.id] === 'wounded' && <span className="mf-target-wound">⚠️</span>}
                  {vc > 0 && <span className="mf-vote-dot">{vc}</span>}
                </button>
              );
            })}
          </div>
          {myMafiaVote && <p className="mf-wait-pulse">Vote cast. Waiting for crew…</p>}
        </div>
      </div>
    );

    // Villager sensory deprivation
    return (
      <div className="mf-root mf-villager-night">
        <div className="mf-villager-night-content">
          <div className="mf-pulse-ring" /><div className="mf-pulse-ring delay1" /><div className="mf-pulse-ring delay2" />
          <h1 className="mf-senses-title">CLOSE YOUR EYES</h1>
          <p className="mf-senses-sub">The night is dark in Nairobi…</p>
          <div className="mf-night-timer-bar"><div className="mf-night-timer-fill" style={{ width: `${(timeLeft / NIGHT_TIME) * 100}%` }} /></div>
        </div>
      </div>
    );
  }

  // ── MORNING REVEAL ───────────────────────────────────────────
  if (phase === 'MORNING_REVEAL') {
    const elim   = players.find((p: any) => p.id === eliminated);
    const wound  = players.find((p: any) => p.id === wounded);
    const quiet  = !eliminated && !wounded;

    return (
      <div className="mf-root mf-morning-bg">
        <div className="mf-sun-container"><div className="mf-sun-rays" /><div className="mf-sun" /></div>
        <div className="mf-morning-inner">
          <h1 className="mf-morning-title">MORNING</h1>
          {quiet && (
            <div className="mf-reveal-card quiet">
              <span className="mf-reveal-icon">🌅</span>
              <h2>Quiet night</h2>
              <p>Nobody was touched. Mafia stayed low.</p>
            </div>
          )}
          {wound && !elim && (
            <div className="mf-reveal-card wounded">
              <span className="mf-reveal-icon">🩸</span>
              <h2>ATTACKED — but survived</h2>
              <div className="mf-reveal-pname">{wound.name}</div>
              <p>{wound.name} was hit but lived. One more attack and they're gone.</p>
            </div>
          )}
          {elim && (
            <div className="mf-reveal-card dead">
              <span className="mf-reveal-icon">💀</span>
              <h2>KILLED OVERNIGHT</h2>
              <div className="mf-reveal-pname dead">{elim.name}</div>
              <p>{elim.name} didn't make it. Nobody knows who did it.</p>
            </div>
          )}
          <p className="mf-auto-advance blink">Discussion starting…</p>
        </div>
      </div>
    );
  }

  // ── DAY DISCUSS ─────────────────────────────────────────────
  if (phase === 'DAY_DISCUSS') {
    const urgent = timeLeft <= 20;
    return (
      <div className="mf-root mf-day-bg">
        <div className="mf-sun-container"><div className="mf-sun-rays" /><div className="mf-sun" /></div>
        <div className="mf-day-inner">
          <div className="mf-day-hud">
            <h1 className="mf-day-title">DAY {roundNum}</h1>
            <div className={`mf-day-timer ${urgent ? 'urgent' : ''}`}>{timeLeft}s</div>
          </div>
          <div className="mf-timer-track"><div className={`mf-timer-fill ${urgent ? 'urgent' : ''}`} style={{ width: `${timerPct}%` }} /></div>

          <p className="mf-day-instruction">Point fingers. Build alliances. Find the Mafia.</p>

          <div className="mf-alive-grid">
            {alive.map((p: any, i: number) => (
              <div key={p.id} className={`mf-alive-card ${health[p.id] === 'wounded' ? 'wounded' : ''}`}
                style={{ animationDelay: `${i * 0.06}s` }}>
                <span className="mf-alive-av">{p.name.charAt(0)}</span>
                <span className="mf-alive-name">{p.name}</span>
                {health[p.id] === 'wounded' && <span className="mf-wound-pulse">⚠️ WOUNDED</span>}
              </div>
            ))}
          </div>

          {/* Online chat */}
          {!isPassPlay && !isDead && (
            <div className="mf-chat-panel">
              <div className="mf-chat-feed">
                {chat.slice(-10).map((m: any, i: number) => {
                  const sender = players.find((p: any) => p.id === m.playerId);
                  return (
                    <div key={i} className="mf-chat-msg">
                      <span className="mf-chat-name">{sender?.name}</span>
                      <span className="mf-chat-text">{m.text}</span>
                    </div>
                  );
                })}
              </div>
              <form className="mf-chat-form" onSubmit={sendChat}>
                <input className="mf-chat-input" placeholder="Say something…"
                  value={chatInput} onChange={e => setChatInput(e.target.value)} autoComplete="off"/>
                <button className="mf-chat-send" type="submit">→</button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── VOTE ────────────────────────────────────────────────────
  if (phase === 'VOTE') {
    const myVote = dayVotes[currentPlayerId ?? ''];
    const urgent = timeLeft <= 5;

    // ─────────────────────────────────────────────────────────
    // LOCAL MODE: Host-controlled vote
    // One phone — nobody can vote digitally. Host calls the
    // room vote out loud, counts hands, then taps who gets out.
    // ─────────────────────────────────────────────────────────
    if (isPassPlay) {
      return (
        <div className="mf-root mf-vote-bg">
          <div className="mf-vote-inner">
            <h1 className="mf-vote-title">🗳️ VOTE</h1>
            <p className="mf-vote-instruction">
              Call it out loud. Count hands. Then tap who the village wants to eliminate.
            </p>
            <p className="mf-vote-sub">Tap "Nobody" if there's a tie or no majority.</p>

            <div className="mf-target-grid">
              {alive.map((p: any) => (
                <button key={p.id}
                  className={`mf-target-btn ${health[p.id] === 'wounded' ? 'wounded' : ''}`}
                  onClick={() => hostSelectElimination(p.id)}>
                  <span className="mf-target-av">{p.name.charAt(0)}</span>
                  <span className="mf-target-name">{p.name}</span>
                  {health[p.id] === 'wounded' && <span className="mf-target-wound">⚠️</span>}
                </button>
              ))}
            </div>

            <button className="mf-ghost-btn mf-skip" onClick={() => hostSelectElimination(null)}>
              🤝 It's a tie — nobody leaves
            </button>
          </div>
        </div>
      );
    }

    // ─────────────────────────────────────────────────────────
    // ONLINE MODE: Digital vote with timer
    // ─────────────────────────────────────────────────────────
    const votablePlayers = alive.filter((p: any) => p.id !== currentPlayerId);
    const voteCountsDay: Record<string, number> = {};
    Object.values(dayVotes).forEach((v: any) => {
      if (v && v !== 'skip') voteCountsDay[v] = (voteCountsDay[v] ?? 0) + 1;
    });
    const totalVoted = Object.keys(dayVotes).length;

    return (
      <div className="mf-root mf-vote-bg">
        <div className="mf-vote-inner">
          <div className="mf-vote-hud">
            <h1 className="mf-vote-title">🗳️ VOTE</h1>
            <div className={`mf-vote-timer ${urgent ? 'urgent' : ''}`}>{timeLeft}s</div>
          </div>
          <div className="mf-timer-track">
            <div className={`mf-timer-fill vote ${urgent ? 'urgent' : ''}`}
              style={{ width: `${(timeLeft / VOTE_TIME) * 100}%` }} />
          </div>

          <p className="mf-vote-instruction">
            {myVote
              ? `You voted for ${players.find((p: any) => p.id === myVote)?.name ?? 'Skip'} · ${totalVoted}/${alive.length} voted`
              : `Who's the Mafia? ${totalVoted}/${alive.length} voted`}
          </p>

          {!myVote && !isDead && (
            <div className="mf-target-grid">
              {votablePlayers.map((p: any) => {
                const vc = voteCountsDay[p.id] ?? 0;
                return (
                  <button key={p.id}
                    className={`mf-target-btn ${health[p.id] === 'wounded' ? 'wounded' : ''}`}
                    onClick={() => castDayVote(p.id)}>
                    <span className="mf-target-av">{p.name.charAt(0)}</span>
                    <span className="mf-target-name">{p.name}</span>
                    {health[p.id] === 'wounded' && <span className="mf-target-wound">⚠️</span>}
                    {vc > 0 && <span className="mf-vote-dot">{vc}</span>}
                  </button>
                );
              })}
              <button className="mf-target-btn skip" onClick={() => castDayVote('skip')}>
                <span className="mf-target-av">—</span>
                <span className="mf-target-name">Skip</span>
              </button>
            </div>
          )}

          {isHost && (
            <button className="mf-main-btn mf-btn-red mf-resolve-btn"
              onClick={() => resolveVotesFromState(dayVotes, health)}>
              ⚖️ End Vote Now
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── VOTE REVOTE (tie resolution) ────────────────────────────
  if (phase === 'VOTE_REVOTE') {
    const myVote = dayVotes[currentPlayerId ?? ''];
    const urgent = timeLeft <= 5;
    const votablePlayers = alive.filter((p: any) => p.id !== currentPlayerId);
    const voteCountsDay: Record<string, number> = {};
    Object.values(dayVotes).forEach((v: any) => {
      if (v && v !== 'skip') voteCountsDay[v] = (voteCountsDay[v] ?? 0) + 1;
    });
    const totalVoted = Object.keys(dayVotes).length;

    return (
      <div className="mf-root mf-vote-bg">
        <div className="mf-vote-inner">
          <div className="mf-vote-hud">
            <h1 className="mf-vote-title">🗳️ RE-VOTE</h1>
            <div className={`mf-vote-timer ${urgent ? 'urgent' : ''}`}>{timeLeft}s</div>
          </div>
          <div className="mf-timer-track">
            <div className={`mf-timer-fill vote ${urgent ? 'urgent' : ''}`}
              style={{ width: `${(timeLeft / VOTE_TIME) * 100}%` }} />
          </div>

          <p className="mf-vote-instruction">
            {myVote
              ? `You voted for ${players.find((p: any) => p.id === myVote)?.name ?? '?'} · ${totalVoted}/${alive.length} voted`
              : `It was a tie! Everyone must pick someone. ${totalVoted}/${alive.length} voted`}
          </p>

          {!myVote && !isDead && (
            <div className="mf-target-grid">
              {votablePlayers.map((p: any) => {
                const vc = voteCountsDay[p.id] ?? 0;
                return (
                  <button key={p.id}
                    className={`mf-target-btn ${health[p.id] === 'wounded' ? 'wounded' : ''}`}
                    onClick={() => castDayVote(p.id)}>
                    <span className="mf-target-av">{p.name.charAt(0)}</span>
                    <span className="mf-target-name">{p.name}</span>
                    {health[p.id] === 'wounded' && <span className="mf-target-wound">⚠️</span>}
                    {vc > 0 && <span className="mf-vote-dot">{vc}</span>}
                  </button>
                );
              })}
            </div>
          )}

          {isHost && (
            <button className="mf-main-btn mf-btn-red mf-resolve-btn"
              onClick={() => resolveVotesFromState(dayVotes, health, true)}>
              ⚖️ End Re-Vote Now
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── VOTE REVEAL ─────────────────────────────────────────────
  if (phase === 'VOTE_REVEAL') {
    const elim = players.find((p: any) => p.id === eliminated);
    return (
      <div className="mf-root mf-vote-reveal-bg">
        <div className="mf-ballot-inner">
          <h1 className="mf-ballot-title">THE BALLOT</h1>
          {elim
            ? <p className="mf-ballot-verdict">{elim.name} is being eliminated…</p>
            : <p className="mf-ballot-verdict">It's a tie. Nobody leaves.</p>}

          <div className="mf-ballot-list">
            {alive.map((p: any, i: number) => {
              const vote = dayVotes[p.id];
              const votedFor = players.find((pl: any) => pl.id === vote);
              return (
                <div key={p.id} className="mf-ballot-row" style={{ animationDelay: `${i * 0.1}s` }}>
                  <span className="mf-ballot-voter">{p.name}</span>
                  <span className="mf-ballot-arrow">→</span>
                  <span className={`mf-ballot-choice ${!vote || vote === 'skip' ? 'skip' : ''}`}>
                    {vote === 'skip' || !vote ? 'Skipped' : votedFor?.name ?? '?'}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mf-auto-advance blink">Execution incoming…</p>
        </div>
      </div>
    );
  }

  // ── EXECUTION ───────────────────────────────────────────────
  if (phase === 'EXECUTION') {
    const exec    = players.find((p: any) => p.id === eliminated);
    const wasMaf  = exec ? roles[exec.id] === 'MAFIA' : false;

    return (
      <div className={`mf-root ${exec ? (wasMaf ? 'mf-exec-mafia' : 'mf-exec-village') : 'mf-exec-tie'}`}>
        <div className="mf-exec-inner">
          {exec ? (
            <>
              <div className="mf-exec-shatter">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="mf-shard"
                    style={{ '--angle': `${i * 45}deg`, animationDelay: `${i * 0.05}s` } as React.CSSProperties} />
                ))}
              </div>
              <div className="mf-exec-content">
                <span className="mf-exec-icon">{wasMaf ? '🎭' : '⚰️'}</span>
                <h1 className={`mf-exec-name ${wasMaf ? 'mafia' : 'village'}`}>{exec.name}</h1>
                <div className={`mf-exec-role-badge ${wasMaf ? 'mafia' : 'village'}`}>
                  {wasMaf ? 'WAS MAFIA ✓' : 'WAS INNOCENT ✗'}
                </div>
                <p className="mf-exec-flavor">
                  {wasMaf ? 'Justice served. One killer down.' : 'The village got it wrong…'}
                </p>
              </div>
            </>
          ) : (
            <div className="mf-exec-content">
              <span className="mf-exec-icon">🤝</span>
              <h1 className="mf-exec-tie-title">TIE — Nobody leaves</h1>
              <p className="mf-exec-flavor">No majority. Night falls again.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── GAME OVER ────────────────────────────────────────────────
  if (phase === 'GAME_OVER') {
    const villageWin = winner === 'VILLAGERS';
    return (
      <div className={`mf-root ${villageWin ? 'mf-gameover-village' : 'mf-gameover-mafia'}`}>
        <Confetti active={showConfetti} />
        <div className="mf-gameover-inner">
          <div className="mf-gameover-banner">
            <span className="mf-gameover-trophy">{villageWin ? '☀️' : '🔪'}</span>
            <h1 className="mf-gameover-title">{villageWin ? 'VILLAGE WINS!' : 'MAFIA WINS!'}</h1>
            <p className="mf-gameover-sub">
              {villageWin ? 'All Mafia eliminated. Peace restored.' : 'Mafia took over. You never had a chance.'}
            </p>
          </div>

          <div className="mf-final-roles">
            <h2 className="mf-section-label">THE TRUTH</h2>
            {players.map((p: any) => (
              <div key={p.id} className={`mf-final-row ${health[p.id] === 'dead' ? 'dead' : ''}`}>
                <span className="mf-final-icon">{roles[p.id] === 'MAFIA' ? '🔪' : '🌾'}</span>
                <span className="mf-final-name">{p.name}</span>
                <span className={`mf-final-role ${roles[p.id] === 'MAFIA' ? 'mafia' : 'village'}`}>
                  {roles[p.id]}
                </span>
                {health[p.id] === 'dead' && <span className="mf-final-dead">💀</span>}
              </div>
            ))}
          </div>

          {(isHost || isPassPlay) && (
            <button className="mf-main-btn mf-btn-red" onClick={resetGame}>
              PLAY AGAIN 🔄
            </button>
          )}
          <a href="/" className="mf-exit">← Back to Hub</a>
        </div>
      </div>
    );
  }

  return null;
};

export default MafiaGame;