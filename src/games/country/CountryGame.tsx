import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useMultiplayer } from '../../context/MultiplayerContext';
import {
  getCountriesByRegion, resetCountryPool, checkCountryAnswer,
  getCountryCount, REGION_LABELS, CountryEntry, Region,
} from './CountryData';
import './Country.css';

// ─────────────────────────────────────────────────────────────
//  GUESS THE COUNTRY — ROOM 37
//
//  Same multiplayer architecture as MovieGame.
//  Timed race: guess as many countries as possible.
//  Emojis hint at landmarks, food, culture, animals, geography.
//  Kenyan/African bias in the dataset for home crowd energy.
// ─────────────────────────────────────────────────────────────

type Phase = 'SETTINGS' | 'PLAYING' | 'REVEAL' | 'SCORE';

const ALL_REGIONS: Region[] = ['africa', 'europe', 'americas', 'asia', 'oceania', 'middle_east'];

// ── Confetti ──────────────────────────────────────────────────
const Confetti: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;
  return (
    <div className="ct-confetti" aria-hidden>
      {Array.from({ length: 24 }, (_, i) => (
        <div key={i} className={`ct-cp ct-cp-${i % 7}`}
          style={{ '--i': i, '--r': Math.random().toFixed(2) } as React.CSSProperties} />
      ))}
    </div>
  );
};

// ── Pulse ring on correct answer ───────────────────────────────
const PulseRing: React.FC<{ active: boolean }> = ({ active }) =>
  active ? <div className="ct-pulse-ring" /> : null;

