import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useMultiplayer } from '../../context/MultiplayerContext';
import './Charades.css';

/* =========================================
   KENYAN-FLAVOURED WORD BANK
   ========================================= */
const WORD_CATEGORIES: Record<string, { words: string[]; emoji: string }> = {
  kenyan_life: {
    emoji: '🇰🇪',
    words: [
      'Matatu', 'Boda Boda', 'Mama Mboga', 'Nyama Choma', 'Ugali', 'Sukuma Wiki',
      'Chapati', 'Mandazi', 'Mutura', 'Smokies na kachumbari', 'Githeri', 'Pilau',
      'Buying Airtime', 'M-Pesa', 'Hawker in CBD', 'Traffic Jam in Nairobi',
      'Watchman Opening Gate', 'Conductor Hanging on Matatu', 'Queue at KRA',
      'Selling Mitumba', 'Fetching Water', 'Charging Phone at Neighbour\'s',
      'Landlord Knocking on 1st', 'Harambee', 'Burning Sukuma',
    ],
  },
  nairobi_vibes: {
    emoji: '🏙️',
    words: [
      'City Council Askari', 'Kanjo Running Away', 'Jua Kali Mechanic',
      'Supermarket Trolley Ride', 'ATM Queue on Friday', 'KPLC Token',
      'Matatu Touts Fighting', 'Sleeping in a Meeting', 'Photocopy Guy',
      'Speed Bump on Thika Rd', 'Nairobians Complaining about Rain',
      'KDF Soldier Standing Guard', 'Nairobi Night Runner',
    ],
  },
  kenyan_icons: {
    emoji: '⭐',
    words: [
      'Lupita Nyong\'o', 'Sauti Sol', 'Khaligraph Jones', 'Bien',
      'Churchill Show', 'Eric Omondi', 'Njugush', 'Kamene Goro',
      'Azziad Dancing', 'Otile Brown Singing', 'David Rudisha Running',
      'Eliud Kipchoge Marathon', 'Wanjiru Kamau', 'Gengetone Artist',
    ],
  },
  movies_tv: {
    emoji: '🎬',
    words: [
      'Squid Game', 'Black Panther', 'Avengers', 'Money Heist', 'Naruto',
      'One Piece', 'Fast & Furious', 'Spider-Man', 'Titanic', 'Inception',
      'The Lion King', 'Breaking Bad', 'Game of Thrones',
      'Stranger Things', 'Prison Break', 'Power', 'Suits',
    ],
  },
  actions: {
    emoji: '🏃',
    words: [
      'Doing the Gwara Gwara', 'Twerking at a Party', 'Playing FIFA',
      'Texting While Crossing Road', 'Taking a Selfie', 'Sleeping in Church',
      'Doing Push-ups', 'Swimming', 'Riding a Bicycle', 'Playing Guitar',
      'Eating Ugali with Hands', 'Crossing Busy Nairobi Road',
      'Jump Rope', 'Boxing', 'Dancing Genge at a Wedding',
      'Proposing in a Restaurant', 'Taking a Cab selfie',
    ],
  },
  animals: {
    emoji: '🦁',
    words: [
      'Lion', 'Elephant', 'Giraffe', 'Cheetah', 'Rhino', 'Hippo',
      'Crocodile', 'Flamingo at Lake Nakuru', 'Wildebeest Migration',
      'Hyena', 'Gorilla', 'Penguin', 'Octopus', 'Monkey Stealing Food',
    ],
  },
  sports: {
    emoji: '⚽',
    words: [
      'Gor Mahia Fan Celebrating', 'AFC Leopards Derby', 'Safari Rally Driver',
      'Rugby Sevens Try', 'Harambee Stars Penalty Miss', 'Marathon Runner Finishing',
      'Volleyball Block', 'Basketball Dunk', 'Boxing KO', 'Table Tennis Smash',
    ],
  },
  emotions: {
    emoji: '😂',
    words: [
      'Embarrassed in Public', 'Jealous of a Friend', 'Proud of your Child',
      'Confused in an Exam', 'Scared of a Dog', 'Excited about Salary',
      'In Love', 'Heartbroken', 'Bored in a Meeting',
      'Nervous Before Interview', 'Happy when KPLC Returns Power',
    ],
  },
};

const ALL_WORDS = Object.values(WORD_CATEGORIES).flatMap(c => c.words);

const shuffleArray = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const getRandomWord = (used: Set<string>): string => {
  const available = ALL_WORDS.filter(w => !used.has(w));
  const pool = available.length > 0 ? available : ALL_WORDS;
  return pool[Math.floor(Math.random() * pool.length)];
};

