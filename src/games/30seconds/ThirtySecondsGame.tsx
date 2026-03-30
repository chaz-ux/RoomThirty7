import React, { useState, useEffect, useRef, useCallback } from 'react';
import Matter from 'matter-js';
import { useMultiplayer } from '../../context/MultiplayerContext';
import './ThirtySeconds.css';

// ─────────────────────────────────────────────────────────────
//  30 SECONDS — ROOM 37
//
//  Real 30 Seconds rules:
//  • 2 teams. Team A describes, Team B guesses + monitors clock.
//  • 30 seconds. Describe 5 words without saying the word.
//  • After time: Team B gets a STEAL on any words Team A missed.
//  • Teams alternate. First to 30 points wins.
//
//  Physics: Matter.js powers word cards — correct guesses
//  explode off screen, skipped ones fall and crumple.
// ─────────────────────────────────────────────────────────────

// ── Word cards ─────────────────────────────────────────────────
const CARDS: string[][] = [
  // Kenyan culture & people
  ['Matatu', 'Nyama Choma', 'M-Pesa', 'Harambee', 'Kanjo'],
  ['Ugali', 'Boda Boda', 'Kibera', 'Sukuma Wiki', 'Jua Kali'],
  ['Maasai Mara', 'Lake Nakuru', 'Mutura', 'Westlands', 'Mandazi'],
  ['Sauti Sol', 'Khaligraph', 'Lupita Nyong\'o', 'Eric Omondi', 'Akothee'],
  ['Churchill Show', 'Bien', 'Trio Mio', 'Nairobi', 'Uhuru Park'],
  ['Pilau', 'Githeri', 'Chapati', 'Matumbo', 'Wali wa Nazi'],

  // African celebs & culture
  ['Burna Boy', 'Wizkid', 'Davido', 'Tiwa Savage', 'Diamond Platnumba'],
  ['Amapiano', 'Afrobeats', 'Bongo', 'Genge', 'Kapuka'],
  ['Nollywood', 'BBNaija', 'Afcon', 'Harambee Stars', 'Gor Mahia'],

  // Global pop culture
  ['Eiffel Tower', 'Banana', 'Superman', 'Pizza', 'Dinosaur'],
  ['Harry Potter', 'Guitar', 'Snowman', 'Coffee', 'Tornado'],
  ['Oxygen', 'Moon', 'Vampire', 'Swimming', 'Chocolate'],
  ['Netflix', 'Kangaroo', 'Sushi', 'Pyramid', 'Helicopter'],
  ['Instagram', 'Football', 'Shark', 'Rainbow', 'Earthquake'],
  ['Astronaut', 'Submarine', 'Roller coaster', 'Solar eclipse', 'Waterfall'],
  ['Beyoncé', 'Ronaldo', 'Elon Musk', 'Obama', 'Oprah'],
  ['McDonald\'s', 'TikTok', 'YouTube', 'WhatsApp', 'Uber'],
  ['Tsunami', 'Igloo', 'Bulldozer', 'Quicksand', 'Mirage'],
  ['Bluetooth', 'Vaccine', 'Democracy', 'Inflation', 'Algorithm'],
  ['Photosynthesis', 'Gravity', 'Evolution', 'Black hole', 'DNA'],
];

const WINNING_SCORE = 30;

type Phase =
  | 'SETUP'        // choose teams
  | 'LOBBY'        // waiting to start round
  | 'GET_READY'    // 3s countdown
  | 'PLAYING'      // 30s describe
  | 'STEAL'        // opposing team steal attempt
  | 'ROUND_SCORE'  // show round result
  | 'GAME_OVER';   // someone hit 30

interface Team { name: string; playerIds: string[]; score: number; }

interface SharedState {
  phase: Phase;
  teams: Team[];
  describingTeamIdx: number;  // 0 or 1
  currentCard: string[];
  cardIndex: number;
  guessed: number[];          // indices guessed by describing team
  stolen: number[];           // indices stolen by opposing team
  endTime: number;
  roundScoreA: number;        // points this round for describer team
  roundScoreB: number;        // points this round for steal team
}

// ── Physics word card ──────────────────────────────────────────
interface PhysicsWord {
  word: string;
  idx: number;
  state: 'idle' | 'correct' | 'skipped';
  x: number;
  y: number;
  rotation: number;
  opacity: number;
  scale: number;
}

// ── Helpers ────────────────────────────────────────────────────
const getRandomCard = (): string[] =>
  CARDS[Math.floor(Math.random() * CARDS.length)];

