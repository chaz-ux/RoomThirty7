import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMultiplayer } from '../../context/MultiplayerContext';
import './Mafia.css';

// =============================================================================
// TYPES
// =============================================================================
type Phase =
  | 'LOBBY'
  | 'NIGHT_PASS'       // Local: device passed around for night actions
  | 'NIGHT_ONLINE'     // Online: simultaneous night voting
  | 'MORNING_REVEAL'   // Both: show what happened overnight
  | 'DAY_DISCUSS'      // Both: 90s discussion
  | 'VOTE'             // Both: voting phase
  | 'VOTE_REVEAL'      // Both: ballot reveal
  | 'EXECUTION'        // Both: dramatic execution screen
  | 'GAME_OVER';

type Role = 'VILLAGER' | 'MAFIA';
type HealthStatus = 'healthy' | 'wounded' | 'dead';

interface MafiaPlayer {
  id: string;
  name: string;
  isHost?: boolean;
}

interface NightAction {
  actorId: string;
  targetId: string | null; // null = abstained
  isMafia: boolean;
}

interface ChatMessage {
  playerId: string;
  text: string;
  ts: number;
  isGhost?: boolean;
}

interface MafiaSharedState {
  phase: Phase;
  roles: Record<string, Role>;
  health: Record<string, HealthStatus>; // healthy | wounded | dead
  passOrder: string[];       // Local: ordered player IDs for night passing
  passIndex: number;         // Local: whose turn it is right now
  nightActions: NightAction[]; // collected night actions
  mafiaVotes: Record<string, string>; // online: mafia player ID → target ID
  dayVotes: Record<string, string | 'skip'>; // day voting ballot
  endTime: number;           // for timers
  roundNumber: number;
  eliminatedThisRound: string | null;
  woundedThisRound: string | null;
  winner: 'VILLAGERS' | 'MAFIA' | null;
  chat: ChatMessage[];
  ghostChat: ChatMessage[];
  revealBallot: boolean;     // show full ballot during vote reveal
}

const DISCUSSION_TIME = 90;
const VOTE_TIME = 15;
const MORNING_REVEAL_AUTO = 5000; // ms before auto-advancing from morning reveal

const getMafiaCount = (n: number) => n >= 9 ? 3 : n >= 6 ? 2 : 1;

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const vibe = (p: number | number[]) => { try { navigator.vibrate(p); } catch (_) {} };

// =============================================================================
// AUDIO
// =============================================================================
let _audioCtx: AudioContext | null = null;
const getAudio = () => {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return _audioCtx;
};
const playSound = (type: 'shatter' | 'night' | 'morning' | 'vote' | 'buzzer' | 'kill') => {
  try {
    const ctx = getAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    if (type === 'shatter') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.6);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
      osc.start(); osc.stop(ctx.currentTime + 0.7);
    } else if (type === 'night') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.setValueAtTime(150, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc.start(); osc.stop(ctx.currentTime + 1.5);
    } else if (type === 'morning') {
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.15);
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start(); osc.stop(ctx.currentTime + 0.6);
    } else if (type === 'buzzer') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(); osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'kill') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.8);
      gain.gain.setValueAtTime(0.6, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
      osc.start(); osc.stop(ctx.currentTime + 1);
    }
  } catch (_) {}
};