const getCategoryEmoji = (word: string): string => {
  for (const [, cat] of Object.entries(WORD_CATEGORIES)) {
    if (cat.words.includes(word)) return cat.emoji;
  }
  return '🎭';
};

/* =========================================
   TYPES
   ========================================= */
type Phase = 'LOBBY' | 'HUDDLE' | 'GET_READY' | 'PLAYING' | 'ROUND_END' | 'FINAL_SCORE';
type Team = 'red' | 'blue';

interface Player {
  id: string;
  name: string;
  isHost?: boolean;
  team?: Team;
}

interface WordRecord {
  word: string;
  result: 'correct' | 'skip';
  actorId: string;
  guesserName?: string;
}

interface OnlineGuess {
  playerId: string;
  playerName: string;
  text: string;
  correct: boolean;
  ts: number;
}

interface StuckVote { playerId: string; }

interface SharedState {
  phase: Phase;
  endTime: number;
  teamScores: { red: number; blue: number };
  currentTeam: Team;
  actorIndex: number;
  playerScores: Record<string, number>;
  actorPoints: Record<string, number>;
  sharpPoints: Record<string, number>;
  onlineActorId: string | null;
  onlineGuesses: OnlineGuess[];
  stuckVotes: StuckVote[];
  currentWord: string;
  wordHistory: WordRecord[];
  roundNumber: number;
  totalRounds: number;
  skipLocked: boolean;
  skipLockUntil: number;
  activePlayerId: string | null;
}

const ROUND_DURATION = 60;
const SKIP_PENALTY_MS = 2000;
const ONLINE_GUESSER_PTS = 100;
const ONLINE_ACTOR_PTS = 50;
const ONLINE_PASS_PEN = 50;
const ONLINE_MUTINY_PEN = 50;

/* =========================================
   COMPONENT
   ========================================= */