// ── Main ──────────────────────────────────────────────────────
const CountryGame: React.FC = () => {
  const {
    players, sharedState, setSharedState,
    isHost, currentPlayerId, mode,
  } = useMultiplayer();

  const isPassPlay = mode === 'local';

  // Local state
  const [guess,      setGuess]      = useState('');
  const [inputState, setInputState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [shakeKey,   setShakeKey]   = useState(0);
  const [timeLeft,   setTimeLeft]   = useState(0);
  const [confetti,   setConfetti]   = useState(false);
  const [pulse,      setPulse]      = useState(false);
  const [streak,     setStreak]     = useState(0);   // local win streak for adrenaline UI

  // Settings (host only)
  const [selRegions,   setSelRegions]   = useState<Region[]>(['africa', 'europe', 'americas']);
  const [gameDuration, setGameDuration] = useState(120);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | undefined>();

  // Shared state
  const phase        = (sharedState?.phase         ?? 'SETTINGS') as Phase;
  const currentIndex = (sharedState?.currentIndex  ?? 0)          as number;
  const scores       = (sharedState?.scores        ?? {})         as Record<string, number>;
  const endTime      = (sharedState?.endTime       ?? 0)          as number;
  const gameCountries= (sharedState?.gameCountries ?? [])         as CountryEntry[];
  const revealedAns  = (sharedState?.revealedAnswer ?? '')        as string;
  const roundWinner  = (sharedState?.roundWinner   ?? '')         as string;
  const ppTurn       = (sharedState?.ppTurn        ?? 0)          as number;
  const totalGuessed = (sharedState?.totalGuessed  ?? 0)          as number;

  const country = gameCountries[currentIndex];
  const myTurn  = !isPassPlay || (players[ppTurn]?.id === currentPlayerId);
  const currentTurnPlayer = players[ppTurn];

  // ── Reset local on new country ────────────────────────────
  useEffect(() => {
    setGuess('');
    setInputState('idle');
    if (phase === 'PLAYING') setTimeout(() => inputRef.current?.focus(), 80);
  }, [currentIndex, phase]);

  // ── Timer ─────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'PLAYING') { clearInterval(timerRef.current); return; }
    const tick = () => {
      const rem = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setTimeLeft(rem);
      if (rem <= 0 && isHost) {
        clearInterval(timerRef.current);
        setSharedState({ phase: 'SCORE' });
      }
    };
    tick();
    timerRef.current = setInterval(tick, 300);
    return () => clearInterval(timerRef.current);
  }, [phase, endTime, isHost]);

  // ── Auto-advance after REVEAL (online mode) ───────────────
  useEffect(() => {
    if (phase !== 'REVEAL' || !isHost || isPassPlay) return;
    const t = setTimeout(advanceCountry, 2500);
    return () => clearTimeout(t);
  }, [phase, isHost, isPassPlay]);

  const advanceCountry = useCallback(async () => {
    const next = currentIndex + 1;
    if (next >= gameCountries.length || timeLeft <= 0) {
      await setSharedState({ phase: 'SCORE' });
    } else {
      await setSharedState({
        phase: 'PLAYING',
        currentIndex: next,
        revealedAnswer: '',
        roundWinner: '',
        ppTurn: (ppTurn + 1) % Math.max(players.length, 1),
      });
    }
  }, [currentIndex, gameCountries.length, ppTurn, players.length, timeLeft]);

  // ── Start game ────────────────────────────────────────────
  const startGame = async () => {
    if (!isHost || selRegions.length === 0) return;
    resetCountryPool();
    const initScores: Record<string, number> = {};
    players.forEach(p => { initScores[p.id] = 0; });
    const countries = getCountriesByRegion(selRegions, Math.min(selRegions.length * 12, 80));
    await setSharedState({
      phase: 'PLAYING',
      currentIndex: 0,
      scores: initScores,
      gameCountries: countries,
      endTime: Date.now() + gameDuration * 1000,
      revealedAnswer: '',
      roundWinner: '',
      ppTurn: 0,
      totalGuessed: 0,
    });
  };

  // ── Guess ─────────────────────────────────────────────────
  const submitGuess = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (phase !== 'PLAYING' || !country || !guess.trim() || !myTurn) return;

    if (checkCountryAnswer(guess, country)) {
      const newScores = {
        ...scores,
        [currentPlayerId ?? '']: (scores[currentPlayerId ?? ''] ?? 0) + 1,
      };
      setInputState('correct');
      setConfetti(true);
      setPulse(true);
      setStreak(s => s + 1);
      setTimeout(() => { setConfetti(false); setPulse(false); }, 1600);
      if (navigator.vibrate) navigator.vibrate([60, 30, 120]);

      await setSharedState({
        phase: 'REVEAL',
        scores: newScores,
        revealedAnswer: country.answer.toUpperCase(),
        roundWinner: currentPlayerId ?? '',
        totalGuessed: totalGuessed + 1,
      });
    } else {
      setInputState('wrong');
      setShakeKey(k => k + 1);
      setStreak(0);
      setGuess('');
      if (navigator.vibrate) navigator.vibrate(80);
      setTimeout(() => setInputState('idle'), 500);
    }
  };

  // ── Skip ─────────────────────────────────────────────────
  const skip = async () => {
    if (phase !== 'PLAYING' || (!isPassPlay && !isHost)) return;
    setStreak(0);
    await setSharedState({
      phase: 'REVEAL',
      revealedAnswer: country?.answer?.toUpperCase() ?? '',
      roundWinner: '',
    });
  };

  const toggleRegion = (r: Region) =>
    setSelRegions(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);

  // ── Guard ─────────────────────────────────────────────────
  if (!players.length) {
    return (
      <div className="ct-container">
        <div className="ct-center">
          <div className="ct-lobby-icon">🌍</div>
          <h1 className="ct-logo">GUESS THE<br />COUNTRY</h1>
          <a href="/lobby?game=country" className="ct-btn ct-btn-start">Go to Lobby</a>
        </div>
      </div>
    );
  }

  const timerPanic  = timeLeft <= 10;
  const timerWarn   = timeLeft <= 30;
  const timerColor  = timerPanic ? '#ff1744' : timerWarn ? '#ffd600' : '#00e5ff';
  const myScore     = scores[currentPlayerId ?? ''] ?? 0;

  // ── SETTINGS ─────────────────────────────────────────────
  const renderSettings = () => (
    <div className="ct-lobby">
      <div className="ct-globe-anim" aria-hidden>🌍</div>
      <h1 className="ct-logo">GUESS THE<br /><span className="ct-logo-country">COUNTRY</span></h1>
      <p className="ct-tagline">Emojis. Instinct. Glory.</p>

      {isHost ? (
        <>
          {/* Region picker */}
          <div className="ct-section-label">Pick regions</div>
          <div className="ct-region-grid">
            {ALL_REGIONS.map(r => (
              <button
                key={r}
                className={`ct-region-btn ${selRegions.includes(r) ? 'active' : ''}`}
                onClick={() => toggleRegion(r)}
              >
                <span className="ct-region-icon">{REGION_LABELS[r].split(' ')[0]}</span>
                <span className="ct-region-name">{REGION_LABELS[r].split(' ').slice(1).join(' ')}</span>
                <span className="ct-region-count">{getCountryCount(r)}</span>
              </button>
            ))}
          </div>

          {/* Duration slider */}
          <div className="ct-slider-wrap">
            <div className="ct-slider-header">
              <span className="ct-section-label">Game time</span>
              <span className="ct-slider-val">{gameDuration}s</span>
            </div>
            <input
              type="range" min={60} max={300} step={30}
              value={gameDuration}
              onChange={e => setGameDuration(+e.target.value)}
              className="ct-slider"
            />
            <div className="ct-slider-labels">
              <span>1 min</span><span>3 min</span><span>5 min</span>
            </div>
          </div>

          <div className="ct-rules">
            <div className="ct-rule"><span>⏱️</span>Race the clock — guess as many as possible</div>
            <div className="ct-rule"><span>🌍</span>Emojis hint at culture, food, landmarks, animals</div>
            <div className="ct-rule"><span>⚡</span>Every correct answer = 1 point. No hints.</div>
            <div className="ct-rule"><span>🇰🇪</span>Special African section for home advantage!</div>
          </div>

          <button
            className="ct-btn ct-btn-start"
            onClick={startGame}
            disabled={selRegions.length === 0}
          >
            START GAME →
          </button>
        </>
      ) : (
        <p className="ct-waiting">Waiting for host to set up…</p>
      )}

      <a href="/" className="ct-exit">← Exit to Hub</a>
    </div>
  );

  // ── PLAYING ───────────────────────────────────────────────
  const renderPlaying = () => {
    if (!country) return null;
    const diffColor = country.difficulty === 'easy' ? '#00e676' : country.difficulty === 'medium' ? '#ffd600' : '#ff6d00';

    return (
      <div className="ct-playing">
        <PulseRing active={pulse} />
        <Confetti active={confetti} />

        {/* Header */}
        <div className="ct-header">
          <div className="ct-stat">
            <span className="ct-stat-label">ROUND</span>
            <span className="ct-stat-val">{currentIndex + 1}</span>
          </div>

          <div className={`ct-timer ${timerPanic ? 'panic' : timerWarn ? 'warn' : ''}`}
            style={{ color: timerColor, borderColor: timerColor }}>
            <span className="ct-timer-num">{timeLeft}</span>
            <span className="ct-timer-label">SEC</span>
          </div>

          <div className="ct-stat">
            <span className="ct-stat-label">SCORE</span>
            <span className="ct-stat-val ct-gold">{myScore}</span>
          </div>
        </div>

        {/* Streak */}
        {streak >= 2 && (
          <div className="ct-streak">
            🔥 {streak} in a row!
          </div>
        )}

        {/* Pass & play turn */}
        {isPassPlay && (
          <div className={`ct-turn-banner ${myTurn ? 'my-turn' : ''}`}>
            {myTurn
              ? '👉 Your turn — everyone else look away!'
              : `👀 ${currentTurnPlayer?.name ?? '?'}'s turn`}
          </div>
        )}

        {/* Difficulty badge */}
        <div className="ct-diff-badge" style={{ background: diffColor + '22', color: diffColor, borderColor: diffColor + '55' }}>
          {country.difficulty === 'easy' ? '🟢 Easy' : country.difficulty === 'medium' ? '🟡 Medium' : '🔴 Hard'}
        </div>

        {/* Emoji stage — big, bouncy, beautiful */}
        <div className="ct-emoji-stage">
          {Array.from(country.emojis).filter(c => c.trim()).map((ch, i) => (
            <div key={`${currentIndex}-${i}`} className="ct-emoji-card"
              style={{ animationDelay: `${i * 70}ms` }}>
              <span className="ct-emoji-char">{ch}</span>
            </div>
          ))}
        </div>

        {/* Region hint */}
        <p className="ct-region-hint">
          {REGION_LABELS[country.region]}
        </p>

        {/* Guess form */}
        <form className="ct-guess-form" onSubmit={submitGuess} autoComplete="off">
          <div className={`ct-input-wrap ${inputState}`} key={shakeKey}>
            <input
              ref={inputRef}
              type="text"
              className="ct-input"
              placeholder={myTurn ? 'Type the country…' : `${currentTurnPlayer?.name ?? '?'}'s turn`}
              value={guess}
              onChange={e => setGuess(e.target.value)}
              disabled={!myTurn || phase !== 'PLAYING'}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="words"
              spellCheck={false}
            />
            {inputState === 'correct' && <div className="ct-badge correct">✓ YES!</div>}
            {inputState === 'wrong'   && <div className="ct-badge wrong">✗ NOPE</div>}
          </div>

          <div className="ct-actions">
            <button type="button" className="ct-btn ct-btn-skip" onClick={skip}
              disabled={!isPassPlay && !isHost}>
              ⏭ Skip
            </button>
            <button type="submit" className="ct-btn ct-btn-guess"
              disabled={!myTurn || !guess.trim()}>
              GUESS →
            </button>
          </div>
        </form>

        {/* Live board */}
        <div className="ct-live-board">
          {players.slice().sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0)).map(p => (
            <div key={p.id} className={`ct-live-row ${p.id === currentPlayerId ? 'me' : ''}`}>
              <span className="ct-live-name">{p.name}</span>
              <span className="ct-live-pts">{scores[p.id] ?? 0}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── REVEAL ────────────────────────────────────────────────
  const renderReveal = () => {
    const winner = players.find(p => p.id === roundWinner);
    return (
      <div className="ct-reveal fade-up">
        <Confetti active={!!winner} />

        <div className={`ct-reveal-result ${winner ? 'win' : 'miss'}`}>
          <span className="ct-reveal-icon">{winner ? '🎉' : '⏭️'}</span>
          <h2>{winner ? `${winner.name} got it!` : 'Skipped!'}</h2>
        </div>

        <p className="ct-reveal-label">The country was</p>
        <div className="ct-reveal-answer">{revealedAns}</div>

        {country && (
          <div className="ct-reveal-emojis">
            {Array.from(country.emojis).filter(c => c.trim()).map((ch, i) => (
              <span key={i} className="ct-reveal-emoji">{ch}</span>
            ))}
          </div>
        )}

        {country && (
          <p className="ct-reveal-region">{REGION_LABELS[country.region]}</p>
        )}

        {isPassPlay ? (
          <button className="ct-btn ct-btn-start" onClick={advanceCountry}>
            {currentIndex + 1 >= gameCountries.length ? 'See Scores →' : 'Next Country →'}
          </button>
        ) : (
          <>
            <div className="ct-reveal-bar"><div className="ct-reveal-fill" /></div>
            <p className="ct-reveal-next">Next in 2.5s…</p>
          </>
        )}
      </div>
    );
  };

  // ── SCORE ─────────────────────────────────────────────────
  const renderScore = () => {
    const sorted = players.slice().sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0));
    const medals = ['🥇', '🥈', '🥉'];
    const topScore = scores[sorted[0]?.id] ?? 0;

    return (
      <div className="ct-score fade-up">
        <div className="ct-score-globe">🌍</div>
        <h1 className="ct-score-title">TIME'S UP!</h1>
        <p className="ct-score-sub">{totalGuessed} countr{totalGuessed === 1 ? 'y' : 'ies'} correctly guessed</p>

        <div className="ct-score-list">
          {sorted.map((p, i) => (
            <div key={p.id}
              className={`ct-score-row ${i === 0 ? 'gold' : ''} ${p.id === currentPlayerId ? 'me' : ''}`}
              style={{ animationDelay: `${i * 0.1}s` }}>
              <span className="ct-score-medal">{medals[i] ?? `#${i + 1}`}</span>
              <span className="ct-score-name">{p.name}</span>
              <div className="ct-score-right">
                <span className="ct-score-pts">{scores[p.id] ?? 0} pts</span>
                {topScore > 0 && (
                  <div className="ct-score-bar">
                    <div className="ct-score-bar-fill"
                      style={{ width: `${((scores[p.id] ?? 0) / topScore) * 100}%` }} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {isHost ? (
          <button className="ct-btn ct-btn-start"
            onClick={() => setSharedState({ phase: 'SETTINGS' })}>
            PLAY AGAIN 🔄
          </button>
        ) : (
          <p className="ct-waiting">Waiting for host…</p>
        )}

        <a href="/" className="ct-exit">← Exit to Hub</a>
      </div>
    );
  };

  return (
    <div className={`ct-container ct-phase-${phase.toLowerCase()}`}>
      <div className="ct-bg-orb ct-orb-1" />
      <div className="ct-bg-orb ct-orb-2" />
      <div className="ct-bg-orb ct-orb-3" />

      {phase === 'SETTINGS' && renderSettings()}
      {phase === 'PLAYING'  && renderPlaying()}
      {phase === 'REVEAL'   && renderReveal()}
      {phase === 'SCORE'    && renderScore()}
    </div>
  );
};

export default CountryGame;