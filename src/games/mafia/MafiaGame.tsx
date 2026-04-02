import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMultiplayer } from '../../context/MultiplayerContext';
import './Mafia.css';

// ═══════════════════════════════════════════════════════════════
//  MAFIA — ROOM 37
//
//  COMPLETE GAME FLOW (both modes)
//  ─────────────────────────────────────────────────────────────
//  LOBBY
//   └─ ROLE_REVEAL       (device passed, each player sees role privately)
//       └─ NIGHT_PASS / NIGHT_ONLINE
//           └─ MORNING_REVEAL        (5s auto-advance)
//               └─ DAY_DISCUSS       (120s + skip button)
//                   └─ VOTE          (pass-device sequential | online digital)
//                       └─ VOTE_REVOTE  (tie only, one re-vote max)
//                           └─ VOTE_REVEAL  (ballot shown, 4s)
//                               └─ EXECUTION   (dramatic reveal, 4s)
//                                   ├─ ELIMINATED_CHOICE (local gate: stay/spectate)
//                                   └─ NIGHT_PASS / NIGHT_ONLINE  (loop)
//   └─ GAME_OVER
//
//  KEY RULES
//  • Wounded players (hit once) die on second hit
//  • Two mafia see each other + previous mafia target during night
//  • Vote is pass-device sequential in local (NOT concurrent)
//  • Tie → one re-vote. Second tie → nobody eliminated
//  • Eliminated player chooses: stay (can chat in day) or spectate (silent)
//  • Mafia have a private chat (online) visible only to mafia
// ═══════════════════════════════════════════════════════════════

type Phase =
  | 'LOBBY'
  | 'ROLE_REVEAL'
  | 'NIGHT_PASS'
  | 'NIGHT_ONLINE'
  | 'MORNING_REVEAL'
  | 'DAY_DISCUSS'
  | 'VOTE'
  | 'VOTE_REVOTE'
  | 'VOTE_REVEAL'
  | 'EXECUTION'
  | 'ELIMINATED_CHOICE'   // local-mode gate after execution
  | 'GAME_OVER';

type Role   = 'VILLAGER' | 'MAFIA';
type Health = 'healthy' | 'wounded' | 'dead';

interface NightAction {
  actorId:  string;
  targetId: string | null;
  isMafia:  boolean;
}

interface ChatMsg {
  playerId: string;
  text:     string;
  ts:       number;
}

// Everything stored in Firebase
interface SS {
  phase:     Phase;
  roles:     Record<string, Role>;
  health:    Record<string, Health>;

  // Role reveal
  revealIdx: number;

  // Night
  passOrder:    string[];
  passIndex:    number;
  nightActions: NightAction[];
  mafiaVotes:   Record<string, string>;   // online night votes

  // Day voting — sequential in local
  dayVotes:      Record<string, string>;  // voterId → targetId (no skip option)
  votePassIdx:   number;                  // local: index into alive[] for whose turn
  reVoteCount:   number;

  endTime:    number;
  roundNumber: number;
  eliminatedThisRound: string | null;
  woundedThisRound:    string | null;
  winner: 'VILLAGERS' | 'MAFIA' | null;

  chat:       ChatMsg[];
  mafiaChat:  ChatMsg[];   // private mafia channel
  ghostChat:  ChatMsg[];   // eliminated players

  // Spectate tracking — eliminated players who chose to stay
  spectators: string[];
}

// Tunable timers
const DISCUSS_TIME = 120;
const VOTE_TIME    = 45;
const NIGHT_TIME   = 30;

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

