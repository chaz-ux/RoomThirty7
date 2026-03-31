import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMultiplayer } from '../../context/MultiplayerContext';
import './ThirtySeconds.css';

// ─────────────────────────────────────────────────────────────
//  30 SECONDS — ROOM 37
//
//  Pass & Play (one device):
//    Each phase transition shows a SCREEN GATE — a blank screen
//    with instructions to pass the device. The next team taps
//    "I have the phone" to reveal their view.
//
//  Online (multiple devices):
//    No gates needed — everyone sees their own screen.
//    Describer's screen shows words. Others see spectator view.
// ─────────────────────────────────────────────────────────────

const CARDS: string[][] = [
  // Kenyan culture
  ['Matatu', 'Nyama Choma', 'M-Pesa', 'Harambee', 'Kanjo'],
  ['Ugali', 'Boda Boda', 'Kibera', 'Sukuma Wiki', 'Jua Kali'],
  ['Maasai Mara', 'Lake Nakuru', 'Mutura', 'Westlands', 'Mandazi'],
  ['Sauti Sol', 'Khaligraph', "Lupita Nyong'o", 'Eric Omondi', 'Akothee'],
  ['Churchill Show', 'Bien', 'Trio Mio', 'Nairobi', 'Uhuru Park'],
  ['Pilau', 'Githeri', 'Chapati', 'Matumbo', 'Wali wa Nazi'],
  // African
  ['Burna Boy', 'Wizkid', 'Davido', 'Tiwa Savage', 'Diamond Platnumba'],
  ['Amapiano', 'Afrobeats', 'Bongo', 'Genge', 'Kapuka'],
  ['Nollywood', 'BBNaija', 'Afcon', 'Harambee Stars', 'Gor Mahia'],
  // Global
  ['Eiffel Tower', 'Banana', 'Superman', 'Pizza', 'Dinosaur'],
  ['Harry Potter', 'Guitar', 'Snowman', 'Coffee', 'Tornado'],
  ['Oxygen', 'Moon', 'Vampire', 'Swimming', 'Chocolate'],
  ['Netflix', 'Kangaroo', 'Sushi', 'Pyramid', 'Helicopter'],
  ['Instagram', 'Football', 'Shark', 'Rainbow', 'Earthquake'],
  ['Astronaut', 'Submarine', 'Roller Coaster', 'Solar Eclipse', 'Waterfall'],
  ["Beyoncé", 'Ronaldo', 'Elon Musk', 'Obama', 'Oprah'],
  ["McDonald's", 'TikTok', 'YouTube', 'WhatsApp', 'Uber'],
  ['Tsunami', 'Igloo', 'Bulldozer', 'Quicksand', 'Mirage'],
  ['Bluetooth', 'Vaccine', 'Democracy', 'Inflation', 'Algorithm'],
  ['Photosynthesis', 'Gravity', 'Evolution', 'Black Hole', 'DNA'],
];

const WINNING_SCORE = 30;

type Phase =
  | 'SETUP'
  | 'GET_READY'
  | 'PLAYING'
  | 'STEAL'
  | 'ROUND_SCORE'
  | 'GAME_OVER';

// Pass & play gate types — what to show on the blank screen
type Gate =
  | 'pass_to_describer'   // "Pass to Team A — they will describe"
  | 'pass_to_steal'       // "Pass to Team B — time to steal"
  | 'pass_to_next'        // "Pass to Team B — your turn to describe"
  | null;                 // no gate, show normal screen

interface Team { name: string; score: number; }

interface SharedState {
  phase: Phase;
  teams: Team[];
  describingTeamIdx: number;
  currentCard: string[];
  cardIndex: number;
  guessed: number[];
  stolen: number[];
  endTime: number;
  roundScoreA: number;
  roundScoreB: number;
}

const usedCardIndices = new Set<number>();
const getRandomCard = (): string[] => {
  if (usedCardIndices.size >= CARDS.length) usedCardIndices.clear();
  let idx: number;
  do { idx = Math.floor(Math.random() * CARDS.length); } while (usedCardIndices.has(idx));
  usedCardIndices.add(idx);
  return CARDS[idx];
};

const other = (idx: number) => idx === 0 ? 1 : 0;