// =============================================================================
// COMPONENT
// =============================================================================
const MafiaGame: React.FC = () => {
  const { players, sharedState, setSharedState, isHost, currentPlayerId, mode } =
    useMultiplayer() as {
      players: MafiaPlayer[];
      sharedState: Partial<MafiaSharedState> | null;
      setSharedState: (s: Partial<MafiaSharedState>) => Promise<void>;
      isHost: boolean;
      currentPlayerId: string | null;
      mode: 'local' | 'online';
    };

  // Local UI state
  const [localPhase, setLocalPhase] = useState<
    'waiting' | 'identity' | 'action' | 'lockingIn' | 'passed'
  >('waiting');
  const [chatInput, setChatInput] = useState('');
  const [ghostInput, setGhostInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [voteInput, setVoteInput] = useState<string | null>(null);
  const [screenFlash, setScreenFlash] = useState<'none' | 'red' | 'white' | 'black'>('none');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Merge shared state with defaults
  const s = sharedState ?? {};
  const phase = s.phase ?? 'LOBBY';
  const roles = s.roles ?? {};
  const health = s.health ?? {};
  const passOrder = s.passOrder ?? [];
  const passIndex = s.passIndex ?? 0;
  const nightActions = s.nightActions ?? [];
  const mafiaVotes = s.mafiaVotes ?? {};
  const dayVotes = s.dayVotes ?? {};
  const endTime = s.endTime ?? 0;
  const roundNumber = s.roundNumber ?? 1;
  const eliminatedThisRound = s.eliminatedThisRound ?? null;
  const woundedThisRound = s.woundedThisRound ?? null;
  const winner = s.winner ?? null;
  const chat = s.chat ?? [];
  const ghostChat = s.ghostChat ?? [];
  const revealBallot = s.revealBallot ?? false;

  const myRole = roles[currentPlayerId ?? ''] ?? null;
  const myHealth = health[currentPlayerId ?? ''] ?? 'healthy';
  const isDead = myHealth === 'dead';
  const isMafia = myRole === 'MAFIA';
  const alivePlayers = players.filter(p => health[p.id] !== 'dead');
  const deadPlayers = players.filter(p => health[p.id] === 'dead');
  const mafiaAlive = players.filter(p => roles[p.id] === 'MAFIA' && health[p.id] !== 'dead');
  const villagerAlive = players.filter(p => roles[p.id] === 'VILLAGER' && health[p.id] !== 'dead');
  const isMyPassTurn = passOrder[passIndex] === currentPlayerId;
  const currentPassPlayer = players.find(p => p.id === passOrder[passIndex]);
  const myMafiaPartners = mafiaAlive.filter(p => p.id !== currentPlayerId);

  // =============================================================================
  // TIMER (endTime-based — zero Firestore writes during countdown)
  // =============================================================================
  useEffect(() => {
    if (phase !== 'DAY_DISCUSS' && phase !== 'VOTE' && phase !== 'NIGHT_ONLINE') return;
    const tick = () => {
      const rem = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setTimeLeft(rem);
      if (rem === 0 && (isHost || mode === 'local')) {
        clearInterval(timerRef.current!);
        if (phase === 'DAY_DISCUSS') setSharedState({ phase: 'VOTE', endTime: Date.now() + VOTE_TIME * 1000, revealBallot: false });
        else if (phase === 'VOTE') resolveVotes();
        else if (phase === 'NIGHT_ONLINE') resolveNightOnline();
      }
    };
    tick();
    timerRef.current = setInterval(tick, 300);
    return () => clearInterval(timerRef.current!);
  }, [phase, endTime]);

  // =============================================================================
  // WIN CONDITION CHECK (runs after every health update)
  // =============================================================================
  const checkWin = (newHealth: Record<string, HealthStatus>): 'VILLAGERS' | 'MAFIA' | null => {
    const aliveM = players.filter(p => roles[p.id] === 'MAFIA' && newHealth[p.id] !== 'dead').length;
    const aliveV = players.filter(p => roles[p.id] === 'VILLAGER' && newHealth[p.id] !== 'dead').length;
    if (aliveM === 0) return 'VILLAGERS';
    if (aliveM >= aliveV) return 'MAFIA';
    return null;
  };

  // =============================================================================
  // START GAME
  // =============================================================================
  const startGame = async () => {
    if (!isHost) return;
    const numMafia = getMafiaCount(players.length);
    const shuffled = shuffle(players);
    const newRoles: Record<string, Role> = {};
    const newHealth: Record<string, HealthStatus> = {};
    shuffled.slice(0, numMafia).forEach(p => { newRoles[p.id] = 'MAFIA'; });
    shuffled.slice(numMafia).forEach(p => { newRoles[p.id] = 'VILLAGER'; });
    players.forEach(p => { newHealth[p.id] = 'healthy'; });

    const order = shuffle(players.map(p => p.id));

    await setSharedState({
      phase: mode === 'local' ? 'NIGHT_PASS' : 'NIGHT_ONLINE',
      roles: newRoles,
      health: newHealth,
      passOrder: order,
      passIndex: 0,
      nightActions: [],
      mafiaVotes: {},
      dayVotes: {},
      endTime: mode === 'online' ? Date.now() + 20000 : 0,
      roundNumber: 1,
      eliminatedThisRound: null,
      woundedThisRound: null,
      winner: null,
      chat: [],
      ghostChat: [],
      revealBallot: false,
    });
    playSound('night');
    vibe([200, 100, 200]);
  };

  // =============================================================================
  // LOCAL PASS-AND-PLAY NIGHT LOGIC
  // =============================================================================
  const handlePassReady = () => setLocalPhase('identity');

  const handleIdentityConfirm = () => setLocalPhase('action');

  const handleNightAction = async (targetId: string | null) => {
    setLocalPhase('lockingIn');
    vibe([100]);

    const actor = passOrder[passIndex];
    const actorRole = roles[actor] ?? 'VILLAGER';
    const action: NightAction = { actorId: actor, targetId, isMafia: actorRole === 'MAFIA' };

    // Only keep actions from mafia (villager placebos are discarded)
    const updatedActions = actorRole === 'MAFIA'
      ? [...nightActions.filter(a => a.actorId !== actor), action]
      : nightActions;

    const nextIndex = passIndex + 1;
    const isLast = nextIndex >= passOrder.length;

    await new Promise(r => setTimeout(r, 1800)); // lock-in spinner

    if (isLast) {
      // All players have gone — resolve night
      const result = resolveNightLocal(updatedActions);
      await setSharedState({
        nightActions: updatedActions,
        passIndex: nextIndex,
        phase: 'MORNING_REVEAL',
        health: result.newHealth,
        eliminatedThisRound: result.eliminated,
        woundedThisRound: result.wounded,
      });
      setLocalPhase('waiting');
    } else {
      await setSharedState({
        nightActions: updatedActions,
        passIndex: nextIndex,
      });
      setLocalPhase('waiting');
    }
  };

  const resolveNightLocal = (actions: NightAction[]) => {
    // Last mafia action wins
    const mafiaActions = actions.filter(a => a.isMafia);
    const lastAction = mafiaActions[mafiaActions.length - 1];
    const targetId = lastAction?.targetId ?? null;

    const newHealth = { ...health };
    let eliminated: string | null = null;
    let wounded: string | null = null;

    if (targetId) {
      const current = newHealth[targetId] ?? 'healthy';
      if (current === 'wounded') {
        newHealth[targetId] = 'dead';
        eliminated = targetId;
        playSound('kill');
        vibe([300, 100, 300, 100, 500]);
      } else if (current === 'healthy') {
        newHealth[targetId] = 'wounded';
        wounded = targetId;
        playSound('shatter');
        vibe([200, 100, 200]);
      }
    }

    return { newHealth, eliminated, wounded };
  };

  // =============================================================================
  // ONLINE NIGHT LOGIC
  // =============================================================================
  const castMafiaVote = async (targetId: string) => {
    if (!currentPlayerId || !isMafia) return;
    await setSharedState({ mafiaVotes: { ...mafiaVotes, [currentPlayerId]: targetId } });
  };

  const resolveNightOnline = useCallback(async () => {
    // Majority vote among mafia
    const votes: Record<string, number> = {};
    mafiaAlive.forEach(m => {
      const v = mafiaVotes[m.id];
      if (v) votes[v] = (votes[v] ?? 0) + 1;
    });

    const threshold = Math.ceil(mafiaAlive.length / 2);
    const agreed = Object.entries(votes).find(([, c]) => c >= threshold);
    const targetId = agreed ? agreed[0] : null;

    const newHealth = { ...health };
    let eliminated: string | null = null;
    let wounded: string | null = null;

    if (targetId) {
      const current = newHealth[targetId] ?? 'healthy';
      if (current === 'wounded') {
        newHealth[targetId] = 'dead';
        eliminated = targetId;
      } else if (current === 'healthy') {
        newHealth[targetId] = 'wounded';
        wounded = targetId;
      }
    }

    const gameWinner = checkWin(newHealth);
    await setSharedState({
      phase: 'MORNING_REVEAL',
      health: newHealth,
      eliminatedThisRound: eliminated,
      woundedThisRound: wounded,
      winner: gameWinner,
      mafiaVotes: {},
    });
  }, [mafiaVotes, mafiaAlive, health, roles, players]);

  // =============================================================================
  // MORNING → DAY
  // =============================================================================
  useEffect(() => {
    if (phase !== 'MORNING_REVEAL' || !(isHost || mode === 'local')) return;
    const t = setTimeout(async () => {
      if (winner) {
        await setSharedState({ phase: 'GAME_OVER' });
      } else {
        await setSharedState({
          phase: 'DAY_DISCUSS',
          endTime: Date.now() + DISCUSSION_TIME * 1000,
        });
      }
    }, MORNING_REVEAL_AUTO);
    return () => clearTimeout(t);
  }, [phase, winner]);

  // =============================================================================
  // DAY VOTE
  // =============================================================================
  const castDayVote = async (targetId: string | 'skip') => {
    if (!currentPlayerId || isDead) return;
    setVoteInput(targetId);
    await setSharedState({ dayVotes: { ...dayVotes, [currentPlayerId]: targetId } });
  };

  const resolveVotes = useCallback(async () => {
    const counts: Record<string, number> = {};
    Object.values(dayVotes).forEach(v => {
      if (v && v !== 'skip') counts[v] = (counts[v] ?? 0) + 1;
    });

    let maxVotes = 0;
    let topId: string | null = null;
    Object.entries(counts).forEach(([id, c]) => {
      if (c > maxVotes) { maxVotes = c; topId = id; }
    });

    // Check tie
    if (topId) {
      const tied = Object.entries(counts).filter(([, c]) => c === maxVotes).length > 1;
      if (tied) topId = null;
    }

    const newHealth = { ...health };
    if (topId) {
      newHealth[topId] = 'dead'; // execution ignores wound status (per spec)
      playSound('kill');
      vibe([300, 100, 300]);
    }

    const gameWinner = checkWin(newHealth);
    await setSharedState({
      phase: 'VOTE_REVEAL',
      health: newHealth,
      eliminatedThisRound: topId,
      woundedThisRound: null,
      winner: gameWinner,
      revealBallot: true,
    });
    setVoteInput(null);
  }, [dayVotes, health, players, roles]);

  // VOTE_REVEAL → EXECUTION auto-advance
  useEffect(() => {
    if (phase !== 'VOTE_REVEAL' || !(isHost || mode === 'local')) return;
    const t = setTimeout(async () => {
      await setSharedState({ phase: 'EXECUTION' });
      playSound('shatter');
      vibe([500, 100, 500]);
    }, 4000);
    return () => clearTimeout(t);
  }, [phase]);

  // EXECUTION → next round or GAME_OVER
  useEffect(() => {
    if (phase !== 'EXECUTION' || !(isHost || mode === 'local')) return;
    const t = setTimeout(async () => {
      if (winner) {
        await setSharedState({ phase: 'GAME_OVER' });
      } else {
        await setSharedState({
          phase: mode === 'local' ? 'NIGHT_PASS' : 'NIGHT_ONLINE',
          passIndex: 0,
          nightActions: [],
          mafiaVotes: {},
          dayVotes: {},
          endTime: mode === 'online' ? Date.now() + 20000 : 0,
          roundNumber: roundNumber + 1,
          eliminatedThisRound: null,
          woundedThisRound: null,
          chat: [],
          revealBallot: false,
        });
        setLocalPhase('waiting');
        playSound('night');
      }
    }, 4000);
    return () => clearTimeout(t);
  }, [phase, winner]);

  // =============================================================================
  // CHAT
  // =============================================================================
  const sendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentPlayerId) return;
    await setSharedState({ chat: [...chat, { playerId: currentPlayerId, text: chatInput.trim(), ts: Date.now() }] });
    setChatInput('');
  };

  const sendGhostChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ghostInput.trim() || !currentPlayerId) return;
    await setSharedState({ ghostChat: [...ghostChat, { playerId: currentPlayerId, text: ghostInput.trim(), ts: Date.now(), isGhost: true }] });
    setGhostInput('');
  };

  const resetGame = async () => {
    await setSharedState({
      phase: 'LOBBY', roles: {}, health: {}, passOrder: [], passIndex: 0,
      nightActions: [], mafiaVotes: {}, dayVotes: {}, endTime: 0,
      roundNumber: 1, eliminatedThisRound: null, woundedThisRound: null,
      winner: null, chat: [], ghostChat: [], revealBallot: false,
    });
    setLocalPhase('waiting');
    setVoteInput(null);
  };

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================
  const PlayerHealthBadge = ({ playerId }: { playerId: string }) => {
    const h = health[playerId] ?? 'healthy';
    if (h === 'wounded') return <span className="mf-wounded-badge">⚠️ JERUHIWA</span>;
    if (h === 'dead') return <span className="mf-dead-badge">💀 MAITI</span>;
    return null;
  };

  const timerPct = endTime > 0
    ? Math.max(0, ((endTime - Date.now()) / ((phase === 'VOTE' ? VOTE_TIME : DISCUSSION_TIME) * 1000)) * 100)
    : 0;

  // =============================================================================
  // EMPTY LOBBY
  // =============================================================================
  if (players.length === 0) {
    return (
      <div className="mf-root">
        <div className="mf-center">
          <span className="mf-icon-xl">🎭</span>
          <p className="mf-dim">Ingia kwenye lobby kwanza</p>
          <a href="/" className="mf-ghost-btn">← Lobby</a>
        </div>
      </div>
    );
  }

  // =============================================================================
  // GHOST VIEW (dead players in online mode during live rounds)
  // =============================================================================
  if (isDead && mode === 'online' && phase !== 'LOBBY' && phase !== 'GAME_OVER') {
    return (
      <div className="mf-root mf-ghost-bg">
        <div className="mf-ghost-view">
          <div className="mf-ghost-header">
            <span className="mf-ghost-skull">👻</span>
            <h1 className="mf-ghost-title">UMEFARIKI</h1>
            <p className="mf-ghost-sub">You are a ghost. Watch in silence.</p>
          </div>
          <div className="mf-ghost-observe">
            <h2 className="mf-section-label">WANAOISHI ({alivePlayers.length})</h2>
            <div className="mf-alive-list">
              {alivePlayers.map(p => (
                <div key={p.id} className={`mf-alive-chip ${health[p.id] === 'wounded' ? 'wounded' : ''}`}>
                  {p.name}
                  <PlayerHealthBadge playerId={p.id} />
                </div>
              ))}
            </div>
          </div>
          <div className="mf-ghost-chat-box">
            <h2 className="mf-section-label">👻 MAZUNGUMZO YA MAPEPO</h2>
            <div className="mf-ghost-feed">
              {ghostChat.slice(-12).map((m, i) => {
                const sender = players.find(p => p.id === m.playerId);
                return (
                  <div key={i} className="mf-ghost-msg">
                    <span className="mf-ghost-name">{sender?.name}</span>
                    <span className="mf-ghost-text">{m.text}</span>
                  </div>
                );
              })}
            </div>
            <form className="mf-chat-form" onSubmit={sendGhostChat}>
              <input className="mf-chat-input" type="text" placeholder="Whisper to the dead…"
                value={ghostInput} onChange={e => setGhostInput(e.target.value)} />
              <button className="mf-chat-send" type="submit">→</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // =============================================================================
  // PHASE: LOBBY
  // =============================================================================
  if (phase === 'LOBBY') {
    const numMafia = getMafiaCount(players.length);
    return (
      <div className="mf-root mf-lobby-bg">
        <div className="mf-stars" aria-hidden>
          {Array.from({ length: 50 }).map((_, i) => (
            <div key={i} className="mf-star"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 4}s` }} />
          ))}
        </div>
        <div className="mf-lobby-inner">
          <div className="mf-logo-block">
            <span className="mf-logo-icon">🔪</span>
            <h1 className="mf-logo-title">MAFIA</h1>
            <p className="mf-logo-sub">Amini mtu — Lakini angalia mgongo wako</p>
          </div>

          <div className="mf-roster">
            {players.map((p, i) => (
              <div key={p.id} className="mf-roster-row" style={{ animationDelay: `${i * 0.07}s` }}>
                <span className="mf-roster-av">{p.name.charAt(0).toUpperCase()}</span>
                <span className="mf-roster-name">{p.name}</span>
                {p.isHost && <span className="mf-crown">👑</span>}
              </div>
            ))}
          </div>

          <div className="mf-role-count-row">
            <div className="mf-role-pill mafia">
              <span className="mf-role-num">{numMafia}</span>
              <span className="mf-role-lbl">MAFIA</span>
            </div>
            <span className="mf-vs">vs</span>
            <div className="mf-role-pill village">
              <span className="mf-role-num">{players.length - numMafia}</span>
              <span className="mf-role-lbl">VILLAGE</span>
            </div>
          </div>

          {isHost ? (
            <button className="mf-main-btn mf-btn-red"
              onClick={startGame}
              disabled={players.length < 4}>
              {players.length < 4 ? `Subiri wachezaji ${4 - players.length} zaidi` : 'ANZA MCHEZO'}
            </button>
          ) : (
            <p className="mf-wait-pulse">Subiri host aanze…</p>
          )}

          <a href="/" className="mf-exit">← Rudi Hub</a>
        </div>
      </div>
    );
  }

  // =============================================================================
  // PHASE: NIGHT_PASS (Local pass-and-play)
  // =============================================================================
  if (phase === 'NIGHT_PASS') {
    // If it's not local mode, skip
    if (mode !== 'local') return null;

    // Determine whose turn based on passIndex (not currentPlayerId - it's one device)
    const actorId = passOrder[passIndex];
    const actorName = players.find(p => p.id === actorId)?.name ?? '?';
    const actorRole = roles[actorId] ?? 'VILLAGER';
    const actorHealth = health[actorId] ?? 'healthy';

    // --- WAITING: show "pass to next player" ---
    if (localPhase === 'waiting') {
      return (
        <div className="mf-root mf-night-bg">
          <div className="mf-stars" aria-hidden>
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="mf-star" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 80}%`, animationDelay: `${Math.random() * 4}s` }} />
            ))}
          </div>
          <div className="mf-night-pass-wrapper">
            <div className="mf-moon" />
            <div className="mf-night-label">USIKU WA {roundNumber}</div>
            <div className="mf-pass-card">
              <p className="mf-pass-instruction">Pasha simu kwa</p>
              <h2 className="mf-pass-name">{actorName}</h2>
              <p className="mf-pass-sub">Hakikisha hakuna mtu anayeona</p>
            </div>
            <button className="mf-main-btn mf-btn-amber" onClick={handlePassReady}>
              Mimi ni {actorName} →
            </button>
          </div>
        </div>
      );
    }

    // --- IDENTITY: flash role ---
    if (localPhase === 'identity') {
      return (
        <div className={`mf-root ${actorRole === 'MAFIA' ? 'mf-identity-mafia' : 'mf-identity-villager'}`}>
          <div className="mf-identity-content" onClick={handleIdentityConfirm}>
            <div className="mf-identity-icon">{actorRole === 'MAFIA' ? '🔪' : '🌾'}</div>
            <h1 className="mf-identity-role">{actorRole === 'MAFIA' ? 'WEWE NI MAFIA' : 'WEWE NI MWANAKIJIJI'}</h1>
            {actorRole === 'MAFIA' && myMafiaPartners.length > 0 && (
              <div className="mf-mafia-partners">
                <p className="mf-partners-label">Washirika wako wa Mafia:</p>
                {players.filter(p => roles[p.id] === 'MAFIA' && p.id !== actorId).map(p => (
                  <div key={p.id} className="mf-partner-chip">{p.name}</div>
                ))}
              </div>
            )}
            <p className="mf-identity-tap">Gusa ili uendelee →</p>
          </div>
        </div>
      );
    }

    // --- ACTION: pick target ---
    if (localPhase === 'action') {
      const isActorMafia = actorRole === 'MAFIA';
      return (
        <div className={`mf-root ${isActorMafia ? 'mf-night-bg' : 'mf-placebo-bg'}`}>
          <div className="mf-action-wrapper">
            <h2 className="mf-action-title">
              {isActorMafia ? '🎯 Chagua mtu wa kushambulia' : '🤔 Unashuku nani?'}
            </h2>
            {isActorMafia && (
              <p className="mf-action-hint">Unaweza kujichagua ili kujificha (False Flag)</p>
            )}
            <div className="mf-target-grid">
              {players.filter(p => health[p.id] !== 'dead').map(p => (
                <button
                  key={p.id}
                  className={`mf-target-btn ${health[p.id] === 'wounded' ? 'wounded' : ''}`}
                  onClick={() => handleNightAction(p.id)}
                >
                  <span className="mf-target-av">{p.name.charAt(0)}</span>
                  <span className="mf-target-name">{p.name}</span>
                  {health[p.id] === 'wounded' && <span className="mf-target-wound">⚠️</span>}
                </button>
              ))}
            </div>
            {isActorMafia && (
              <button className="mf-ghost-btn mf-skip" onClick={() => handleNightAction(null)}>
                Ruka (Usishambulie)
              </button>
            )}
          </div>
        </div>
      );
    }

    // --- LOCKING IN ---
    if (localPhase === 'lockingIn') {
      return (
        <div className="mf-root mf-lockingIn-bg">
          <div className="mf-lockin-wrapper">
            <div className="mf-lockin-spinner" />
            <p className="mf-lockin-text">Inafunga…</p>
          </div>
        </div>
      );
    }

    return null;
  }

  // =============================================================================
  // PHASE: NIGHT_ONLINE
  // =============================================================================
  if (phase === 'NIGHT_ONLINE') {
    const myMafiaVote = mafiaVotes[currentPlayerId ?? ''];
    const votesNeeded = Math.ceil(mafiaAlive.length / 2);
    const voteCounts: Record<string, number> = {};
    Object.values(mafiaVotes).forEach(v => { voteCounts[v] = (voteCounts[v] ?? 0) + 1; });

    if (isMafia && !isDead) {
      return (
        <div className="mf-root mf-night-bg mf-mafia-night">
          <div className="mf-stars" aria-hidden>
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="mf-star" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 70}%`, animationDelay: `${Math.random() * 4}s` }} />
            ))}
          </div>
          <div className="mf-online-night-inner">
            <div className="mf-night-hud">
              <div className="mf-online-phase-label">🔪 MAFIA WANAFANYA KAZI</div>
              <div className="mf-night-timer">{timeLeft}s</div>
            </div>

            <div className="mf-partners-row">
              {players.filter(p => roles[p.id] === 'MAFIA').map(p => (
                <div key={p.id} className="mf-partner-badge">
                  <span>{p.name.charAt(0)}</span>
                  <span className="mf-partner-nm">{p.name}</span>
                  {mafiaVotes[p.id] && <span className="mf-partner-voted">✓</span>}
                </div>
              ))}
            </div>

            <h3 className="mf-action-title">Chagua mtu wa kushambulia ({votesNeeded} kura zinahitajika)</h3>
            <div className="mf-target-grid">
              {alivePlayers.map(p => {
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
            {myMafiaVote && <p className="mf-wait-pulse">Umepiga kura. Subiri wengine…</p>}
          </div>
        </div>
      );
    }

    // Villager screen — sensory deprivation
    return (
      <div className="mf-root mf-villager-night">
        <div className="mf-villager-night-content">
          <div className="mf-pulse-ring" />
          <div className="mf-pulse-ring delay1" />
          <div className="mf-pulse-ring delay2" />
          <h1 className="mf-senses-title">LALA USINGIZI</h1>
          <p className="mf-senses-sub">Giza linaenea mjini…</p>
          <div className="mf-night-timer-bar">
            <div className="mf-night-timer-fill" style={{ width: `${(timeLeft / 20) * 100}%` }} />
          </div>
        </div>
      </div>
    );
  }

  // =============================================================================
  // PHASE: MORNING_REVEAL
  // =============================================================================
  if (phase === 'MORNING_REVEAL') {
    const eliminated = players.find(p => p.id === eliminatedThisRound);
    const wounded = players.find(p => p.id === woundedThisRound);
    const quiet = !eliminatedThisRound && !woundedThisRound;

    return (
      <div className="mf-root mf-morning-bg">
        <div className="mf-sun-container">
          <div className="mf-sun-rays" />
          <div className="mf-sun" />
        </div>
        <div className="mf-morning-inner">
          <h1 className="mf-morning-title">ASUBUHI IMEFIKA</h1>
          {quiet && (
            <div className="mf-reveal-card quiet">
              <span className="mf-reveal-icon">🌅</span>
              <h2 className="mf-reveal-headline quiet">Usiku ulikuwa shwari</h2>
              <p className="mf-reveal-body">Hakuna aliyeathiriwa. Baraza linaanza…</p>
            </div>
          )}
          {wounded && !eliminated && (
            <div className="mf-reveal-card wounded">
              <span className="mf-reveal-icon">🩸</span>
              <h2 className="mf-reveal-headline wounded">ALISHAMBULIWA — LAKINI ALIOKOKA</h2>
              <div className="mf-reveal-player-name">{wounded.name}</div>
              <p className="mf-reveal-body wounded-body">
                {wounded.name} amejeruhiwa. Shambulio lingine litamuua.
              </p>
            </div>
          )}
          {eliminated && (
            <div className="mf-reveal-card dead">
              <span className="mf-reveal-icon">💀</span>
              <h2 className="mf-reveal-headline dead">ALIUAWA USIKU WA LEO</h2>
              <div className="mf-reveal-player-name dead">{eliminated.name}</div>
              <p className="mf-reveal-body">
                {eliminated.name} amekufa. Sababu haijulikani — hakuna atakayeambiwa nani alimuua.
              </p>
            </div>
          )}
          <p className="mf-auto-advance blink">Baraza linaanza mara moja…</p>
        </div>
      </div>
    );
  }

  // =============================================================================
  // PHASE: DAY_DISCUSS
  // =============================================================================
  if (phase === 'DAY_DISCUSS') {
    const urgent = timeLeft <= 20;
    return (
      <div className="mf-root mf-day-bg">
        <div className="mf-sun-container">
          <div className="mf-sun-rays" />
          <div className="mf-sun" />
        </div>
        <div className="mf-day-inner">
          <div className="mf-day-hud">
            <h1 className="mf-day-title">BARAZA — SIKU {roundNumber}</h1>
            <div className={`mf-day-timer ${urgent ? 'urgent' : ''}`}>{timeLeft}s</div>
          </div>

          <div className="mf-timer-track">
            <div className={`mf-timer-fill ${urgent ? 'urgent' : ''}`}
              style={{ width: `${timerPct}%` }} />
          </div>

          <p className="mf-day-instruction">Jadili. Shuku. Pambana. Kisha piga kura.</p>

          <div className="mf-alive-grid">
            {alivePlayers.map((p, i) => (
              <div key={p.id} className={`mf-alive-card ${health[p.id] === 'wounded' ? 'wounded' : ''}`}
                style={{ animationDelay: `${i * 0.06}s` }}>
                <span className="mf-alive-av">{p.name.charAt(0)}</span>
                <span className="mf-alive-name">{p.name}</span>
                {health[p.id] === 'wounded' && <span className="mf-wound-pulse">⚠️ JERUHIWA</span>}
              </div>
            ))}
          </div>

          {isHost && mode === 'local' && (
            <button className="mf-ghost-btn" onClick={() =>
              setSharedState({ phase: 'VOTE', endTime: Date.now() + VOTE_TIME * 1000 })}>
              ⏭ Ruka hadi Kura
            </button>
          )}

          {mode === 'online' && !isDead && (
            <div className="mf-chat-panel">
              <div className="mf-chat-feed">
                {chat.slice(-10).map((m, i) => {
                  const sender = players.find(p => p.id === m.playerId);
                  return (
                    <div key={i} className="mf-chat-msg">
                      <span className="mf-chat-name">{sender?.name}</span>
                      <span className="mf-chat-text">{m.text}</span>
                    </div>
                  );
                })}
              </div>
              <form className="mf-chat-form" onSubmit={sendChat}>
                <input className="mf-chat-input" placeholder="Sema kitu…"
                  value={chatInput} onChange={e => setChatInput(e.target.value)} />
                <button className="mf-chat-send" type="submit">→</button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =============================================================================
  // PHASE: VOTE
  // =============================================================================
  if (phase === 'VOTE') {
    const myVote = dayVotes[currentPlayerId ?? ''];
    const urgent = timeLeft <= 5;
    const votablePlayers = alivePlayers.filter(p => p.id !== currentPlayerId);

    return (
      <div className="mf-root mf-vote-bg">
        <div className="mf-vote-inner">
          <div className="mf-vote-hud">
            <h1 className="mf-vote-title">🗳️ KURA</h1>
            <div className={`mf-vote-timer ${urgent ? 'urgent' : ''}`}>{timeLeft}s</div>
          </div>
          <div className="mf-timer-track">
            <div className={`mf-timer-fill vote ${urgent ? 'urgent' : ''}`}
              style={{ width: `${(timeLeft / VOTE_TIME) * 100}%` }} />
          </div>

          <p className="mf-vote-instruction">
            {myVote ? `Umepiga kura kwa ${players.find(p => p.id === myVote)?.name ?? 'Skip'}. Subiri…` : 'Chagua mtu wa kufukuzwa. Una sekunde 15.'}
          </p>

          {!myVote && !isDead && (
            <div className="mf-target-grid">
              {votablePlayers.map(p => (
                <button key={p.id}
                  className={`mf-target-btn ${health[p.id] === 'wounded' ? 'wounded' : ''}`}
                  onClick={() => castDayVote(p.id)}>
                  <span className="mf-target-av">{p.name.charAt(0)}</span>
                  <span className="mf-target-name">{p.name}</span>
                  {health[p.id] === 'wounded' && <span className="mf-target-wound">⚠️</span>}
                </button>
              ))}
              <button className="mf-target-btn skip" onClick={() => castDayVote('skip')}>
                <span className="mf-target-av">—</span>
                <span className="mf-target-name">Ruka Kura</span>
              </button>
            </div>
          )}

          {isHost && mode === 'local' && (
            <button className="mf-main-btn mf-btn-red mf-resolve-btn" onClick={resolveVotes}>
              ⚖️ Tathmini Kura
            </button>
          )}
        </div>
      </div>
    );
  }

  // =============================================================================
  // PHASE: VOTE_REVEAL
  // =============================================================================
  if (phase === 'VOTE_REVEAL') {
    return (
      <div className="mf-root mf-vote-reveal-bg">
        <div className="mf-ballot-inner">
          <h1 className="mf-ballot-title">KARATASI ZA KURA</h1>
          <div className="mf-ballot-list">
            {alivePlayers.map((p, i) => {
              const vote = dayVotes[p.id];
              const votedFor = players.find(pl => pl.id === vote);
              return (
                <div key={p.id} className="mf-ballot-row" style={{ animationDelay: `${i * 0.12}s` }}>
                  <span className="mf-ballot-voter">{p.name}</span>
                  <span className="mf-ballot-arrow">→</span>
                  <span className={`mf-ballot-choice ${!vote || vote === 'skip' ? 'skip' : ''}`}>
                    {vote === 'skip' || !vote ? 'Aliruka' : votedFor?.name ?? '?'}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mf-auto-advance blink">Utekelezaji unakuja…</p>
        </div>
      </div>
    );
  }

  // =============================================================================
  // PHASE: EXECUTION
  // =============================================================================
  if (phase === 'EXECUTION') {
    const executed = players.find(p => p.id === eliminatedThisRound);
    const wasMafia = executed ? roles[executed.id] === 'MAFIA' : false;

    return (
      <div className={`mf-root ${executed ? (wasMafia ? 'mf-exec-mafia' : 'mf-exec-village') : 'mf-exec-tie'}`}>
        <div className="mf-exec-inner">
          {executed ? (
            <>
              <div className="mf-exec-shatter">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="mf-shard" style={{
                    '--angle': `${i * 45}deg`,
                    animationDelay: `${i * 0.05}s`
                  } as React.CSSProperties} />
                ))}
              </div>
              <div className="mf-exec-content">
                <span className="mf-exec-icon">{wasMafia ? '🎭' : '⚰️'}</span>
                <h1 className={`mf-exec-name ${wasMafia ? 'mafia' : 'village'}`}>{executed.name}</h1>
                <div className={`mf-exec-role-badge ${wasMafia ? 'mafia' : 'village'}`}>
                  {wasMafia ? 'ALIKUWA MAFIA' : 'ALIKUWA MWANAKIJIJI'}
                </div>
                <p className="mf-exec-flavor">
                  {wasMafia
                    ? 'Haki imefanywa. Mtu mmoja wa giza ameangushwa.'
                    : 'Kijiji kilimfukuza mtu asiye na hatia…'}
                </p>
              </div>
            </>
          ) : (
            <div className="mf-exec-content">
              <span className="mf-exec-icon">🤝</span>
              <h1 className="mf-exec-tie-title">KURA ZILILINGANA</h1>
              <p className="mf-exec-flavor">Hakuna aliyefukuzwa. Usiku unaendelea…</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =============================================================================
  // PHASE: GAME_OVER
  // =============================================================================
  if (phase === 'GAME_OVER') {
    const isVillageWin = winner === 'VILLAGERS';
    return (
      <div className={`mf-root ${isVillageWin ? 'mf-gameover-village' : 'mf-gameover-mafia'}`}>
        <div className="mf-gameover-inner">
          <div className="mf-gameover-banner">
            <span className="mf-gameover-trophy">{isVillageWin ? '☀️' : '🔪'}</span>
            <h1 className="mf-gameover-title">{isVillageWin ? 'KIJIJI KIMESHINDA!' : 'MAFIA IMESHINDA!'}</h1>
            <p className="mf-gameover-sub">
              {isVillageWin ? 'Mafia wote wamekwisha. Amani imetawala.' : 'Mafia wamechukua mji. Haukuwa na nafasi.'}
            </p>
          </div>

          <div className="mf-final-roles">
            <h2 className="mf-section-label">MAJUKUMU YA KWELI</h2>
            {players.map(p => (
              <div key={p.id} className={`mf-final-row ${health[p.id] === 'dead' ? 'dead' : ''}`}>
                <span className="mf-final-icon">{roles[p.id] === 'MAFIA' ? '🔪' : '🌾'}</span>
                <span className="mf-final-name">{p.name}</span>
                <span className={`mf-final-role ${roles[p.id] === 'MAFIA' ? 'mafia' : 'village'}`}>
                  {roles[p.id]}
                </span>
                {health[p.id] === 'dead' && <span className="mf-final-dead">MAITI</span>}
              </div>
            ))}
          </div>

          {isHost && (
            <button className="mf-main-btn mf-btn-red" onClick={resetGame}>
              CHEZA TENA 🔄
            </button>
          )}
          <a href="/" className="mf-exit">← Rudi Hub</a>
        </div>
      </div>
    );
  }

  return null;
};

export default MafiaGame;