const otherTeam = (idx: number) => (idx === 0 ? 1 : 0);

// ── Main component ─────────────────────────────────────────────
const ThirtySecondsGame: React.FC = () => {
  const { players, sharedState, setSharedState, isHost, currentPlayerId } = useMultiplayer();

  // Physics canvas ref
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const engineRef  = useRef<Matter.Engine | null>(null);
  const bodiesRef  = useRef<Map<number, Matter.Body>>(new Map());
  const rafRef     = useRef<number>(0);

  // Local state
  const [timeLeft,   setTimeLeft]   = useState(30);
  const [wordStates, setWordStates] = useState<PhysicsWord[]>([]);
  const [setupStep,  setSetupStep]  = useState<'teams' | 'ready'>('teams');
  const [team0Name,  setTeam0Name]  = useState('Team A');
  const [team1Name,  setTeam1Name]  = useState('Team B');
  const [stealInput, setStealInput] = useState('');
  const [stealResult, setStealResult] = useState<'correct'|'wrong'|null>(null);

  // Destructure shared state safely
  const gs = (sharedState ?? {}) as Partial<SharedState>;
  const phase           = gs.phase            ?? 'SETUP';
  const teams           = gs.teams            ?? [];
  const describingIdx   = gs.describingTeamIdx ?? 0;
  const currentCard     = gs.currentCard      ?? [];
  const guessed         = gs.guessed          ?? [];
  const stolen          = gs.stolen           ?? [];
  const endTime         = gs.endTime          ?? 0;

  const describingTeam  = teams[describingIdx];
  const opposingTeam    = teams[otherTeam(describingIdx)];

  // Am I the describer? (first player of describing team for simplicity)
  const myTeamIdx = teams.findIndex(t => t.playerIds.includes(currentPlayerId ?? ''));
  const amDescribing = myTeamIdx === describingIdx;
  const amOpposing   = myTeamIdx === otherTeam(describingIdx);

  // ── Init word physics states when card changes ────────────────
  useEffect(() => {
    if (phase !== 'PLAYING' || !currentCard.length) return;
    setWordStates(currentCard.map((word, idx) => ({
      word, idx,
      state: 'idle',
      x: 0, y: 0, rotation: 0, opacity: 1, scale: 1,
    })));
  }, [phase, gs.cardIndex]);

  // ── Timer ─────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'PLAYING' && phase !== 'GET_READY') return;
    const interval = setInterval(() => {
      const rem = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setTimeLeft(rem);

      if (rem <= 0) {
        clearInterval(interval);
        if (!isHost) return;

        if (phase === 'GET_READY') {
          const card = getRandomCard();
          setSharedState({
            phase: 'PLAYING',
            currentCard: card,
            cardIndex: (gs.cardIndex ?? 0) + 1,
            guessed: [],
            stolen: [],
            endTime: Date.now() + 30000,
          });
        } else if (phase === 'PLAYING') {
          // Check if there are any words to steal
          const missedCount = currentCard.filter((_, i) => !guessed.includes(i)).length;
          setSharedState({ phase: missedCount > 0 ? 'STEAL' : 'ROUND_SCORE' });
        }
      }
    }, 200);
    return () => clearInterval(interval);
  }, [phase, endTime, isHost]);

  // ── Word tap (describer taps guessed words) ───────────────────
  const tapWord = useCallback(async (idx: number) => {
    if (phase !== 'PLAYING') return;
    if (guessed.includes(idx)) return;

    const newGuessed = [...guessed, idx];
    if (navigator.vibrate) navigator.vibrate(40);

    // Physics: fling the word card off screen
    setWordStates(prev => prev.map(w =>
      w.idx === idx ? { ...w, state: 'correct' } : w
    ));

    // Animate then remove
    setTimeout(() => {
      setWordStates(prev => prev.map(w =>
        w.idx === idx ? { ...w, opacity: 0, scale: 1.3 } : w
      ));
    }, 300);

    await setSharedState({ guessed: newGuessed });
  }, [phase, guessed, setSharedState]);

  // ── Steal attempt ─────────────────────────────────────────────
  const attemptSteal = async () => {
    const missed = currentCard.filter((_, i) => !guessed.includes(i) && !stolen.includes(i));
    const guess  = stealInput.trim().toLowerCase();
    const match  = missed.findIndex(w => w.toLowerCase() === guess ||
      w.toLowerCase().includes(guess) || guess.includes(w.toLowerCase().split(' ')[0]));

    if (match !== -1) {
      const actualIdx = currentCard.indexOf(missed[match]);
      setStealResult('correct');
      if (navigator.vibrate) navigator.vibrate([80, 40, 120]);
      await setSharedState({ stolen: [...stolen, actualIdx] });
    } else {
      setStealResult('wrong');
      if (navigator.vibrate) navigator.vibrate(100);
    }
    setStealInput('');
    setTimeout(() => setStealResult(null), 1200);
  };

  // ── Finish steal, apply scores ─────────────────────────────────
  const endSteal = async () => {
    const describerPts = guessed.length;
    const stealPts     = stolen.length;

    const newTeams = teams.map((t, i) => ({
      ...t,
      score: t.score + (i === describingIdx ? describerPts : stealPts),
    }));

    const someone30 = newTeams.some(t => t.score >= WINNING_SCORE);
    await setSharedState({
      teams: newTeams,
      phase: someone30 ? 'GAME_OVER' : 'ROUND_SCORE',
      roundScoreA: describerPts,
      roundScoreB: stealPts,
    });
  };

  // ── Next round ────────────────────────────────────────────────
  const nextRound = async () => {
    if (!isHost) return;
    const nextDescriber = otherTeam(describingIdx);
    await setSharedState({
      phase: 'GET_READY',
      describingTeamIdx: nextDescriber,
      guessed: [],
      stolen: [],
      endTime: Date.now() + 3000,
    });
  };

  // ── Setup teams ────────────────────────────────────────────────
  const startWithTeams = async () => {
    if (!isHost) return;
    // Split players roughly in half
    const half = Math.ceil(players.length / 2);
    const t: Team[] = [
      { name: team0Name, playerIds: players.slice(0, half).map(p => p.id), score: 0 },
      { name: team1Name, playerIds: players.slice(half).map(p => p.id), score: 0 },
    ];
    await setSharedState({
      phase: 'GET_READY',
      teams: t,
      describingTeamIdx: 0,
      cardIndex: 0,
      guessed: [],
      stolen: [],
      endTime: Date.now() + 3000,
    });
  };

  // ── No players guard ─────────────────────────────────────────
  if (!players.length) {
    return (
      <div className="ts-container">
        <div className="ts-center">
          <h1 className="ts-logo">30 SECONDS</h1>
          <a href="/lobby?game=30seconds" className="ts-btn ts-btn-dark">Go to Lobby</a>
        </div>
      </div>
    );
  }

  const timerPanic = timeLeft <= 8 && timeLeft > 0;
  const missedWords = currentCard.filter((_, i) => !guessed.includes(i) && !stolen.includes(i));

  // ─────────────────────── RENDERS ─────────────────────────────

  const renderSetup = () => (
    <div className="ts-center fade-up">
      <div className="ts-logo-wrap">
        <h1 className="ts-logo">30<br/>SECONDS</h1>
        <p className="ts-tagline">5 words. 30 seconds. Total chaos.</p>
      </div>

      <div className="ts-players-preview">
        {players.map(p => (
          <span key={p.id} className="ts-player-chip">
            {p.isHost && '👑 '}{p.name}
          </span>
        ))}
      </div>

      {isHost ? (
        <div className="ts-setup-card">
          <p className="ts-setup-label">Name your teams</p>
          <div className="ts-team-inputs">
            <div className="ts-team-input-wrap">
              <div className="ts-team-dot ts-dot-yellow" />
              <input
                className="ts-input"
                value={team0Name}
                onChange={e => setTeam0Name(e.target.value)}
                placeholder="Team A"
                maxLength={16}
              />
            </div>
            <div className="ts-team-input-wrap">
              <div className="ts-team-dot ts-dot-black" />
              <input
                className="ts-input ts-input-dark"
                value={team1Name}
                onChange={e => setTeam1Name(e.target.value)}
                placeholder="Team B"
                maxLength={16}
              />
            </div>
          </div>

          <div className="ts-rules">
            <div className="ts-rule"><span>📣</span> Describe 5 words in 30 seconds</div>
            <div className="ts-rule"><span>🚫</span> No saying the word or any part of it</div>
            <div className="ts-rule"><span>🥷</span> Opposing team can STEAL missed words</div>
            <div className="ts-rule"><span>🏆</span> First team to {WINNING_SCORE} points wins</div>
          </div>

          <button className="ts-btn ts-btn-dark" onClick={startWithTeams}>
            START GAME →
          </button>
        </div>
      ) : (
        <p className="ts-waiting">Waiting for host to set up teams…</p>
      )}

      <a href="/" className="ts-exit">← Exit to Hub</a>
    </div>
  );

  const renderGetReady = () => (
    <div className="ts-center fade-up">
      <div className="ts-team-banner" style={{ background: describingTeam?.name ? undefined : undefined }}>
        <span className="ts-team-banner-label">DESCRIBING</span>
        <span className="ts-team-banner-name">{describingTeam?.name ?? 'Team A'}</span>
      </div>
      <div className="ts-countdown-wrap">
        <div className="ts-countdown">{timeLeft}</div>
        <p className="ts-countdown-sub">
          {amDescribing
            ? 'Get ready — you\'re describing!'
            : 'Get ready to guess!'}
        </p>
      </div>
      <div className="ts-score-preview">
        {teams.map((t, i) => (
          <div key={i} className={`ts-score-chip ${i === 0 ? 'yellow' : 'dark'}`}>
            <span>{t.name}</span>
            <span className="ts-score-chip-pts">{t.score}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPlaying = () => (
    <div className="ts-playing">
      {/* Timer ring */}
      <div className={`ts-timer-wrap ${timerPanic ? 'panic' : ''}`}>
        <svg className="ts-timer-svg" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" className="ts-timer-track" />
          <circle
            cx="60" cy="60" r="52"
            className="ts-timer-progress"
            strokeDasharray={`${326 * (timeLeft / 30)} 326`}
            strokeDashoffset="0"
            style={{ stroke: timerPanic ? '#ff1744' : '#ffcc00' }}
          />
        </svg>
        <div className="ts-timer-inner">
          <span className="ts-timer-num">{timeLeft}</span>
        </div>
      </div>

      {/* Team banner */}
      <div className="ts-turn-info">
        <span className="ts-turn-team">{describingTeam?.name}</span>
        <span className="ts-turn-role">
          {amDescribing ? '📣 You\'re describing!' : '🎧 Listen & guess!'}
        </span>
        <span className="ts-guessed-count">{guessed.length}/5 guessed</span>
      </div>

      {/* Word cards — only visible to describer */}
      {amDescribing ? (
        <div className="ts-word-cards">
          {currentCard.map((word, idx) => {
            const isGuessed = guessed.includes(idx);
            return (
              <button
                key={idx}
                className={`ts-word-card ${isGuessed ? 'guessed' : 'active'}`}
                onClick={() => !isGuessed && tapWord(idx)}
                disabled={isGuessed}
              >
                <span className="ts-word-text">{word}</span>
                {isGuessed && <span className="ts-word-check">✓</span>}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="ts-spectator">
          <div className="ts-spec-icon">👂</div>
          <h2 className="ts-spec-title">{describingTeam?.name} is describing…</h2>
          <div className="ts-spec-score">
            <span className="ts-spec-pts">{guessed.length}</span>
            <span className="ts-spec-label">guessed so far</span>
          </div>
          <p className="ts-spec-hint">Shout your answers out loud!</p>
        </div>
      )}

      {/* Score chips */}
      <div className="ts-score-row-bottom">
        {teams.map((t, i) => (
          <div key={i} className={`ts-score-chip-sm ${i === 0 ? 'yellow' : 'dark'}`}>
            {t.name}: <strong>{t.score}</strong>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSteal = () => {
    const canSteal = amOpposing;
    return (
      <div className="ts-center fade-up">
        <div className="ts-steal-header">
          <span className="ts-steal-icon">🥷</span>
          <h2 className="ts-steal-title">STEAL TIME</h2>
          <p className="ts-steal-sub">
            {opposingTeam?.name} can steal missed words!
          </p>
        </div>

        {/* Show missed words — but HIDDEN until steal attempt */}
        <div className="ts-steal-words">
          {currentCard.map((word, idx) => {
            const wasGuessed = guessed.includes(idx);
            const wasStolen  = stolen.includes(idx);
            if (wasGuessed) return (
              <div key={idx} className="ts-steal-word taken">✓ {word}</div>
            );
            if (wasStolen) return (
              <div key={idx} className="ts-steal-word stolen">🥷 {word}</div>
            );
            return (
              <div key={idx} className="ts-steal-word missed">
                {canSteal ? <span className="ts-steal-word-blur">{word}</span> : '???'}
              </div>
            );
          })}
        </div>

        {canSteal && (
          <div className="ts-steal-form">
            <p className="ts-steal-instruction">Type a word you think was missed:</p>
            <div className="ts-steal-input-row">
              <input
                className="ts-input ts-steal-input"
                value={stealInput}
                onChange={e => setStealInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && stealInput && attemptSteal()}
                placeholder="Type word…"
                autoFocus
              />
              <button className="ts-btn ts-btn-steal" onClick={attemptSteal}
                disabled={!stealInput.trim()}>
                STEAL →
              </button>
            </div>
            {stealResult === 'correct' && <div className="ts-steal-feedback correct">✓ Stolen!</div>}
            {stealResult === 'wrong'   && <div className="ts-steal-feedback wrong">✗ Not on the card</div>}
          </div>
        )}

        {!canSteal && (
          <p className="ts-waiting">
            {opposingTeam?.name} is attempting steals…
          </p>
        )}

        {(isHost || amOpposing) && (
          <button className="ts-btn ts-btn-dark" onClick={endSteal}
            style={{ marginTop: '16px' }}>
            Done Stealing →
          </button>
        )}
      </div>
    );
  };

  const renderRoundScore = () => {
    const dPts = gs.roundScoreA ?? 0;
    const sPts = gs.roundScoreB ?? 0;
    return (
      <div className="ts-center fade-up">
        <h2 className="ts-round-score-title">ROUND OVER</h2>

        <div className="ts-round-results">
          <div className="ts-round-result yellow">
            <span className="ts-rr-team">{describingTeam?.name}</span>
            <span className="ts-rr-pts">+{dPts}</span>
            <span className="ts-rr-total">{describingTeam?.score} total</span>
          </div>
          <div className="ts-round-result dark">
            <span className="ts-rr-team">{opposingTeam?.name}</span>
            <span className="ts-rr-pts">+{sPts} {sPts > 0 ? '🥷' : ''}</span>
            <span className="ts-rr-total">{opposingTeam?.score} total</span>
          </div>
        </div>

        {/* Progress bar to 30 */}
        <div className="ts-progress-section">
          {teams.map((t, i) => (
            <div key={i} className="ts-progress-row">
              <span className="ts-progress-label">{t.name}</span>
              <div className="ts-progress-track">
                <div
                  className={`ts-progress-fill ${i === 0 ? 'yellow' : 'dark'}`}
                  style={{ width: `${Math.min(100, (t.score / WINNING_SCORE) * 100)}%` }}
                />
              </div>
              <span className="ts-progress-pts">{t.score}/{WINNING_SCORE}</span>
            </div>
          ))}
        </div>

        {isHost ? (
          <button className="ts-btn ts-btn-dark" onClick={nextRound}>
            NEXT ROUND →
          </button>
        ) : (
          <p className="ts-waiting">Waiting for host…</p>
        )}

        <a href="/" className="ts-exit">← Exit to Hub</a>
      </div>
    );
  };

  const renderGameOver = () => {
    const winner = [...teams].sort((a, b) => b.score - a.score)[0];
    return (
      <div className="ts-center fade-up">
        <div className="ts-go-trophy">🏆</div>
        <h1 className="ts-go-title">{winner?.name} WINS!</h1>
        <div className="ts-go-scores">
          {[...teams].sort((a, b) => b.score - a.score).map((t, i) => (
            <div key={i} className={`ts-go-row ${i === 0 ? 'winner' : ''}`}>
              <span>{i === 0 ? '🥇' : '🥈'}</span>
              <span className="ts-go-name">{t.name}</span>
              <span className="ts-go-pts">{t.score} pts</span>
            </div>
          ))}
        </div>
        {isHost && (
          <button className="ts-btn ts-btn-dark"
            onClick={() => setSharedState({ phase: 'SETUP', teams: [] })}>
            PLAY AGAIN
          </button>
        )}
        <a href="/" className="ts-exit">← Exit to Hub</a>
      </div>
    );
  };

  return (
    <div className={`ts-container ts-phase-${phase.toLowerCase()}`}>
      {phase === 'SETUP'       && renderSetup()}
      {phase === 'LOBBY'       && renderSetup()}
      {phase === 'GET_READY'   && renderGetReady()}
      {phase === 'PLAYING'     && renderPlaying()}
      {phase === 'STEAL'       && renderSteal()}
      {phase === 'ROUND_SCORE' && renderRoundScore()}
      {phase === 'GAME_OVER'   && renderGameOver()}
    </div>
  );
};

export default ThirtySecondsGame;