// ── Audio engine ──────────────────────────────────────────────
let _ctx: AudioContext | null = null;
const getCtx = () => {
  if (!_ctx) _ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return _ctx;
};
const sfx = (type: 'night' | 'morning' | 'kill' | 'shatter' | 'vote' | 'tension') => {
  try {
    const ctx  = getCtx();
    const o    = ctx.createOscillator();
    const g    = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    switch (type) {
      case 'night':
        o.type = 'sine';
        o.frequency.setValueAtTime(180, ctx.currentTime);
        o.frequency.linearRampToValueAtTime(110, ctx.currentTime + 1.5);
        g.gain.setValueAtTime(0.18, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
        o.start(); o.stop(ctx.currentTime + 2.5); break;
      case 'morning':
        o.frequency.setValueAtTime(523, ctx.currentTime);
        o.frequency.setValueAtTime(659, ctx.currentTime + 0.15);
        o.frequency.setValueAtTime(784, ctx.currentTime + 0.3);
        g.gain.setValueAtTime(0.22, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        o.start(); o.stop(ctx.currentTime + 0.8); break;
      case 'kill':
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(330, ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 1.1);
        g.gain.setValueAtTime(0.55, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
        o.start(); o.stop(ctx.currentTime + 1.2); break;
      case 'shatter':
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(450, ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(65, ctx.currentTime + 0.55);
        g.gain.setValueAtTime(0.38, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);
        o.start(); o.stop(ctx.currentTime + 0.65); break;
      case 'vote':
        o.type = 'square';
        o.frequency.setValueAtTime(220, ctx.currentTime);
        g.gain.setValueAtTime(0.2, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        o.start(); o.stop(ctx.currentTime + 0.25); break;
      case 'tension':
        o.type = 'sine';
        o.frequency.setValueAtTime(80, ctx.currentTime);
        o.frequency.setValueAtTime(160, ctx.currentTime + 0.5);
        g.gain.setValueAtTime(0.25, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
        o.start(); o.stop(ctx.currentTime + 1); break;
    }
  } catch (_) {}
};

// ── Confetti ──────────────────────────────────────────────────
const Confetti: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;
  return (
    <div className="mf-confetti" aria-hidden>
      {Array.from({ length: 28 }, (_, i) => (
        <div key={i} className={`mf-cp mf-cp-${i % 6}`}
          style={{ '--i': i, '--r': Math.random().toFixed(2) } as React.CSSProperties} />
      ))}
    </div>
  );
};

// ── Stars background ──────────────────────────────────────────
const Stars: React.FC<{ count?: number }> = ({ count = 40 }) => (
  <div className="mf-stars" aria-hidden>
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="mf-star"
        style={{
          left: `${Math.random() * 100}%`,
          top:  `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 4}s`,
        }} />
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const MafiaGame: React.FC = () => {
  const { players, sharedState, setSharedState, isHost, currentPlayerId, mode } =
    useMultiplayer() as any;

  const isPassPlay = mode === 'local';

  // ── Local-only UI state ───────────────────────────────────────
  // These never go to Firebase
  const [nightStep,    setNightStep]    = useState<'waiting'|'identity'|'action'|'locking'>('waiting');
  const [revealStep,   setRevealStep]   = useState<'waiting'|'revealed'|'done'>('waiting');
  const [chatInput,    setChatInput]    = useState('');
  const [mafiaChatIn,  setMafiaChatIn]  = useState('');
  const [ghostInput,   setGhostInput]   = useState('');
  const [timeLeft,     setTimeLeft]     = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  // Local spectate choice — removed (dead men tell no tales)
  // kept as stub so goToNight still compiles
  const localSpectate = null;

  const timerRef  = useRef<ReturnType<typeof setInterval>>();
  const stateRef  = useRef<Partial<SS>>({});

  // ── Shared state — safe defaults ───────────────────────────
  const s           = (sharedState ?? {}) as Partial<SS>;
  stateRef.current  = s;

  const phase        = s.phase            ?? 'LOBBY';
  const roles        = s.roles            ?? {};
  const health       = s.health           ?? {};
  const revealIdx    = s.revealIdx        ?? 0;
  const passOrder    = s.passOrder        ?? [];
  const passIndex    = s.passIndex        ?? 0;
  const nightActs    = s.nightActions     ?? [];
  const mafiaVotes   = s.mafiaVotes       ?? {};
  const dayVotes     = s.dayVotes         ?? {};
  const votePassIdx  = s.votePassIdx      ?? 0;
  const reVoteCount  = s.reVoteCount      ?? 0;
  const endTime      = s.endTime          ?? 0;
  const roundNum     = s.roundNumber      ?? 1;
  const eliminated   = s.eliminatedThisRound ?? null;
  const wounded      = s.woundedThisRound    ?? null;
  const winner       = s.winner           ?? null;
  const chat         = s.chat             ?? [];
  const mafiaChat    = s.mafiaChat        ?? [];
  const ghostChat    = s.ghostChat        ?? [];
  const spectators   = s.spectators       ?? [];

  // Derived
  const myRole    = roles[currentPlayerId ?? ''] ?? null;
  const myHealth  = health[currentPlayerId ?? ''] ?? 'healthy';
  const isDead    = myHealth === 'dead';
  const isMafia   = myRole === 'MAFIA';

  // Always compute from health — alive = not dead
  const alive     = players.filter((p: any) => health[p.id] !== 'dead');
  const mafiaAlive = players.filter((p: any) => roles[p.id] === 'MAFIA' && health[p.id] !== 'dead');

  // ── Reset reveal step when player advances ─────────────────
  useEffect(() => { setRevealStep('waiting'); }, [revealIdx]);

  // ── Win condition ──────────────────────────────────────────
  // Villagers win: all Mafia eliminated
  // Mafia wins: Mafia count STRICTLY GREATER than villagers
  //   (equal = Mafia can be voted out next round, so game continues)
  const checkWin = (h: Record<string, Health>): 'VILLAGERS' | 'MAFIA' | null => {
    const aM = players.filter((p: any) => roles[p.id] === 'MAFIA'    && h[p.id] !== 'dead').length;
    const aV = players.filter((p: any) => roles[p.id] === 'VILLAGER' && h[p.id] !== 'dead').length;
    if (aM === 0)  return 'VILLAGERS';
    if (aM > aV)   return 'MAFIA';      // strict majority — e.g. 2v1, 3v2
    return null;
  };

  // ── Timer ──────────────────────────────────────────────────
  useEffect(() => {
    const active = ['DAY_DISCUSS','VOTE','VOTE_REVOTE','NIGHT_ONLINE'].includes(phase);
    if (!active) { clearInterval(timerRef.current); return; }

    const authority = isHost || isPassPlay;

    const tick = () => {
      const rem = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setTimeLeft(rem);

      if (!authority) return;

      const cur = stateRef.current;

      // Auto-resolve vote when everyone has voted
      if ((phase === 'VOTE' || phase === 'VOTE_REVOTE') && cur.dayVotes) {
        const voted   = Object.keys(cur.dayVotes ?? {}).length;
        const aliveN  = players.filter((p: any) => (cur.health ?? {})[p.id] !== 'dead').length;
        if (voted >= aliveN) {
          clearInterval(timerRef.current);
          resolveVotes(cur.dayVotes ?? {}, cur.health ?? {}, phase === 'VOTE_REVOTE', cur.reVoteCount ?? 0);
          return;
        }
      }

      if (rem > 0) return;
      clearInterval(timerRef.current);

      if (phase === 'DAY_DISCUSS') {
        setSharedState({ phase: 'VOTE', dayVotes: {}, votePassIdx: 0, endTime: Date.now() + VOTE_TIME * 1000 });
      } else if (phase === 'VOTE' || phase === 'VOTE_REVOTE') {
        resolveVotes(cur.dayVotes ?? {}, cur.health ?? {}, phase === 'VOTE_REVOTE', cur.reVoteCount ?? 0);
      } else if (phase === 'NIGHT_ONLINE') {
        resolveNightOnline(cur.mafiaVotes ?? {}, cur.health ?? {});
      }
    };

    tick();
    timerRef.current = setInterval(tick, 300);
    return () => clearInterval(timerRef.current);
  }, [phase, endTime]);

  // ── START GAME ─────────────────────────────────────────────
  const startGame = async () => {
    if (!isHost && !isPassPlay) return;
    const nMafia   = getMafiaCount(players.length);
    const shuffled = shuffle(players);
    const newRoles: Record<string, Role>   = {};
    const newHealth: Record<string, Health> = {};
    shuffled.slice(0, nMafia).forEach((p: any)  => { newRoles[p.id]  = 'MAFIA';    });
    shuffled.slice(nMafia).forEach((p: any)       => { newRoles[p.id]  = 'VILLAGER'; });
    players.forEach((p: any) => { newHealth[p.id] = 'healthy'; });

    await setSharedState({
      phase: 'ROLE_REVEAL',
      roles: newRoles, health: newHealth,
      revealIdx: 0,
      passOrder: shuffle(players.map((p: any) => p.id)),
      passIndex: 0, nightActions: [],
      mafiaVotes: {}, dayVotes: {}, votePassIdx: 0, reVoteCount: 0,
      endTime: 0, roundNumber: 1,
      eliminatedThisRound: null, woundedThisRound: null,
      winner: null, chat: [], mafiaChat: [], ghostChat: [], spectators: [],
    });
    sfx('night'); vibe([200, 100, 200]);
  };

  // ── ROLE REVEAL: advance to next player ────────────────────
  const advanceReveal = async () => {
    const next = revealIdx + 1;
    if (next >= players.length) {
      await setSharedState({
        phase: isPassPlay ? 'NIGHT_PASS' : 'NIGHT_ONLINE',
        endTime: !isPassPlay ? Date.now() + NIGHT_TIME * 1000 : 0,
      });
      setNightStep('waiting');
    } else {
      await setSharedState({ revealIdx: next });
    }
  };

  // ── NIGHT LOCAL: handle one player's action ─────────────────
  const handleNightAction = async (targetId: string | null) => {
    setNightStep('locking');
    vibe(100);

    const actorId   = passOrder[passIndex];
    const actorRole = roles[actorId] ?? 'VILLAGER';
    const action: NightAction = { actorId, targetId, isMafia: actorRole === 'MAFIA' };

    // Keep last action per mafia player (dedup)
    const updated = actorRole === 'MAFIA'
      ? [...nightActs.filter((a: NightAction) => a.actorId !== actorId), action]
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
        woundedThisRound:    result.wound,
        winner: checkWin(result.newHealth),
      });
      setNightStep('waiting');
      sfx(result.elim ? 'kill' : 'shatter');
    } else {
      await setSharedState({ nightActions: updated, passIndex: nextIdx });
      setNightStep('waiting');
    }
  };

  const resolveNightLocal = (actions: NightAction[]) => {
    // Last mafia action is the final decision
    const mActions  = actions.filter(a => a.isMafia);
    const finalAct  = mActions[mActions.length - 1];
    const targetId  = finalAct?.targetId ?? null;
    const newHealth = { ...health };
    let elim: string | null  = null;
    let wound: string | null = null;

    if (targetId) {
      const cur = newHealth[targetId] ?? 'healthy';
      if (cur === 'wounded')  { newHealth[targetId] = 'dead';    elim  = targetId; }
      else if (cur === 'healthy') { newHealth[targetId] = 'wounded'; wound = targetId; }
    }
    return { newHealth, elim, wound };
  };

  // ── NIGHT ONLINE: mafia casts vote ─────────────────────────
  const castMafiaVote = async (targetId: string) => {
    if (!currentPlayerId || !isMafia || isDead) return;
    await setSharedState({ mafiaVotes: { ...mafiaVotes, [currentPlayerId]: targetId } });
  };

  const resolveNightOnline = useCallback(async (
    mVotes: Record<string, string>,
    curHealth: Record<string, Health>
  ) => {
    const curMafiaAlive = players.filter(
      (p: any) => roles[p.id] === 'MAFIA' && curHealth[p.id] !== 'dead'
    );
    const counts: Record<string, number> = {};
    curMafiaAlive.forEach((m: any) => {
      const v = mVotes[m.id];
      if (v) counts[v] = (counts[v] ?? 0) + 1;
    });

    // Strict majority
    const threshold = Math.floor(curMafiaAlive.length / 2) + 1;
    const agreed    = Object.entries(counts).find(([, c]) => c >= threshold);
    const targetId  = agreed ? agreed[0] : null;
    const newHealth = { ...curHealth };
    let elim: string | null  = null;
    let wound: string | null = null;

    if (targetId) {
      const cur = newHealth[targetId] ?? 'healthy';
      if (cur === 'wounded')      { newHealth[targetId] = 'dead';    elim  = targetId; }
      else if (cur === 'healthy') { newHealth[targetId] = 'wounded'; wound = targetId; }
    }

    await setSharedState({
      phase: 'MORNING_REVEAL', health: newHealth, mafiaVotes: {},
      eliminatedThisRound: elim, woundedThisRound: wound,
      winner: checkWin(newHealth),
    });
    sfx(elim ? 'kill' : 'shatter');
  }, [players, roles]);

  // ── MORNING → DAY auto-advance ─────────────────────────────
  useEffect(() => {
    if (phase !== 'MORNING_REVEAL') return;
    if (!isHost && !isPassPlay) return;
    const t = setTimeout(async () => {
      if (winner) {
        await setSharedState({ phase: 'GAME_OVER' });
        setShowConfetti(winner === 'VILLAGERS');
      } else {
        await setSharedState({
          phase: 'DAY_DISCUSS',
          endTime: Date.now() + DISCUSS_TIME * 1000,
          dayVotes: {}, votePassIdx: 0, reVoteCount: 0,
        });
        sfx('morning');
      }
    }, 5500);
    return () => clearTimeout(t);
  }, [phase, winner]);

  // ── DAY VOTE: cast a vote (pass-device sequential) ──────────
  // In local mode: votePassIdx tracks which alive player's turn it is.
  //   The screen shows "Pass to [name]" before each vote.
  //   After voting, votePassIdx advances.
  // In online mode: everyone votes simultaneously on their own device.
  const castDayVote = async (targetId: string) => {
    if (!currentPlayerId || isDead) return;
    sfx('vote'); vibe(60);
    const newVotes = { ...dayVotes, [currentPlayerId]: targetId };
    const nextIdx  = votePassIdx + 1;
    await setSharedState({ dayVotes: newVotes, votePassIdx: nextIdx });
  };

  // ── RESOLVE VOTES ───────────────────────────────────────────
  // Called by timer or when everyone has voted.
  // isRevote = true means this is the tiebreaker round.
  const resolveVotes = useCallback(async (
    dv:          Record<string, string>,
    h:           Record<string, Health>,
    isRevote:    boolean,
    currentRVC:  number
  ) => {
    const counts: Record<string, number> = {};
    Object.values(dv).forEach(v => {
      if (v) counts[v] = (counts[v] ?? 0) + 1;
    });

    let maxV = 0;
    let topId: string | null = null;
    Object.entries(counts).forEach(([id, c]) => { if (c > maxV) { maxV = c; topId = id; } });

    const tied = topId
      ? Object.entries(counts).filter(([, c]) => c === maxV).length > 1
      : !topId; // no votes cast = tie

    if (tied && !isRevote && currentRVC < 1) {
      // First tie → trigger one re-vote
      sfx('tension'); vibe([80, 80, 80]);
      const aliveNow = players.filter((p: any) => h[p.id] !== 'dead');
      await setSharedState({
        phase: 'VOTE_REVOTE',
        dayVotes: {},
        votePassIdx: 0,
        endTime: Date.now() + VOTE_TIME * 1000,
        reVoteCount: currentRVC + 1,
      });
    } else {
      // Either: clear winner, or second tie → nobody goes
      if (tied) topId = null; // second tie = no elimination

      const newHealth = { ...h };
      if (topId) { newHealth[topId] = 'dead'; sfx('kill'); vibe([300, 100, 300]); }
      const w = checkWin(newHealth);

      await setSharedState({
        phase:  'VOTE_REVEAL',
        health: newHealth,
        eliminatedThisRound: topId,
        woundedThisRound:    null,
        winner: w,
      });
    }
  }, [players]);

  // ── VOTE_REVEAL → EXECUTION ─────────────────────────────────
  useEffect(() => {
    if (phase !== 'VOTE_REVEAL') return;
    if (!isHost && !isPassPlay) return;
    const t = setTimeout(async () => {
      sfx('shatter'); vibe([500, 100, 500]);
      await setSharedState({ phase: 'EXECUTION' });
    }, 4000);
    return () => clearTimeout(t);
  }, [phase]);

  // ── EXECUTION → next phase ──────────────────────────────────
  // Nobody eliminated (tie): auto-advance 4s
  // Someone eliminated: show drama screen 5s, then continue
  useEffect(() => {
    if (phase !== 'EXECUTION') return;
    if (!isHost && !isPassPlay) return;

    const delay = eliminated ? 5500 : 4000;
    const t = setTimeout(async () => {
      // Read freshest winner from stateRef to avoid stale closure
      const freshWinner = stateRef.current.winner ?? null;
      if (freshWinner) {
        setShowConfetti(freshWinner === 'VILLAGERS');
        await setSharedState({ phase: 'GAME_OVER' });
      } else {
        await goToNight();
      }
    }, delay);
    return () => clearTimeout(t);
  }, [phase, eliminated]);

  const goToNight = async () => {
    const aliveNow = players.filter((p: any) => (stateRef.current.health ?? {})[p.id] !== 'dead');
    const newOrder = shuffle(aliveNow.map((p: any) => p.id));
    await setSharedState({
      phase: isPassPlay ? 'NIGHT_PASS' : 'NIGHT_ONLINE',
      passOrder: newOrder, passIndex: 0,
      nightActions: [], mafiaVotes: {},
      dayVotes: {}, votePassIdx: 0, reVoteCount: 0,
      endTime: !isPassPlay ? Date.now() + NIGHT_TIME * 1000 : 0,
      roundNumber: roundNum + 1,
      eliminatedThisRound: null, woundedThisRound: null,
      chat: [],
    });
    setNightStep('waiting');
    sfx('night');
  };

  // confirmSpectateChoice removed — dead men tell no tales.

  // ── Chat helpers ─────────────────────────────────────────────
  const sendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentPlayerId) return;
    await setSharedState({ chat: [...chat, { playerId: currentPlayerId, text: chatInput.trim(), ts: Date.now() }] });
    setChatInput('');
  };
  const sendMafiaChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mafiaChatIn.trim() || !currentPlayerId) return;
    await setSharedState({ mafiaChat: [...mafiaChat, { playerId: currentPlayerId, text: mafiaChatIn.trim(), ts: Date.now() }] });
    setMafiaChatIn('');
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
      dayVotes: {}, votePassIdx: 0, endTime: 0, roundNumber: 1, reVoteCount: 0,
      eliminatedThisRound: null, woundedThisRound: null,
      winner: null, chat: [], mafiaChat: [], ghostChat: [], spectators: [],
    });
    setNightStep('waiting');
    setRevealStep('waiting');
    setShowConfetti(false);
  };

  // ── Timer percentage ─────────────────────────────────────────
  const maxT = phase === 'VOTE' || phase === 'VOTE_REVOTE' ? VOTE_TIME
    : phase === 'NIGHT_ONLINE' ? NIGHT_TIME : DISCUSS_TIME;
  const timerPct = endTime > 0 ? Math.max(0, (timeLeft / maxT) * 100) : 0;

  // ── Guards ────────────────────────────────────────────────────
  if (!players.length) return (
    <div className="mf-root">
      <div className="mf-center">
        <span className="mf-big-icon">🎭</span>
        <p className="mf-dim">Enter via the Lobby first.</p>
        <a href="/" className="mf-pill-btn">← Back to Hub</a>
      </div>
    </div>
  );

  // Ghost/spectator view — online dead players who chose spectate
  const amSpectator = isDead && !isPassPlay && spectators.includes(currentPlayerId ?? '');
  const amStaying   = isDead && !isPassPlay && !spectators.includes(currentPlayerId ?? '');

  // Silent spectator gets a stripped-down view
  if (amSpectator && phase !== 'LOBBY' && phase !== 'GAME_OVER') {
    return (
      <div className="mf-root mf-ghost-bg">
        <div className="mf-ghost-view">
          <div className="mf-ghost-header">
            <span className="mf-ghost-skull">👻</span>
            <h1 className="mf-ghost-title">YOU'RE DEAD</h1>
            <p className="mf-ghost-sub">Watching silently. Enjoy the chaos.</p>
          </div>
          <div className="mf-alive-section">
            <p className="mf-section-label">Still alive — {alive.length} players</p>
            <div className="mf-alive-list">
              {alive.map((p: any) => (
                <div key={p.id} className={`mf-alive-chip ${health[p.id] === 'wounded' ? 'wounded' : ''}`}>
                  {p.name} {health[p.id] === 'wounded' && '⚠️'}
                </div>
              ))}
            </div>
          </div>
          <div className="mf-ghost-chat-box">
            <p className="mf-section-label">👻 Dead chat</p>
            <div className="mf-ghost-feed">
              {ghostChat.slice(-12).map((m: any, i: number) => {
                const sender = players.find((p: any) => p.id === m.playerId);
                return (
                  <div key={i} className="mf-ghost-msg">
                    <span className="mf-ghost-name">{sender?.name}</span>
                    <span>{m.text}</span>
                  </div>
                );
              })}
            </div>
            <form className="mf-chat-form" onSubmit={sendGhost}>
              <input className="mf-chat-input" type="text" placeholder="Whisper to the dead…"
                value={ghostInput} onChange={e => setGhostInput(e.target.value)} autoComplete="off" />
              <button className="mf-chat-send" type="submit">→</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  //  PHASE RENDERS
  // ═══════════════════════════════════════════════════════════

  // ── LOBBY ──────────────────────────────────────────────────
  if (phase === 'LOBBY') {
    const nMafia = getMafiaCount(players.length);
    return (
      <div className="mf-root mf-lobby-bg">
        <Stars count={50} />
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
            <div className="mf-role-pill mafia">
              <span className="mf-rp-num">{nMafia}</span>
              <span className="mf-rp-lbl">MAFIA</span>
            </div>
            <span className="mf-vs">vs</span>
            <div className="mf-role-pill village">
              <span className="mf-rp-num">{players.length - nMafia}</span>
              <span className="mf-rp-lbl">VILLAGE</span>
            </div>
          </div>

          <div className="mf-rules-compact">
            <div className="mf-rule-line"><span>🌙</span><span>Night — Mafia secretly picks a target to attack</span></div>
            <div className="mf-rule-line"><span>🌅</span><span>Morning — learn who was attacked overnight</span></div>
            <div className="mf-rule-line"><span>🗣️</span><span>Day — argue, accuse, find the killers</span></div>
            <div className="mf-rule-line"><span>🗳️</span><span>Vote — majority eliminates one person</span></div>
            <div className="mf-rule-line"><span>⚠️</span><span>Hit once = wounded. Hit again = dead.</span></div>
            <div className="mf-rule-line"><span>🔁</span><span>Tie → one re-vote. Second tie = nobody leaves.</span></div>
          </div>

          {(isHost || isPassPlay)
            ? <button className="mf-main-btn mf-btn-red" onClick={startGame}
                disabled={players.length < 4}>
                {players.length < 4 ? `Need ${4 - players.length} more players` : 'START GAME →'}
              </button>
            : <p className="mf-wait-pulse">Waiting for host to start…</p>}

          <a href="/" className="mf-exit">← Back to Hub</a>
        </div>
      </div>
    );
  }

  // ── ROLE REVEAL ─────────────────────────────────────────────
  if (phase === 'ROLE_REVEAL') {
    const player   = players[revealIdx];
    if (!player) return null;
    const thisRole = roles[player.id] ?? 'VILLAGER';
    const isMafP   = thisRole === 'MAFIA';
    const mPartners = players.filter((p: any) => roles[p.id] === 'MAFIA' && p.id !== player.id);
    const isLast   = revealIdx + 1 >= players.length;
    const nextName = !isLast ? players[revealIdx + 1]?.name : '';

    // Online: each player sees their own device
    if (!isPassPlay) {
      const isMe = player.id === currentPlayerId;
      if (!isMe) return (
        <div className="mf-root mf-night-bg">
          <Stars />
          <div className="mf-center">
            <div className="mf-phase-instruct">
              <span className="mf-phase-instruct-icon">🔐</span>
              <h2>ROLES BEING ASSIGNED</h2>
              <p>Each player is privately reading their role on their own device.</p>
            </div>
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
      <div className={`mf-root ${isMafP ? 'mf-identity-mafia' : 'mf-night-bg'}`}>
        {isMafP && <Stars count={20} />}
        <div className="mf-reveal-wrap">
          <div className="mf-phase-instruct">
            <span className="mf-phase-instruct-icon">🔐</span>
            <h2>ROLE REVEAL</h2>
            <p>
              {isPassPlay
                ? `${player.name} — look at the screen privately. Nobody else peeks.`
                : 'Your role for this game:'}
            </p>
          </div>

          <div className="mf-reveal-who">
            <span className="mf-reveal-av">{player.name.charAt(0)}</span>
            <span className="mf-reveal-name">{player.name}</span>
          </div>
          {isPassPlay && (
            <div className="mf-reveal-dots">
              {players.map((_: any, i: number) => (
                <div key={i} className={`mf-rdot ${i < revealIdx ? 'done' : i === revealIdx ? 'cur' : ''}`} />
              ))}
            </div>
          )}

          <p className="mf-reveal-hint">
            {revealStep === 'waiting'  && `${isPassPlay ? player.name + ' — tap' : 'Tap'} to reveal your role`}
            {revealStep === 'revealed' && 'Memorise it. Don\'t show anyone.'}
            {revealStep === 'done'     && (isLast ? 'Everyone has seen their role.' : `Pass the phone to ${nextName}.`)}
          </p>

          <div
            className={`mf-role-card ${isMafP ? 'mafia' : 'village'} ${revealStep === 'revealed' ? 'open' : 'closed'}`}
            onClick={() => revealStep === 'waiting' && setRevealStep('revealed')}
          >
            {revealStep === 'revealed' ? (
              <>
                <div className="mf-role-card-icon">{isMafP ? '🔪' : '🌾'}</div>
                <div className="mf-role-card-label">
                  {isMafP ? 'YOU ARE MAFIA' : 'YOU ARE VILLAGER'}
                </div>
                {isMafP && mPartners.length > 0 && (
                  <div className="mf-partners">
                    <span className="mf-partners-label">Your Mafia crew:</span>
                    <div className="mf-partners-row">
                      {mPartners.map((p: any) => (
                        <span key={p.id} className="mf-partner-chip">{p.name}</span>
                      ))}
                    </div>
                  </div>
                )}
                {isMafP && mPartners.length === 0 && (
                  <p className="mf-solo-mafia">You're flying solo. Be careful.</p>
                )}
              </>
            ) : (
              <div className="mf-role-card-tap">
                {revealStep === 'waiting' ? '👆 Tap to reveal' : '🔒 Hidden'}
              </div>
            )}
          </div>

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
    const actorId    = passOrder[passIndex];
    const actorName  = players.find((p: any) => p.id === actorId)?.name ?? '?';
    const actorRole  = roles[actorId] ?? 'VILLAGER';
    const isMafiaA   = actorRole === 'MAFIA';

    // Show what previous mafia voted for — key feature for multi-mafia
    const prevMafiaAction = isMafiaA
      ? nightActs.filter(a => a.isMafia && a.actorId !== actorId).pop()
      : null;
    const prevMafiaTarget = prevMafiaAction
      ? players.find((p: any) => p.id === prevMafiaAction.targetId)?.name
      : null;

    const mafiaPartners = isMafiaA
      ? players.filter((p: any) => roles[p.id] === 'MAFIA' && p.id !== actorId)
      : [];

    // GATE: Pass device screen
    if (nightStep === 'waiting') return (
      <div className="mf-root mf-night-bg">
        <Stars count={35} />
        <div className="mf-night-pass-wrap">
          <div className="mf-moon" />
          <div className="mf-night-label">NIGHT {roundNum}</div>
          <div className="mf-phase-instruct dark">
            <span className="mf-phase-instruct-icon">📱</span>
            <h2>PASS THE DEVICE</h2>
            <p>Keep screen face-down. Hand it privately to <strong>{actorName}</strong>.</p>
          </div>
          <div className="mf-pass-card">
            <p className="mf-pass-inst">Waiting for</p>
            <h2 className="mf-pass-name">{actorName}</h2>
          </div>
          <button className="mf-main-btn mf-btn-amber" onClick={() => setNightStep('identity')}>
            I am {actorName} →
          </button>
        </div>
      </div>
    );

    // IDENTITY: this player's role reminder
    if (nightStep === 'identity') return (
      <div className={`mf-root ${isMafiaA ? 'mf-identity-mafia' : 'mf-night-bg'}`}
        onClick={() => setNightStep('action')}>
        <div className="mf-identity-content">
          <div className="mf-role-card-icon" style={{ fontSize: '5rem' }}>
            {isMafiaA ? '🔪' : '🌾'}
          </div>
          <h1 className="mf-identity-role">
            {isMafiaA ? 'YOU ARE MAFIA' : 'YOU ARE VILLAGER'}
          </h1>
          {isMafiaA && mafiaPartners.length > 0 && (
            <div className="mf-partners">
              <span className="mf-partners-label">Mafia crew:</span>
              <div className="mf-partners-row">
                {mafiaPartners.map((p: any) => <span key={p.id} className="mf-partner-chip">{p.name}</span>)}
              </div>
            </div>
          )}
          {isMafiaA && prevMafiaTarget && (
            <div className="mf-prev-target">
              <span className="mf-prev-label">Previous mafia chose:</span>
              <span className="mf-prev-name">{prevMafiaTarget}</span>
              <span className="mf-prev-hint">You have the final say.</span>
            </div>
          )}
          <p className="mf-identity-tap">Tap anywhere to continue →</p>
        </div>
      </div>
    );

    // ACTION: pick target
    if (nightStep === 'action') return (
      <div className={`mf-root ${isMafiaA ? 'mf-night-bg' : 'mf-placebo-bg'}`}>
        <div className="mf-action-wrap">
          <div className="mf-phase-instruct dark">
            <span className="mf-phase-instruct-icon">{isMafiaA ? '🔪' : '🌾'}</span>
            <h2>{isMafiaA ? 'CHOOSE YOUR TARGET' : 'VOTE YOUR SUSPICION'}</h2>
            <p>
              {isMafiaA
                ? 'Pick who to attack tonight. You can target anyone including yourself. Your choice is final.'
                : 'Tap who you suspect. This is a practice vote — it doesn\'t affect the game tonight.'}
            </p>
          </div>

          {isMafiaA && prevMafiaTarget && (
            <div className="mf-prev-target compact">
              <span>Previous pick: <strong>{prevMafiaTarget}</strong> — agree or change it.</span>
            </div>
          )}

          <div className="mf-target-grid">
            {alive.map((p: any) => (
              <button key={p.id}
                className={`mf-target-btn ${health[p.id] === 'wounded' ? 'wounded' : ''}`}
                onClick={() => handleNightAction(p.id)}>
                <span className="mf-target-av">{p.name.charAt(0)}</span>
                <span className="mf-target-name">{p.name}</span>
                {health[p.id] === 'wounded' && <span className="mf-target-wound">⚠️ WOUNDED</span>}
              </button>
            ))}
          </div>

          {isMafiaA && (
            <button className="mf-ghost-btn" onClick={() => handleNightAction(null)}>
              ✋ Lay low — skip attacking tonight
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

    // LOCKING
    if (nightStep === 'locking') return (
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
    const voteCount: Record<string, number> = {};
    Object.values(mafiaVotes).forEach((v: any) => { voteCount[v] = (voteCount[v] ?? 0) + 1; });

    if (isMafia && !isDead) return (
      <div className="mf-root mf-night-bg mf-mafia-night">
        <Stars count={30} />
        <div className="mf-online-night-inner">
          <div className="mf-phase-instruct dark">
            <span className="mf-phase-instruct-icon">🔪</span>
            <h2>MAFIA STRIKE</h2>
            <p>Vote for a target. Strict majority needed. The last vote with majority wins. Timer runs out = most votes wins.</p>
          </div>

          <div className="mf-night-hud">
            <div className="mf-online-phase-label">NIGHT {roundNum}</div>
            <div className="mf-night-timer">{timeLeft}s</div>
          </div>
          <div className="mf-timer-track">
            <div className="mf-timer-fill night" style={{ width: `${(timeLeft / NIGHT_TIME) * 100}%` }} />
          </div>

          {/* Show who each mafia member voted for */}
          <div className="mf-mafia-crew">
            <p className="mf-crew-label">Your crew ({mafiaAlive.length}):</p>
            {mafiaAlive.map((p: any) => {
              const theirVote = mafiaVotes[p.id];
              const targetName = theirVote ? players.find((x: any) => x.id === theirVote)?.name : null;
              return (
                <div key={p.id} className="mf-crew-chip">
                  <span className="mf-crew-av">{p.name.charAt(0)}</span>
                  <span className="mf-crew-nm">{p.name} {p.id === currentPlayerId ? '(you)' : ''}</span>
                  {targetName
                    ? <span className="mf-voted-tick">→ {targetName}</span>
                    : <span className="mf-crew-pending">…voting</span>}
                </div>
              );
            })}
          </div>

          <h3 className="mf-action-title">🎯 Pick your target</h3>
          <div className="mf-target-grid">
            {alive.map((p: any) => {
              const vc = voteCount[p.id] ?? 0;
              return (
                <button key={p.id}
                  className={`mf-target-btn ${myMafiaVote === p.id ? 'selected' : ''} ${health[p.id] === 'wounded' ? 'wounded' : ''}`}
                  onClick={() => castMafiaVote(p.id)}>
                  <span className="mf-target-av">{p.name.charAt(0)}</span>
                  <span className="mf-target-name">{p.name}</span>
                  {health[p.id] === 'wounded' && <span className="mf-target-wound">⚠️</span>}
                  {vc > 0 && <span className="mf-vote-dot">{vc}</span>}
                </button>
              );
            })}
          </div>

          {myMafiaVote && <p className="mf-wait-pulse">✓ Vote locked in. Waiting for crew…</p>}

          {/* Mafia private chat */}
          <div className="mf-mafia-chat">
            <p className="mf-section-label">🔪 Mafia Chat (private)</p>
            <div className="mf-mafia-chat-feed">
              {mafiaChat.slice(-8).map((m: any, i: number) => {
                const sender = players.find((p: any) => p.id === m.playerId);
                return (
                  <div key={i} className="mf-mafia-msg">
                    <span className="mf-mafia-msg-name">{sender?.name}</span>
                    <span>{m.text}</span>
                  </div>
                );
              })}
            </div>
            <form className="mf-chat-form" onSubmit={sendMafiaChat}>
              <input className="mf-chat-input mf-mafia-input"
                placeholder="Mafia eyes only…"
                value={mafiaChatIn} onChange={e => setMafiaChatIn(e.target.value)} autoComplete="off" />
              <button className="mf-chat-send" type="submit">→</button>
            </form>
          </div>
        </div>
      </div>
    );

    // Villager — sensory deprivation
    return (
      <div className="mf-root mf-villager-night">
        <div className="mf-villager-night-content">
          <div className="mf-pulse-ring" />
          <div className="mf-pulse-ring delay1" />
          <div className="mf-pulse-ring delay2" />
          <div className="mf-phase-instruct dark centered">
            <span className="mf-phase-instruct-icon">🌙</span>
            <h2>THE NIGHT</h2>
            <p>The Mafia is deciding who to attack. Stay quiet. Don't tip them off.</p>
          </div>
          <h1 className="mf-senses-title">CLOSE YOUR EYES</h1>
          <p className="mf-senses-sub">The streets of Nairobi go dark…</p>
          <div className="mf-night-timer-bar">
            <div className="mf-night-timer-fill" style={{ width: `${(timeLeft / NIGHT_TIME) * 100}%` }} />
          </div>
          <p className="mf-dim">{timeLeft}s</p>
        </div>
      </div>
    );
  }

  // ── MORNING REVEAL ───────────────────────────────────────────
  if (phase === 'MORNING_REVEAL') {
    const elim  = players.find((p: any) => p.id === eliminated);
    const wound = players.find((p: any) => p.id === wounded);
    const quiet = !eliminated && !wounded;

    return (
      <div className="mf-root mf-morning-bg">
        <div className="mf-sun-container"><div className="mf-sun-rays" /><div className="mf-sun" /></div>
        <div className="mf-morning-inner">
          <div className="mf-phase-instruct">
            <span className="mf-phase-instruct-icon">🌅</span>
            <h2>MORNING REPORT</h2>
            <p>The night is over. Here's what happened while you slept.</p>
          </div>
          <h1 className="mf-morning-title">DAY {roundNum}</h1>

          {quiet && (
            <div className="mf-reveal-card quiet">
              <span className="mf-reveal-icon">🌅</span>
              <h2>Quiet night</h2>
              <p>The Mafia held back. Nobody was touched. Don't get comfortable.</p>
            </div>
          )}
          {wound && !elim && (
            <div className="mf-reveal-card wounded">
              <span className="mf-reveal-icon">🩸</span>
              <h2>ATTACKED — survived</h2>
              <div className="mf-reveal-pname">{wound.name}</div>
              <p>{wound.name} was hit overnight but survived. One more attack and they're gone.</p>
            </div>
          )}
          {elim && (
            <div className="mf-reveal-card dead">
              <span className="mf-reveal-icon">💀</span>
              <h2>KILLED OVERNIGHT</h2>
              <div className="mf-reveal-pname dead">{elim.name}</div>
              <p>{elim.name} didn't survive the night. Nobody knows who did it. Figure it out.</p>
            </div>
          )}
          <p className="mf-auto-advance blink">Discussion starting soon…</p>
        </div>
      </div>
    );
  }

  // ── DAY DISCUSS ──────────────────────────────────────────────
  if (phase === 'DAY_DISCUSS') {
    const urgent = timeLeft <= 20;
    const isDeadSpectating = isDead && !spectators.includes(currentPlayerId ?? '');

    return (
      <div className="mf-root mf-day-bg">
        <div className="mf-sun-container"><div className="mf-sun-rays" /><div className="mf-sun" /></div>
        <div className="mf-day-inner">
          <div className="mf-phase-instruct">
            <span className="mf-phase-instruct-icon">🗣️</span>
            <h2>DISCUSSION PHASE</h2>
            <p>
              {isDead
                ? isDeadSpectating
                  ? 'You\'re eliminated but still in the conversation. Contribute — just no voting.'
                  : 'You\'re watching silently.'
                : 'Argue. Accuse. Build alliances. Find the Mafia. Vote when the timer ends.'}
            </p>
          </div>

          <div className="mf-day-hud">
            <h1 className="mf-day-title">DAY {roundNum}</h1>
            <div className={`mf-day-timer ${urgent ? 'urgent' : ''}`}>{timeLeft}s</div>
          </div>
          <div className="mf-timer-track">
            <div className={`mf-timer-fill ${urgent ? 'urgent' : ''}`} style={{ width: `${timerPct}%` }} />
          </div>

          {/* Alive players list */}
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

          {/* Online group chat — alive + staying-dead can chat, spectators cannot */}
          {!isPassPlay && !spectators.includes(currentPlayerId ?? '') && (
            <div className="mf-chat-panel">
              <p className="mf-section-label">
                💬 Group chat
                {isDead && ' (eliminated — limited to observation)'}
              </p>
              <div className="mf-chat-feed">
                {chat.slice(-15).map((m: any, i: number) => {
                  const sender    = players.find((p: any) => p.id === m.playerId);
                  const senderDead = health[m.playerId] === 'dead';
                  return (
                    <div key={i} className={`mf-chat-msg ${senderDead ? 'ghost-msg' : ''}`}>
                      <span className="mf-chat-name">{sender?.name}{senderDead ? ' 👻' : ''}</span>
                      <span className="mf-chat-text">{m.text}</span>
                    </div>
                  );
                })}
              </div>
              <form className="mf-chat-form" onSubmit={sendChat}>
                <input className="mf-chat-input"
                  placeholder={isDead ? 'You can comment but you can\'t vote…' : 'Accuse someone…'}
                  value={chatInput} onChange={e => setChatInput(e.target.value)} autoComplete="off" />
                <button className="mf-chat-send" type="submit">→</button>
              </form>
            </div>
          )}

          {/* Mafia private chat — only visible to mafia during day as well */}
          {isMafia && !isDead && !isPassPlay && (
            <div className="mf-mafia-chat">
              <p className="mf-section-label">🔪 Mafia Chat (only your crew sees this)</p>
              <div className="mf-mafia-chat-feed">
                {mafiaChat.slice(-8).map((m: any, i: number) => {
                  const sender = players.find((p: any) => p.id === m.playerId);
                  return (
                    <div key={i} className="mf-mafia-msg">
                      <span className="mf-mafia-msg-name">{sender?.name}</span>
                      <span>{m.text}</span>
                    </div>
                  );
                })}
              </div>
              <form className="mf-chat-form" onSubmit={sendMafiaChat}>
                <input className="mf-chat-input mf-mafia-input"
                  placeholder="Coordinate with your crew…"
                  value={mafiaChatIn} onChange={e => setMafiaChatIn(e.target.value)} autoComplete="off" />
                <button className="mf-chat-send" type="submit">→</button>
              </form>
            </div>
          )}

          {/* Skip to vote — host + local */}
          {(isHost || isPassPlay) && !isDead && (
            <button className="mf-ghost-btn mf-skip-vote"
              onClick={() => setSharedState({
                phase: 'VOTE', dayVotes: {}, votePassIdx: 0,
                endTime: Date.now() + VOTE_TIME * 1000
              })}>
              ⏭ Skip to Vote
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── VOTE (and VOTE_REVOTE) ───────────────────────────────────
  // In LOCAL mode: pass-device sequential — one person votes at a time.
  //   votePassIdx tracks index into alive[].
  // In ONLINE mode: everyone votes simultaneously on their own device.
  if (phase === 'VOTE' || phase === 'VOTE_REVOTE') {
    const isRevote = phase === 'VOTE_REVOTE';
    const urgent   = timeLeft <= 8;

    // ── LOCAL (pass-device sequential) ──────────────────────
    if (isPassPlay) {
      const currentVoterPlayer = alive[votePassIdx];
      const allVoted = votePassIdx >= alive.length;

      // All voted — host resolves
      if (allVoted) {
        return (
          <div className="mf-root mf-vote-bg">
            <div className="mf-vote-inner">
              <div className="mf-phase-instruct dark">
                <span className="mf-phase-instruct-icon">⚖️</span>
                <h2>ALL VOTES CAST</h2>
                <p>Everyone has voted. Host — tap to see the result.</p>
              </div>
              <div className="mf-ballot-preview">
                {alive.map((p: any) => {
                  const votedForId = dayVotes[p.id];
                  const votedFor   = players.find((x: any) => x.id === votedForId);
                  return (
                    <div key={p.id} className="mf-ballot-row" style={{ animationDelay: '0s' }}>
                      <span className="mf-ballot-voter">{p.name}</span>
                      <span className="mf-ballot-arrow">→</span>
                      <span className="mf-ballot-choice">{votedFor?.name ?? '?'}</span>
                    </div>
                  );
                })}
              </div>
              {(isHost || isPassPlay) && (
                <button className="mf-main-btn mf-btn-red"
                  onClick={() => resolveVotes(dayVotes, health, isRevote, reVoteCount)}>
                  ⚖️ Reveal the result →
                </button>
              )}
            </div>
          </div>
        );
      }

      const voterName = currentVoterPlayer?.name ?? '?';
      const hasVoted  = !!dayVotes[currentVoterPlayer?.id];

      // Gate: pass device to current voter
      if (!hasVoted) {
        return (
          <div className="mf-root mf-vote-bg">
            <div className="mf-vote-inner">
              <div className="mf-phase-instruct dark">
                <span className="mf-phase-instruct-icon">📱</span>
                <h2>PASS THE PHONE</h2>
                <p>
                  Hand the phone to <strong>{voterName}</strong>.
                  {isRevote ? ' It\'s a tiebreaker — vote carefully.' : ''}
                </p>
              </div>

              <div className="mf-pass-card">
                <p className="mf-pass-inst">{votePassIdx + 1} / {alive.length}</p>
                <h2 className="mf-pass-name">{voterName}</h2>
                <p className="mf-pass-sub">Cast your vote</p>
              </div>

              <div className="mf-phase-instruct dark" style={{ marginTop: 8 }}>
                <span className="mf-phase-instruct-icon">⚖️</span>
                <h2>{isRevote ? 'TIEBREAKER VOTE' : 'VOTE'}</h2>
                <p>
                  {isRevote
                    ? 'There was a tie. This is the final re-vote. Second tie = nobody leaves.'
                    : 'Who is the Mafia? Vote your gut. No skipping.'}
                </p>
              </div>

              <div className="mf-target-grid">
                {alive.filter((p: any) => p.id !== currentVoterPlayer?.id).map((p: any) => (
                  <button key={p.id}
                    className={`mf-target-btn ${health[p.id] === 'wounded' ? 'wounded' : ''}`}
                    onClick={async () => {
                      sfx('vote'); vibe(60);
                      const newVotes = { ...dayVotes, [currentVoterPlayer.id]: p.id };
                      await setSharedState({ dayVotes: newVotes, votePassIdx: votePassIdx + 1 });
                    }}>
                    <span className="mf-target-av">{p.name.charAt(0)}</span>
                    <span className="mf-target-name">{p.name}</span>
                    {health[p.id] === 'wounded' && <span className="mf-target-wound">⚠️ WOUNDED</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      }

      return null;
    }

    // ── ONLINE (simultaneous) ────────────────────────────────
    const myVote = dayVotes[currentPlayerId ?? ''];
    const voteCountsDay: Record<string, number> = {};
    Object.values(dayVotes).forEach((v: any) => {
      if (v) voteCountsDay[v] = (voteCountsDay[v] ?? 0) + 1;
    });
    const totalVoted   = Object.keys(dayVotes).length;
    const votablePlayers = alive.filter((p: any) => p.id !== currentPlayerId);

    return (
      <div className="mf-root mf-vote-bg">
        <div className="mf-vote-inner">
          <div className="mf-phase-instruct dark">
            <span className="mf-phase-instruct-icon">🗳️</span>
            <h2>{isRevote ? 'TIEBREAKER VOTE' : 'WHO\'S THE MAFIA?'}</h2>
            <p>
              {isRevote
                ? 'First vote was a tie. This is the final re-vote. If tied again — nobody leaves tonight.'
                : 'Cast your vote. No skipping. Everyone votes simultaneously. Majority rules.'}
            </p>
          </div>

          <div className="mf-vote-hud">
            <h1 className="mf-vote-title">{isRevote ? '🔄 RE-VOTE' : '🗳️ VOTE'}</h1>
            <div className={`mf-vote-timer ${urgent ? 'urgent' : ''}`}>{timeLeft}s</div>
          </div>
          <div className="mf-timer-track">
            <div className={`mf-timer-fill vote ${urgent ? 'urgent' : ''}`}
              style={{ width: `${(timeLeft / VOTE_TIME) * 100}%` }} />
          </div>

          <p className="mf-vote-instruction">
            {myVote
              ? `✓ You voted for ${players.find((p: any) => p.id === myVote)?.name ?? '?'} · ${totalVoted}/${alive.length} voted`
              : `${totalVoted}/${alive.length} voted — choose carefully`}
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
          {myVote && <p className="mf-wait-pulse">✓ Vote locked. Waiting for others…</p>}
          {isDead && amStaying && <p className="mf-dim">You're eliminated — no voting rights.</p>}

          {isHost && (
            <button className="mf-main-btn mf-btn-red mf-resolve-btn"
              onClick={() => resolveVotes(dayVotes, health, isRevote, reVoteCount)}>
              ⚖️ End Vote Now
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── VOTE REVEAL ──────────────────────────────────────────────
  if (phase === 'VOTE_REVEAL') {
    const elim = players.find((p: any) => p.id === eliminated);
    return (
      <div className="mf-root mf-vote-reveal-bg">
        <div className="mf-ballot-inner">
          <div className="mf-phase-instruct dark">
            <span className="mf-phase-instruct-icon">📋</span>
            <h2>THE BALLOT</h2>
            <p>Here's how everyone voted.</p>
          </div>
          <h1 className="mf-ballot-title">THE VOTES</h1>
          {elim
            ? <p className="mf-ballot-verdict">{elim.name} is out.</p>
            : <p className="mf-ballot-verdict">Tie. Nobody leaves tonight.</p>}

          <div className="mf-ballot-list">
            {alive.map((p: any, i: number) => {
              const vote     = dayVotes[p.id];
              const votedFor = players.find((pl: any) => pl.id === vote);
              return (
                <div key={p.id} className="mf-ballot-row" style={{ animationDelay: `${i * 0.1}s` }}>
                  <span className="mf-ballot-voter">{p.name}</span>
                  <span className="mf-ballot-arrow">→</span>
                  <span className={`mf-ballot-choice ${!vote ? 'skip' : ''}`}>
                    {vote ? votedFor?.name ?? '?' : 'No vote'}
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

  // ── EXECUTION ─────────────────────────────────────────────────
  if (phase === 'EXECUTION') {
    const exec   = players.find((p: any) => p.id === eliminated);
    const wasMaf = exec ? roles[exec.id] === 'MAFIA' : false;

    return (
      <div className={`mf-root ${exec ? (wasMaf ? 'mf-exec-mafia' : 'mf-exec-village') : 'mf-exec-tie'}`}>
        <div className="mf-exec-inner">
          {exec ? (
            <>
              {/* Shatter effect */}
              <div className="mf-exec-shatter">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="mf-shard"
                    style={{ '--angle': `${i * 30}deg`, animationDelay: `${i * 0.04}s` } as React.CSSProperties} />
                ))}
              </div>

              <div className="mf-exec-content">
                <span className="mf-exec-icon">{wasMaf ? '🎭' : '⚰️'}</span>

                {/* Name — maximum impact */}
                <h1 className={`mf-exec-name ${wasMaf ? 'mafia' : 'village'}`}>
                  {exec.name}
                </h1>

                {/* Role reveal */}
                <div className={`mf-exec-role-badge ${wasMaf ? 'mafia' : 'village'}`}>
                  {wasMaf ? '🔪 WAS MAFIA' : '🌾 WAS INNOCENT'}
                </div>

                {/* Flavour */}
                <p className="mf-exec-flavor">
                  {wasMaf
                    ? 'The village got one. One less wolf in the dark.'
                    : 'Wrong call. An innocent paid the price. The real Mafia is still out there.'}
                </p>

                {/* Dead men tell no tales */}
                <p className="mf-exec-ghost">
                  💀 Dead men tell no tales.
                </p>

                <p className="mf-exec-continues blink">
                  {stateRef.current.winner
                    ? 'Game over incoming…'
                    : 'Night falls again…'}
                </p>
              </div>
            </>
          ) : (
            /* Tie — nobody leaves */
            <div className="mf-exec-content">
              <span className="mf-exec-icon">🤝</span>
              <h1 className="mf-exec-tie-title">TIE — Nobody leaves</h1>
              <p className="mf-exec-flavor">
                No consensus. The Mafia breathes a sigh of relief. Night falls again.
              </p>
              <p className="mf-exec-continues blink">Night incoming…</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── GAME OVER ─────────────────────────────────────────────────
  if (phase === 'GAME_OVER') {
    const villageWin = winner === 'VILLAGERS';
    return (
      <div className={`mf-root ${villageWin ? 'mf-gameover-village' : 'mf-gameover-mafia'}`}>
        <Confetti active={showConfetti} />
        {villageWin && <Stars count={40} />}
        <div className="mf-gameover-inner">
          <div className="mf-gameover-banner">
            <span className="mf-gameover-trophy">{villageWin ? '☀️' : '🔪'}</span>
            <h1 className="mf-gameover-title">{villageWin ? 'VILLAGE WINS!' : 'MAFIA WINS!'}</h1>
            <p className="mf-gameover-sub">
              {villageWin
                ? 'All Mafia eliminated. The streets are safe again.'
                : 'Mafia took control. The village never had a chance.'}
            </p>
          </div>

          <div className="mf-final-roles">
            <h2 className="mf-section-label">THE FULL TRUTH</h2>
            {players.map((p: any) => (
              <div key={p.id}
                className={`mf-final-row ${health[p.id] === 'dead' ? 'dead' : ''} ${roles[p.id] === 'MAFIA' ? 'mafia-row' : ''}`}>
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