const ThirtySecondsGame: React.FC = () => {
  const { players, sharedState, setSharedState, isHost, currentPlayerId, mode } = useMultiplayer();

  const isPassPlay = mode === 'local';

  // ── Local state ──────────────────────────────────────────
  const [timeLeft,    setTimeLeft]    = useState(30);
  const [stealInput,  setStealInput]  = useState('');
  const [stealResult, setStealResult] = useState<'correct' | 'wrong' | null>(null);
  const [team0Name,   setTeam0Name]   = useState('Team A');
  const [team1Name,   setTeam1Name]   = useState('Team B');

  // The pass-and-play gate — null means "show normal screen"
  const [gate, setGate] = useState<Gate>(null);
  // Which team is currently holding the device (0 or 1), tracked locally
  const [holderTeam, setHolderTeam] = useState<number>(0);

  const prevPhaseRef = useRef<Phase | null>(null);

  // ── Shared state ─────────────────────────────────────────
  const gs             = (sharedState ?? {}) as Partial<SharedState>;
  const phase          = gs.phase            ?? 'SETUP';
  const teams          = gs.teams            ?? [];
  const describingIdx  = gs.describingTeamIdx ?? 0;
  const currentCard    = gs.currentCard      ?? [];
  const guessed        = gs.guessed          ?? [];
  const stolen         = gs.stolen           ?? [];
  const endTime        = gs.endTime          ?? 0;

  const describingTeam = teams[describingIdx];
  const opposingTeam   = teams[other(describingIdx)];

  // ── Gate logic: trigger when phase changes ────────────────
  useEffect(() => {
    if (!isPassPlay) return;
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = phase;

    if (phase === 'GET_READY' && prev !== null) {
      // New round starting — pass to the describing team
      setHolderTeam(other(describingIdx)); // currently with opposing team
      setGate('pass_to_describer');
    } else if (phase === 'STEAL') {
      // Time up — pass to opposing team to steal
      setHolderTeam(describingIdx);        // currently with describing team
      setGate('pass_to_steal');
    }
  }, [phase, isPassPlay]);

  // ── Timer ────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'PLAYING' && phase !== 'GET_READY') return;
    const interval = setInterval(() => {
      const rem = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setTimeLeft(rem);
      if (rem <= 0 && isHost) {
        clearInterval(interval);
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
          const missed = currentCard.filter((_, i) => !guessed.includes(i)).length;
          setSharedState({ phase: missed > 0 ? 'STEAL' : 'ROUND_SCORE' });
        }
      }
    }, 200);
    return () => clearInterval(interval);
  }, [phase, endTime, isHost, guessed, currentCard]);

  // ── Start game ────────────────────────────────────────────
  const startGame = async () => {
    if (!isHost) return;
    const t: Team[] = [
      { name: team0Name, score: 0 },
      { name: team1Name, score: 0 },
    ];
    if (isPassPlay) {
      setHolderTeam(1); // device starts with opposing team, gate will ask to pass to Team A
      setGate('pass_to_describer');
    }
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

  // ── Word tap ──────────────────────────────────────────────
  const tapWord = async (idx: number) => {
    if (phase !== 'PLAYING' || guessed.includes(idx)) return;
    if (navigator.vibrate) navigator.vibrate(40);
    await setSharedState({ guessed: [...guessed, idx] });
  };

  // ── Steal ─────────────────────────────────────────────────
  const attemptSteal = async () => {
    const missed = currentCard.filter((_, i) => !guessed.includes(i) && !stolen.includes(i));
    const g = stealInput.trim().toLowerCase();
    const matchIdx = missed.findIndex(w =>
      w.toLowerCase() === g ||
      w.toLowerCase().includes(g) ||
      g.includes(w.toLowerCase().split(' ')[0])
    );
    if (matchIdx !== -1) {
      const actualIdx = currentCard.indexOf(missed[matchIdx]);
      setStealResult('correct');
      if (navigator.vibrate) navigator.vibrate([60, 30, 100]);
      await setSharedState({ stolen: [...stolen, actualIdx] });
    } else {
      setStealResult('wrong');
      if (navigator.vibrate) navigator.vibrate(80);
    }
    setStealInput('');
    setTimeout(() => setStealResult(null), 1200);
  };

  const endSteal = async () => {
    const dPts = guessed.length;
    const sPts = stolen.length;
    const newTeams = teams.map((t, i) => ({
      ...t,
      score: t.score + (i === describingIdx ? dPts : sPts),
    }));
    const won = newTeams.some(t => t.score >= WINNING_SCORE);
    await setSharedState({
      teams: newTeams,
      phase: won ? 'GAME_OVER' : 'ROUND_SCORE',
      roundScoreA: dPts,
      roundScoreB: sPts,
    });
  };

  const nextRound = async () => {
    if (!isHost) return;
    const next = other(describingIdx);
    if (isPassPlay) {
      setGate('pass_to_next');
      setHolderTeam(describingIdx); // currently with old describing team
    }
    await setSharedState({
      phase: 'GET_READY',
      describingTeamIdx: next,
      guessed: [],
      stolen: [],
      endTime: Date.now() + 3000,
    });
  };

  // ── Guard ─────────────────────────────────────────────────
  if (!players.length) {
    return (
      <div className="ts-container">
        <div className="ts-center">
          <h1 className="ts-logo">30<br/>SECONDS</h1>
          <a href="/lobby?game=30seconds" className="ts-btn ts-btn-dark">Go to Lobby</a>
        </div>
      </div>
    );
  }

  const timerPanic = timeLeft <= 8 && timeLeft > 0;

  // ── Pass & Play Gate Screen ───────────────────────────────
  // Shown between phases when one device is being passed around.
  // Screen is intentionally minimal — the other team shouldn't
  // be able to see anything useful.
  const renderGate = () => {
    const receivingTeam = gate === 'pass_to_describer'
      ? teams[describingIdx]
      : gate === 'pass_to_steal'
      ? teams[other(describingIdx)]
      : gate === 'pass_to_next'
      ? teams[other(describingIdx)]
      : null;

    const gateMsg = gate === 'pass_to_describer'
      ? { icon: '📱', title: `Pass to ${receivingTeam?.name ?? 'the next team'}`, sub: "They'll describe the words. Don't peek!", btn: 'I have the phone →' }
      : gate === 'pass_to_steal'
      ? { icon: '🥷', title: `Pass to ${receivingTeam?.name ?? 'the other team'}`, sub: "Time's up! They get a steal attempt.", btn: 'I have the phone →' }
      : { icon: '📱', title: `Pass to ${receivingTeam?.name ?? 'the next team'}`, sub: "It's your turn to describe!", btn: 'I have the phone →' };

    return (
      <div className="ts-gate">
        <div className="ts-gate-icon">{gateMsg.icon}</div>
        <h2 className="ts-gate-title">{gateMsg.title}</h2>
        <p className="ts-gate-sub">{gateMsg.sub}</p>
        <button
          className="ts-btn ts-btn-dark ts-btn-gate"
          onClick={() => {
            setHolderTeam(receivingTeam === teams[0] ? 0 : 1);
            setGate(null);
          }}
        >
          {gateMsg.btn}
        </button>
        <p className="ts-gate-warning">⚠️ Keep screen face-down until you have it</p>
      </div>
    );
  };

  // ─────────────────────── RENDERS ─────────────────────────

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
              <input className="ts-input" value={team0Name}
                onChange={e => setTeam0Name(e.target.value)}
                placeholder="Team A" maxLength={16} />
            </div>
            <div className="ts-team-input-wrap">
              <div className="ts-team-dot ts-dot-black" />
              <input className="ts-input ts-input-dark" value={team1Name}
                onChange={e => setTeam1Name(e.target.value)}
                placeholder="Team B" maxLength={16} />
            </div>
          </div>

          <div className="ts-rules">
            <div className="ts-rule"><span>📣</span> Describe 5 words in 30 seconds</div>
            <div className="ts-rule"><span>🚫</span> No saying the word or any part of it</div>
            <div className="ts-rule"><span>🥷</span> Opposing team can STEAL missed words</div>
            <div className="ts-rule"><span>🏆</span> First to {WINNING_SCORE} points wins</div>
            {isPassPlay && <div className="ts-rule"><span>📱</span> One device — pass it between teams</div>}
          </div>

          <button className="ts-btn ts-btn-dark" onClick={startGame}>
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
      <div className="ts-team-banner">
        <span className="ts-team-banner-label">DESCRIBING</span>
        <span className="ts-team-banner-name">{describingTeam?.name ?? 'Team A'}</span>
      </div>
      <div className="ts-countdown-wrap">
        <div className="ts-countdown">{timeLeft}</div>
        <p className="ts-countdown-sub">Get ready…</p>
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
          <circle cx="60" cy="60" r="52"
            className="ts-timer-progress"
            strokeDasharray={`${326 * (timeLeft / 30)} 326`}
            style={{ stroke: timerPanic ? '#ff1744' : '#ffcc00' }}
          />
        </svg>
        <div className="ts-timer-inner">
          <span className="ts-timer-num">{timeLeft}</span>
        </div>
      </div>

      <div className="ts-turn-info">
        <span className="ts-turn-team">{describingTeam?.name} describes</span>
        <span className="ts-guessed-count">{guessed.length}/5 guessed</span>
      </div>

      {/* Pass & play: describer always sees the words (they're holding device) */}
      {/* Online: only describer's device shows words */}
      <div className="ts-word-cards">
        {currentCard.map((word, idx) => {
          const isGuessed = guessed.includes(idx);
          return (
            <button key={idx}
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

      <div className="ts-score-row-bottom">
        {teams.map((t, i) => (
          <div key={i} className={`ts-score-chip-sm ${i === 0 ? 'yellow' : 'dark'}`}>
            {t.name}: <strong>{t.score}</strong>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSteal = () => (
    <div className="ts-center fade-up">
      <div className="ts-steal-header">
        <span className="ts-steal-icon">🥷</span>
        <h2 className="ts-steal-title">STEAL TIME</h2>
        <p className="ts-steal-sub">{opposingTeam?.name} — guess the missed words!</p>
      </div>

      <div className="ts-steal-words">
        {currentCard.map((word, idx) => {
          const wasGuessed = guessed.includes(idx);
          const wasStolen  = stolen.includes(idx);
          if (wasGuessed) return <div key={idx} className="ts-steal-word taken">✓ {word}</div>;
          if (wasStolen)  return <div key={idx} className="ts-steal-word stolen">🥷 {word}</div>;
          return <div key={idx} className="ts-steal-word missed">❓ ???</div>;
        })}
      </div>

      <div className="ts-steal-form">
        <p className="ts-steal-instruction">Type a word you think was on the card:</p>
        <div className="ts-steal-input-row">
          <input
            className="ts-input ts-steal-input"
            value={stealInput}
            onChange={e => setStealInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && stealInput && attemptSteal()}
            placeholder="Type word…"
            autoFocus
            autoComplete="off"
          />
          <button className="ts-btn ts-btn-steal" onClick={attemptSteal}
            disabled={!stealInput.trim()}>
            STEAL →
          </button>
        </div>
        {stealResult === 'correct' && <div className="ts-steal-feedback correct">✓ Stolen!</div>}
        {stealResult === 'wrong'   && <div className="ts-steal-feedback wrong">✗ Not on the card</div>}
      </div>

      <button className="ts-btn ts-btn-dark" onClick={endSteal}>
        Done Stealing →
      </button>
    </div>
  );

  const renderRoundScore = () => {
    const dPts = gs.roundScoreA ?? 0;
    const sPts = gs.roundScoreB ?? 0;
    return (
      <div className="ts-center fade-up">
        <h2 className="ts-round-score-title">ROUND OVER</h2>

        {/* Reveal all words now */}
        <div className="ts-reveal-words">
          {currentCard.map((word, idx) => {
            const g = guessed.includes(idx);
            const s = stolen.includes(idx);
            return (
              <div key={idx} className={`ts-reveal-word ${g ? 'guessed' : s ? 'stolen' : 'missed'}`}>
                {g ? '✓' : s ? '🥷' : '✗'} {word}
              </div>
            );
          })}
        </div>

        <div className="ts-round-results">
          <div className="ts-round-result yellow">
            <span className="ts-rr-team">{describingTeam?.name}</span>
            <span className="ts-rr-pts">+{dPts}</span>
            <span className="ts-rr-total">{describingTeam?.score} total</span>
          </div>
          <div className="ts-round-result dark">
            <span className="ts-rr-team">{opposingTeam?.name}</span>
            <span className="ts-rr-pts">+{sPts}{sPts > 0 ? ' 🥷' : ''}</span>
            <span className="ts-rr-total">{opposingTeam?.score} total</span>
          </div>
        </div>

        <div className="ts-progress-section">
          {teams.map((t, i) => (
            <div key={i} className="ts-progress-row">
              <span className="ts-progress-label">{t.name}</span>
              <div className="ts-progress-track">
                <div className={`ts-progress-fill ${i === 0 ? 'yellow' : 'dark'}`}
                  style={{ width: `${Math.min(100, (t.score / WINNING_SCORE) * 100)}%` }} />
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
    const sorted = [...teams].sort((a, b) => b.score - a.score);
    return (
      <div className="ts-center fade-up">
        <div className="ts-go-trophy">🏆</div>
        <h1 className="ts-go-title">{sorted[0]?.name} WINS!</h1>
        <div className="ts-go-scores">
          {sorted.map((t, i) => (
            <div key={i} className={`ts-go-row ${i === 0 ? 'winner' : ''}`}>
              <span>{i === 0 ? '🥇' : '🥈'}</span>
              <span className="ts-go-name">{t.name}</span>
              <span className="ts-go-pts">{t.score} pts</span>
            </div>
          ))}
        </div>
        {isHost && (
          <button className="ts-btn ts-btn-dark"
            onClick={() => { setGate(null); setSharedState({ phase: 'SETUP', teams: [] }); }}>
            PLAY AGAIN
          </button>
        )}
        <a href="/" className="ts-exit">← Exit to Hub</a>
      </div>
    );
  };

  // ── Gate takes priority over everything ──────────────────
  if (isPassPlay && gate !== null) return (
    <div className="ts-container ts-phase-gate">{renderGate()}</div>
  );

  return (
    <div className={`ts-container ts-phase-${phase.toLowerCase()}`}>
      {phase === 'SETUP'       && renderSetup()}
      {phase === 'GET_READY'   && renderGetReady()}
      {phase === 'PLAYING'     && renderPlaying()}
      {phase === 'STEAL'       && renderSteal()}
      {phase === 'ROUND_SCORE' && renderRoundScore()}
      {phase === 'GAME_OVER'   && renderGameOver()}
    </div>
  );
};

export default ThirtySecondsGame;