const CharadesGame: React.FC = () => {
  const { players, sharedState, setSharedState, isHost, currentPlayerId, mode } =
    useMultiplayer() as unknown as {
      players: Player[];
      sharedState: Partial<SharedState> | null;
      setSharedState: (s: Partial<SharedState>) => Promise<void>;
      isHost: boolean;
      currentPlayerId: string | null;
      mode: 'local' | 'online';
    };

  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [skipCountdown, setSkipCountdown] = useState(0);
  const [wordAnim, setWordAnim] = useState<'idle' | 'correct' | 'skip' | 'locked'>('idle');
  const [guessInput, setGuessInput] = useState('');
  const [tiltEnabled, setTiltEnabled] = useState(false);
  const [tiltAsked, setTiltAsked] = useState(false);
  const tiltCooldown = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtx = useRef<AudioContext | null>(null);

  const s = (sharedState ?? {}) as Partial<SharedState>;
  const phase = s.phase ?? 'LOBBY';
  const endTime = s.endTime ?? 0;
  const teamScores = s.teamScores ?? { red: 0, blue: 0 };
  const currentTeam = s.currentTeam ?? 'red';
  const actorIndex = s.actorIndex ?? 0;
  const playerScores = s.playerScores ?? {};
  const actorPoints = s.actorPoints ?? {};
  const sharpPoints = s.sharpPoints ?? {};
  const onlineActorId = s.onlineActorId ?? null;
  const onlineGuesses = s.onlineGuesses ?? [];
  const stuckVotes = s.stuckVotes ?? [];
  const currentWord = s.currentWord ?? '';
  const wordHistory = s.wordHistory ?? [];
  const roundNumber = s.roundNumber ?? 1;
  const totalRounds = s.totalRounds ?? 4;
  const skipLocked = s.skipLocked ?? false;
  const skipLockUntil = s.skipLockUntil ?? 0;
  const activePlayerId = s.activePlayerId ?? null;

  const isActor = mode === 'local' ? true : currentPlayerId === onlineActorId;
  const currentActorId = mode === 'local' ? activePlayerId : onlineActorId;
  const actorName = players.find(p => p.id === currentActorId)?.name ?? 'Someone';
  const myScore = playerScores[currentPlayerId ?? ''] ?? 0;
  const guesserCount = mode === 'online' ? players.filter(p => p.id !== onlineActorId).length : 0;
  const mutinyThreshold = Math.max(2, Math.ceil(guesserCount / 2));
  const iHaveVotedStuck = stuckVotes.some(v => v.playerId === currentPlayerId);

  /* --------- Audio --------- */
  const playTone = useCallback((type: 'correct' | 'skip' | 'mutiny' | 'tick') => {
    try {
      if (!audioCtx.current) audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtx.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      if (type === 'correct') {
        osc.frequency.setValueAtTime(523, ctx.currentTime);
        osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5);
      } else if (type === 'skip') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, ctx.currentTime);
        osc.frequency.setValueAtTime(100, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.45);
      } else if (type === 'mutiny') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.setValueAtTime(160, ctx.currentTime + 0.2);
        osc.frequency.setValueAtTime(130, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.65);
      } else if (type === 'tick') {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.06);
      }
    } catch (_) {}
  }, []);

  const vibrate = (p: number | number[]) => { try { navigator.vibrate(p); } catch (_) {} };

  /* --------- Tilt --------- */
  const requestTilt = async () => {
    setTiltAsked(true);
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      const res = await (DeviceOrientationEvent as any).requestPermission().catch(() => 'denied');
      if (res === 'granted') setTiltEnabled(true);
    } else {
      setTiltEnabled(true);
    }
  };

  useEffect(() => {
    if (!tiltEnabled || phase !== 'PLAYING' || mode !== 'local') return;
    const handler = (e: DeviceOrientationEvent) => {
      if (tiltCooldown.current) return;
      const beta = e.beta ?? 0;
      if (beta > 55) {
        tiltCooldown.current = true;
        handleCorrect();
        setTimeout(() => { tiltCooldown.current = false; }, 900);
      } else if (beta < -35) {
        tiltCooldown.current = true;
        handleSkip();
        setTimeout(() => { tiltCooldown.current = false; }, 2600);
      }
    };
    window.addEventListener('deviceorientation', handler);
    return () => window.removeEventListener('deviceorientation', handler);
  }, [tiltEnabled, phase, mode]);

  /* --------- Timer --------- */
  useEffect(() => {
    if (phase !== 'PLAYING' && phase !== 'GET_READY') return;
    timerRef.current = setInterval(() => {
      const rem = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setTimeLeft(rem);
      if (rem <= 5 && rem > 0) playTone('tick');
      if (rem === 0) {
        clearInterval(timerRef.current!);
        if (isHost || mode === 'local') {
          if (phase === 'GET_READY') {
            setSharedState({ phase: 'PLAYING', endTime: Date.now() + ROUND_DURATION * 1000 });
          } else {
            setSharedState({ phase: 'ROUND_END' });
          }
        }
      }
    }, 100);
    return () => clearInterval(timerRef.current!);
  }, [phase, endTime]);

  useEffect(() => {
    if (!skipLocked) return;
    const iv = setInterval(() => {
      const rem = Math.max(0, Math.ceil((skipLockUntil - Date.now()) / 1000));
      setSkipCountdown(rem);
      if (rem === 0) {
        clearInterval(iv);
        if (isHost || mode === 'local') setSharedState({ skipLocked: false, skipLockUntil: 0 });
      }
    }, 100);
    return () => clearInterval(iv);
  }, [skipLocked, skipLockUntil]);

  /* =========================================
     ACTIONS
     ========================================= */
  const createTeams = async () => {
    const shuffled = shuffleArray([...players]);
    const half = Math.ceil(shuffled.length / 2);
    // Tag players with teams
    const withTeams = shuffled.map((p, i) => ({ ...p, team: (i < half ? 'red' : 'blue') as Team }));
    const redActor = withTeams.filter(p => p.team === 'red')[0];
    const rounds = Math.min(players.length * 2, 8);
    await setSharedState({
      phase: 'HUDDLE',
      teamScores: { red: 0, blue: 0 },
      currentTeam: 'red',
      actorIndex: 0,
      activePlayerId: redActor.id,
      roundNumber: 1,
      totalRounds: rounds,
      wordHistory: [],
    });
  };

  const startOnlineGame = async () => {
    const firstActor = players[Math.floor(Math.random() * players.length)];
    await setSharedState({
      phase: 'GET_READY',
      onlineActorId: firstActor.id,
      currentWord: getRandomWord(new Set()),
      endTime: Date.now() + 5000,
      playerScores: Object.fromEntries(players.map(p => [p.id, 0])),
      actorPoints: {},
      sharpPoints: {},
      onlineGuesses: [],
      stuckVotes: [],
      wordHistory: [],
      roundNumber: 1,
      totalRounds: players.length,
    });
  };

  const handleCorrect = useCallback(async () => {
    if (phase !== 'PLAYING') return;
    const word = currentWord;
    playTone('correct');
    vibrate([80, 40, 80]);
    setWordAnim('correct');
    setTimeout(() => setWordAnim('idle'), 500);
    const rec: WordRecord = { word, result: 'correct', actorId: currentActorId ?? '' };
    const nextWord = getRandomWord(new Set([...wordHistory.map(w => w.word), word]));
    if (mode === 'local') {
      await setSharedState({
        teamScores: { ...teamScores, [currentTeam]: teamScores[currentTeam] + 1 },
        currentWord: nextWord,
        wordHistory: [...wordHistory, rec],
      });
    }
  }, [phase, currentWord, wordHistory, teamScores, currentTeam, mode, currentActorId]);

  const handleSkip = useCallback(async () => {
    if (phase !== 'PLAYING' || skipLocked) return;
    const word = currentWord;
    playTone('skip');
    vibrate([250]);
    setWordAnim('locked');
    setTimeout(() => setWordAnim('idle'), 2100);
    const rec: WordRecord = { word, result: 'skip', actorId: currentActorId ?? '' };
    const nextWord = getRandomWord(new Set([...wordHistory.map(w => w.word), word]));
    await setSharedState({
      currentWord: nextWord,
      wordHistory: [...wordHistory, rec],
      skipLocked: true,
      skipLockUntil: Date.now() + SKIP_PENALTY_MS,
    });
  }, [phase, currentWord, wordHistory, skipLocked, currentActorId]);

  const handleOnlinePass = useCallback(async () => {
    if (phase !== 'PLAYING' || !isActor) return;
    const word = currentWord;
    playTone('skip');
    vibrate([200]);
    setWordAnim('skip');
    setTimeout(() => setWordAnim('idle'), 400);
    const newScores = { ...playerScores };
    if (onlineActorId) newScores[onlineActorId] = Math.max(0, (newScores[onlineActorId] ?? 0) - ONLINE_PASS_PEN);
    const nextWord = getRandomWord(new Set([...wordHistory.map(w => w.word), word]));
    await setSharedState({
      currentWord: nextWord,
      wordHistory: [...wordHistory, { word, result: 'skip', actorId: onlineActorId ?? '' }],
      playerScores: newScores,
      onlineGuesses: [],
      stuckVotes: [],
    });
  }, [phase, isActor, currentWord, wordHistory, playerScores, onlineActorId]);

  const handleGuessSubmit = useCallback(async () => {
    if (!guessInput.trim() || !currentPlayerId || phase !== 'PLAYING') return;
    const text = guessInput.trim();
    const correct = text.toLowerCase() === currentWord.toLowerCase();
    const myName = players.find(p => p.id === currentPlayerId)?.name ?? 'Player';
    setGuessInput('');
    if (correct) {
      const newScores = { ...playerScores };
      newScores[currentPlayerId] = (newScores[currentPlayerId] ?? 0) + ONLINE_GUESSER_PTS;
      if (onlineActorId) newScores[onlineActorId] = (newScores[onlineActorId] ?? 0) + ONLINE_ACTOR_PTS;
      const newActorPts = { ...actorPoints };
      if (onlineActorId) newActorPts[onlineActorId] = (newActorPts[onlineActorId] ?? 0) + ONLINE_ACTOR_PTS;
      const newSharpPts = { ...sharpPoints };
      newSharpPts[currentPlayerId] = (newSharpPts[currentPlayerId] ?? 0) + 1;
      const nextWord = getRandomWord(new Set([...wordHistory.map(w => w.word), currentWord]));
      playTone('correct');
      vibrate([80, 40, 80]);
      setWordAnim('correct');
      setTimeout(() => setWordAnim('idle'), 500);
      await setSharedState({
        currentWord: nextWord,
        wordHistory: [...wordHistory, { word: currentWord, result: 'correct', actorId: onlineActorId ?? '', guesserName: myName }],
        playerScores: newScores,
        actorPoints: newActorPts,
        sharpPoints: newSharpPts,
        onlineGuesses: [],
        stuckVotes: [],
      });
    } else {
      await setSharedState({ onlineGuesses: [...onlineGuesses, { playerId: currentPlayerId, playerName: myName, text, correct: false, ts: Date.now() }] });
    }
  }, [guessInput, currentPlayerId, phase, currentWord, players, onlineGuesses, playerScores, actorPoints, sharpPoints, wordHistory, onlineActorId]);

  const handleStuck = async () => {
    if (!currentPlayerId || iHaveVotedStuck || isActor) return;
    const newVotes = [...stuckVotes, { playerId: currentPlayerId }];
    if (newVotes.length >= mutinyThreshold) {
      playTone('mutiny');
      vibrate([300, 100, 300]);
      const newScores = { ...playerScores };
      if (onlineActorId) newScores[onlineActorId] = Math.max(0, (newScores[onlineActorId] ?? 0) - ONLINE_MUTINY_PEN);
      const nextWord = getRandomWord(new Set([...wordHistory.map(w => w.word), currentWord]));
      await setSharedState({
        currentWord: nextWord,
        wordHistory: [...wordHistory, { word: currentWord, result: 'skip', actorId: onlineActorId ?? '' }],
        playerScores: newScores,
        onlineGuesses: [],
        stuckVotes: [],
      });
    } else {
      await setSharedState({ stuckVotes: newVotes });
    }
  };

  const nextRound = async () => {
    const next = actorIndex + 1;
    if (next >= totalRounds) { await setSharedState({ phase: 'FINAL_SCORE' }); return; }
    const nextTeam: Team = next % 2 === 0 ? 'red' : 'blue';
    const teamPlayers = players.filter(p => p.team === nextTeam);
    const nextActor = teamPlayers[Math.floor(Math.random() * Math.max(1, teamPlayers.length))];
    await setSharedState({
      phase: 'HUDDLE',
      actorIndex: next,
      currentTeam: nextTeam,
      activePlayerId: nextActor?.id ?? players[0].id,
      currentWord: getRandomWord(new Set(wordHistory.map(w => w.word))),
      roundNumber: roundNumber + 1,
    });
  };

  const nextOnlineRound = async () => {
    const idx = players.findIndex(p => p.id === onlineActorId);
    const nextIdx = (idx + 1) % players.length;
    const newRound = roundNumber + 1;
    if (newRound > totalRounds) { await setSharedState({ phase: 'FINAL_SCORE' }); return; }
    await setSharedState({
      phase: 'GET_READY',
      onlineActorId: players[nextIdx].id,
      currentWord: getRandomWord(new Set(wordHistory.map(w => w.word))),
      endTime: Date.now() + 5000,
      roundNumber: newRound,
      onlineGuesses: [],
      stuckVotes: [],
    });
  };

  /* =========================================
     RENDERS
     ========================================= */
  if (players.length === 0) {
    return (
      <div className="cr-root">
        <div className="cr-center-card">
          <span className="cr-icon-xl">🎭</span>
          <p className="cr-no-players-msg">Enter through the Lobby first</p>
          <a href="/lobby?game=charades" className="cr-ghost-btn">Go to Lobby</a>
        </div>
      </div>
    );
  }

  /* ---- LOBBY ---- */
  if (phase === 'LOBBY') return (
    <div className="cr-root cr-lobby">
      <div className="cr-lobby-glow cr-glow-red" />
      <div className="cr-lobby-glow cr-glow-blue" />
      <div className="cr-lobby-inner">
        <div className="cr-logo-block">
          <span className="cr-logo-icon">🎭</span>
          <h1 className="cr-logo-title">CHARADES</h1>
          <p className="cr-logo-sub">Room Thirty7 Edition · {mode === 'local' ? '📱 One Device' : '🌐 Online'}</p>
        </div>
        <div className="cr-player-grid">
          {players.map((p, i) => (
            <div key={p.id} className={`cr-player-chip ${p.isHost ? 'host' : ''}`} style={{ animationDelay: `${i * 0.06}s` }}>
              <span className="cr-chip-av">{p.name.charAt(0).toUpperCase()}</span>
              <span className="cr-chip-name">{p.name}</span>
              {p.isHost && <span className="cr-chip-crown">👑</span>}
            </div>
          ))}
        </div>
        {(isHost || mode === 'local') ? (
          mode === 'local' ? (
            <button className="cr-main-btn cr-btn-red" onClick={createTeams}>
              Create Teams &amp; Start
              <span className="cr-btn-hint">{players.length} players → 2 teams</span>
            </button>
          ) : (
            <button className="cr-main-btn cr-btn-blue" onClick={startOnlineGame}>
              Start Online Game
              <span className="cr-btn-hint">{players.length} players · Free for all</span>
            </button>
          )
        ) : (
          <p className="cr-wait-pulse">Waiting for host to start…</p>
        )}
        <a href="/" className="cr-exit">← Back to Hub</a>
      </div>
    </div>
  );

  /* ---- HUDDLE ---- */
  if (phase === 'HUDDLE') {
    const actor = players.find(p => p.id === activePlayerId);
    return (
      <div className={`cr-root cr-huddle cr-bg-${currentTeam}`}>
        <div className="cr-huddle-inner">
          <div className={`cr-team-flag cr-flag-${currentTeam}`}>TEAM {currentTeam.toUpperCase()}</div>
          <div className="cr-score-row">
            <div className={`cr-score-pill cr-score-red ${currentTeam === 'red' ? 'active' : ''}`}>
              🔴 <strong>{teamScores.red}</strong>
            </div>
            <span className="cr-score-vs">vs</span>
            <div className={`cr-score-pill cr-score-blue ${currentTeam === 'blue' ? 'active' : ''}`}>
              <strong>{teamScores.blue}</strong> 🔵
            </div>
          </div>
          <div className="cr-spotlight">
            <div className="cr-spotlight-avatar">{actor?.name?.charAt(0).toUpperCase()}</div>
            <h2 className="cr-spotlight-name">{actor?.name}</h2>
            <p className="cr-spotlight-sub">is acting this round!</p>
          </div>
          <p className="cr-round-info">Round {roundNumber} of {totalRounds}</p>
          {(isHost || mode === 'local') && (
            <button
              className={`cr-main-btn cr-btn-${currentTeam}`}
              onClick={() => setSharedState({
                phase: 'GET_READY',
                currentWord: getRandomWord(new Set(wordHistory.map(w => w.word))),
                endTime: Date.now() + 5000,
                skipLocked: false,
                skipLockUntil: 0,
              })}
            >
              Actor, Take the Phone
              <span className="cr-btn-hint">3-second countdown starts</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ---- GET READY ---- */
  if (phase === 'GET_READY') {
    const countdownNum = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
    return (
      <div className={`cr-root cr-getready cr-bg-${mode === 'local' ? currentTeam : 'online'}`}>
        <div className="cr-getready-inner">
          {mode === 'local' ? (
            <>
              <p className="cr-getready-title">Put phone on your forehead</p>
              <div className="cr-phone-diagram">
                <span className="cr-pd-phone">📱</span>
                <span className="cr-pd-arrow">⬆️</span>
                <span className="cr-pd-label">forehead</span>
              </div>
            </>
          ) : (
            <p className="cr-getready-title">
              {isActor ? "You're Acting!" : `Watch ${actorName}!`}
            </p>
          )}
          <div className="cr-countdown-ring">
            <span className="cr-countdown-num">{countdownNum}</span>
          </div>
          {mode === 'local' && (
            <button className="cr-main-btn cr-btn-white" onClick={() =>
              setSharedState({ phase: 'PLAYING', endTime: Date.now() + ROUND_DURATION * 1000, skipLocked: false })
            }>
              I'm Ready — GO!
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ---- PLAYING ---- */
  if (phase === 'PLAYING') {
    const pct = (timeLeft / ROUND_DURATION) * 100;
    const urgent = timeLeft <= 10;
    const catEmoji = getCategoryEmoji(currentWord);

    if (mode === 'local') {
      return (
        <div className={`cr-root cr-playing cr-bg-${currentTeam}`}>
          {/* Progress bar */}
          <div className="cr-progress-track">
            <div className={`cr-progress-fill ${urgent ? 'urgent' : ''}`} style={{ width: `${pct}%` }} />
          </div>
          {/* HUD */}
          <div className="cr-hud">
            <div className={`cr-hud-time ${urgent ? 'panic' : ''}`}>{timeLeft}s</div>
            <div className="cr-hud-scores">
              <span className={`cr-hud-team red ${currentTeam === 'red' ? 'active' : ''}`}>{teamScores.red}</span>
              <span className="cr-hud-dot">·</span>
              <span className={`cr-hud-team blue ${currentTeam === 'blue' ? 'active' : ''}`}>{teamScores.blue}</span>
            </div>
          </div>
          {/* Word */}
          <div className="cr-word-stage">
            <div className="cr-word-cat">{catEmoji}</div>
            <div className={`cr-word-card cr-wc-${wordAnim}`}>
              <p className="cr-word-text">{currentWord}</p>
            </div>
            {skipLocked && (
              <div className="cr-skip-lock-badge">
                <span>🔒 LOCKED {skipCountdown}s</span>
              </div>
            )}
            {wordHistory.length > 0 && (
              <div className="cr-trail">
                {wordHistory.slice(-6).map((w, i) => (
                  <span key={i} className={`cr-trail-chip cr-chip-${w.result}`}>
                    {w.result === 'correct' ? '✓' : '✗'} {w.word}
                  </span>
                ))}
              </div>
            )}
          </div>
          {/* Tilt permission (iOS) */}
          {!tiltAsked && (
            <button className="cr-tilt-btn" onClick={requestTilt}>Enable Tilt Controls</button>
          )}
          {tiltEnabled && <p className="cr-tilt-hint">Tilt ↓ = Got It &nbsp;·&nbsp; Tilt ↑ = Pass</p>}
          {/* Action split */}
          <div className="cr-split">
            <button className={`cr-split-half cr-split-skip ${skipLocked ? 'locked' : ''}`} onClick={handleSkip} disabled={skipLocked}>
              <span className="cr-split-icon">⏭</span>
              <span className="cr-split-label">PASS</span>
              {skipLocked && <span className="cr-split-sub">🔒 {skipCountdown}s</span>}
            </button>
            <button className="cr-split-half cr-split-correct" onClick={handleCorrect}>
              <span className="cr-split-icon">✅</span>
              <span className="cr-split-label">GOT IT</span>
            </button>
          </div>
        </div>
      );
    }

    // Online
    return (
      <div className="cr-root cr-playing cr-bg-online">
        <div className="cr-progress-track">
          <div className={`cr-progress-fill ${urgent ? 'urgent' : ''}`} style={{ width: `${pct}%` }} />
        </div>
        <div className="cr-hud">
          <div className={`cr-hud-time ${urgent ? 'panic' : ''}`}>{timeLeft}s</div>
          <div className="cr-hud-online-score">
            <span className="cr-hud-you">You</span>
            <span className="cr-hud-pts">{myScore} pts</span>
          </div>
        </div>
        {isActor ? (
          <div className="cr-online-actor-view">
            <p className="cr-actor-badge">🎭 You're Acting</p>
            <div className={`cr-word-card cr-wc-${wordAnim}`}>
              <div className="cr-word-cat">{catEmoji}</div>
              <p className="cr-word-text">{currentWord}</p>
            </div>
            <button className="cr-pass-online-btn" onClick={handleOnlinePass}>
              Pass <span className="cr-penalty">−{ONLINE_PASS_PEN} pts</span>
            </button>
            {wordHistory.length > 0 && (
              <div className="cr-trail">
                {wordHistory.slice(-5).map((w, i) => (
                  <span key={i} className={`cr-trail-chip cr-chip-${w.result}`}>
                    {w.result === 'correct' ? `✓ ${w.word}` : `✗ ${w.word}`}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="cr-online-guesser-view">
            <div className="cr-watch-banner">
              <span className="cr-watch-name">{actorName}</span> is acting — type fast!
            </div>
            <div className="cr-guess-feed">
              {onlineGuesses.slice(-8).map((g, i) => (
                <div key={i} className="cr-guess-bubble">
                  <span className="cr-gb-name">{g.playerName}</span>
                  <span className="cr-gb-text">{g.text}</span>
                </div>
              ))}
            </div>
            <div className="cr-guess-row">
              <input
                className="cr-guess-input"
                type="text"
                placeholder="Your guess…"
                value={guessInput}
                onChange={e => setGuessInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGuessSubmit()}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
              />
              <button className="cr-guess-send" onClick={handleGuessSubmit}>→</button>
            </div>
            <button
              className={`cr-stuck-btn ${iHaveVotedStuck ? 'voted' : ''}`}
              onClick={handleStuck}
              disabled={iHaveVotedStuck}
            >
              😤 Stuck! ({stuckVotes.length}/{mutinyThreshold})
            </button>
            {stuckVotes.length >= mutinyThreshold - 1 && stuckVotes.length > 0 && (
              <p className="cr-mutiny-warn">⚠️ Mutiny almost triggered…</p>
            )}
          </div>
        )}
      </div>
    );
  }

  /* ---- ROUND END ---- */
  if (phase === 'ROUND_END') {
    const roundCorrect = wordHistory.filter(w => w.result === 'correct' && w.actorId === currentActorId).length;
    return (
      <div className={`cr-root cr-roundend cr-bg-${mode === 'local' ? currentTeam : 'online'}`}>
        <div className="cr-roundend-inner">
          <h1 className="cr-roundend-title">Round Over!</h1>
          <div className={`cr-score-ring cr-ring-${mode === 'local' ? currentTeam : 'online'}`}>
            <span className="cr-ring-num">{roundCorrect}</span>
            <span className="cr-ring-label">this round</span>
          </div>
          {mode === 'local' && (
            <div className="cr-totals-row">
              <div className={`cr-total-pill red ${currentTeam === 'red' ? 'lit' : ''}`}>🔴 {teamScores.red}</div>
              <span className="cr-total-vs">vs</span>
              <div className={`cr-total-pill blue ${currentTeam === 'blue' ? 'lit' : ''}`}>{teamScores.blue} 🔵</div>
            </div>
          )}
          <div className="cr-recap">
            {wordHistory.slice(-12).map((w, i) => (
              <span key={i} className={`cr-recap-chip cr-chip-${w.result}`}>
                {w.result === 'correct' ? '✓' : '✗'} {w.word}
              </span>
            ))}
          </div>
          {(isHost || mode === 'local') && (
            <button className="cr-main-btn cr-btn-white"
              onClick={mode === 'local' ? nextRound : nextOnlineRound}>
              {actorIndex + 1 >= totalRounds ? 'See Final Score 🏆' : 'Next Team\'s Turn →'}
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ---- FINAL SCORE ---- */
  if (phase === 'FINAL_SCORE') {
    if (mode === 'local') {
      const winner = teamScores.red > teamScores.blue ? 'red' : teamScores.blue > teamScores.red ? 'blue' : 'tie';
      return (
        <div className={`cr-root cr-final cr-bg-${winner !== 'tie' ? winner : 'online'}`}>
          <div className="cr-final-inner">
            <h1 className="cr-final-title">GAME OVER</h1>
            <div className="cr-winner-block">
              <span className="cr-winner-trophy">{winner !== 'tie' ? '🏆' : '🤝'}</span>
              <span className="cr-winner-text">
                {winner !== 'tie' ? `TEAM ${winner.toUpperCase()} WINS!` : "IT'S A TIE!"}
              </span>
            </div>
            <div className="cr-final-scores">
              <div className={`cr-final-team red ${winner === 'red' ? 'champ' : ''}`}>
                🔴 Team Red<br /><strong>{teamScores.red}</strong><br /><small>pts</small>
              </div>
              <div className={`cr-final-team blue ${winner === 'blue' ? 'champ' : ''}`}>
                🔵 Team Blue<br /><strong>{teamScores.blue}</strong><br /><small>pts</small>
              </div>
            </div>
            <button className="cr-main-btn cr-btn-white"
              onClick={() => setSharedState({ phase: 'LOBBY', teamScores: { red: 0, blue: 0 }, wordHistory: [] })}>
              Play Again
            </button>
            <a href="/" className="cr-exit">← Back to Hub</a>
          </div>
        </div>
      );
    }

    // Online leaderboard
    const sorted = Object.entries(playerScores)
      .map(([id, score]) => ({ id, name: players.find(p => p.id === id)?.name ?? id, score }))
      .sort((a, b) => b.score - a.score);
    const bestActorId = Object.entries(actorPoints).sort((a, b) => b[1] - a[1])[0]?.[0];
    const sharpId = Object.entries(sharpPoints).sort((a, b) => b[1] - a[1])[0]?.[0];

    return (
      <div className="cr-root cr-final cr-bg-online">
        <div className="cr-final-inner">
          <h1 className="cr-final-title">FINAL RESULTS</h1>
          <div className="cr-leaderboard">
            {sorted.map((p, i) => (
              <div key={p.id} className={`cr-lb-row cr-lb-${i < 3 ? ['gold', 'silver', 'bronze'][i] : 'plain'}`}>
                <span className="cr-lb-rank">{['🥇', '🥈', '🥉'][i] ?? `#${i + 1}`}</span>
                <span className="cr-lb-name">{p.name}</span>
                <span className="cr-lb-pts">{p.score}</span>
              </div>
            ))}
          </div>
          <div className="cr-awards">
            <h2 className="cr-awards-title">🏅 Special Awards</h2>
            <div className="cr-award-card cr-award-actor">
              <span className="cr-award-icon">🎭</span>
              <span className="cr-award-label">Best Actor</span>
              <span className="cr-award-name">{players.find(p => p.id === bestActorId)?.name ?? '—'}</span>
            </div>
            <div className="cr-award-card cr-award-sharp">
              <span className="cr-award-icon">⚡</span>
              <span className="cr-award-label">Sharpest Mind</span>
              <span className="cr-award-name">{players.find(p => p.id === sharpId)?.name ?? '—'}</span>
            </div>
          </div>
          <button className="cr-main-btn cr-btn-blue"
            onClick={() => setSharedState({ phase: 'LOBBY', playerScores: {}, wordHistory: [] })}>
            Play Again
          </button>
          <a href="/" className="cr-exit">← Back to Hub</a>
        </div>
      </div>
    );
  }

  return null;
};

export default CharadesGame;