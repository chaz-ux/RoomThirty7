import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useMultiplayer } from '../../context/MultiplayerContext';
import {
  getMoviesByGenres, resetMoviePool, checkAnswerWithAliases,
  getGenreCount, GENRE_LABELS, MovieEntry, Genre,
} from './MovieData';
import './Movie.css';

// ─────────────────────────────────────────────────────────────
//  GUESS THE MOVIE — ROOM 37
//
//  Mode comes from MultiplayerContext (set in main Lobby).
//  No re-asking inside the game.
//
//  Time-limit format: one shared countdown, players race to
//  guess as many movies as possible before time runs out.
//  First correct guess advances to next movie for everyone.
//
//  Pass & Play: host advances manually after showing answer.
// ─────────────────────────────────────────────────────────────

type Phase = 'SETTINGS' | 'PLAYING' | 'REVEAL' | 'SCORE';

const ALL_GENRES: Genre[] = ['action', 'disney', 'horror', 'romance', 'comedy', 'anime', 'tv'];
const MIN_PER_GENRE = 20;

// ── Confetti ──────────────────────────────────────────────────
const Confetti: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;
  return (
    <div className="mv-confetti" aria-hidden>
      {Array.from({ length: 20 }, (_, i) => (
        <div key={i} className={`mv-cp mv-cp-${i % 6}`}
          style={{ '--i': i } as React.CSSProperties} />
      ))}
    </div>
  );
};

// ── Blank display ─────────────────────────────────────────────
const buildBlanks = (answer: string, hints: string[]): string =>
  answer.split('').map(ch =>
    ch === ' ' ? '  ' : hints.includes(ch.toUpperCase()) ? ch.toUpperCase() : '_'
  ).join(' ');

// ── Main ──────────────────────────────────────────────────────
const MovieGame: React.FC = () => {
  const {
    players, sharedState, setSharedState,
    isHost, currentPlayerId, mode,
  } = useMultiplayer();

  // Local state — never shared, resets per movie
  const [guess,       setGuess]       = useState('');
  const [inputState,  setInputState]  = useState<'idle'|'correct'|'wrong'>('idle');
  const [shakeKey,    setShakeKey]    = useState(0);
  const [timeLeft,    setTimeLeft]    = useState(0);
  const [confetti,    setConfetti]    = useState(false);
  const [hints,       setHints]       = useState<string[]>([]);
  const [hintsUsed,   setHintsUsed]   = useState(0);

  // Settings state (host only, used before game starts)
  const [selGenres,   setSelGenres]   = useState<Genre[]>(['action', 'disney', 'comedy']);
  const [gameDuration, setGameDuration] = useState(120); // seconds total

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const isPassPlay = mode === 'local';

  // ── Shared state destructuring ────────────────────────────
  const phase        = (sharedState?.phase       ?? 'SETTINGS') as Phase;
  const currentIndex = (sharedState?.currentIndex ?? 0)         as number;
  const scores       = (sharedState?.scores      ?? {})         as Record<string, number>;
  const endTime      = (sharedState?.endTime     ?? 0)          as number;
  const gameMovies   = (sharedState?.gameMovies  ?? [])         as MovieEntry[];
  const revealedAns  = (sharedState?.revealedAnswer ?? '')      as string;
  const roundWinner  = (sharedState?.roundWinner ?? '')         as string;
  const ppTurn       = (sharedState?.ppTurn      ?? 0)          as number;

  const movie = gameMovies[currentIndex];
  const myTurn = !isPassPlay || (players[ppTurn]?.id === currentPlayerId);

  // ── Reset local on new movie ──────────────────────────────
  useEffect(() => {
    setGuess('');
    setInputState('idle');
    setHints([]);
    setHintsUsed(0);
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

  // ── Auto advance after REVEAL (pass & play: host taps Next) ─
  useEffect(() => {
    if (phase !== 'REVEAL' || !isHost || isPassPlay) return;
    const t = setTimeout(advanceMovie, 3000);
    return () => clearTimeout(t);
  }, [phase, isHost, isPassPlay]);

  const advanceMovie = useCallback(async () => {
    const next = currentIndex + 1;
    if (next >= gameMovies.length) {
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
  }, [currentIndex, gameMovies.length, ppTurn, players.length]);

  // ── Start game ────────────────────────────────────────────
  const startGame = async () => {
    if (!isHost || selGenres.length === 0) return;
    resetMoviePool();
    const initScores: Record<string, number> = {};
    players.forEach(p => { initScores[p.id] = 0; });
    // Load plenty of movies — we'll just run until time or movies run out
    const movies = getMoviesByGenres(selGenres, Math.min(selGenres.length * 15, 80));
    await setSharedState({
      phase: 'PLAYING',
      currentIndex: 0,
      scores: initScores,
      gameMovies: movies,
      endTime: Date.now() + gameDuration * 1000,
      revealedAnswer: '',
      roundWinner: '',
      ppTurn: 0,
    });
  };

  // ── Guess ─────────────────────────────────────────────────
  const submitGuess = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (phase !== 'PLAYING' || !movie || !guess.trim() || !myTurn) return;

    if (checkAnswerWithAliases(guess, movie)) {
      const pts = Math.max(1, 3 - hintsUsed);
      const newScores = {
        ...scores,
        [currentPlayerId ?? '']: (scores[currentPlayerId ?? ''] ?? 0) + pts,
      };
      setInputState('correct');
      setConfetti(true);
      setTimeout(() => setConfetti(false), 1400);
      if (navigator.vibrate) navigator.vibrate([60, 30, 120]);

      await setSharedState({
        phase: isPassPlay ? 'REVEAL' : 'REVEAL',
        scores: newScores,
        revealedAnswer: movie.answer.toUpperCase(),
        roundWinner: currentPlayerId ?? '',
      });
    } else {
      setInputState('wrong');
      setShakeKey(k => k + 1);
      setGuess('');
      if (navigator.vibrate) navigator.vibrate(60);
      setTimeout(() => setInputState('idle'), 500);
    }
  };

  // ── Skip ─────────────────────────────────────────────────
  const skip = async () => {
    if (phase !== 'PLAYING' || (!isPassPlay && !isHost)) return;
    await setSharedState({
      phase: 'REVEAL',
      revealedAnswer: movie?.answer?.toUpperCase() ?? '',
      roundWinner: '',
    });
  };

  // ── Hint ─────────────────────────────────────────────────
  const useHint = () => {
    if (!movie || phase !== 'PLAYING' || !myTurn) return;
    const letters = [...new Set(movie.answer.toUpperCase().replace(/\s/g, '').split(''))];
    const unrevealed = letters.filter(l => !hints.includes(l));
    if (!unrevealed.length) return;
    const pick = unrevealed[Math.floor(Math.random() * unrevealed.length)];
    setHints(h => [...h, pick]);
    setHintsUsed(n => n + 1);
  };

  const toggleGenre = (g: Genre) =>
    setSelGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  // ── Guard ─────────────────────────────────────────────────
  if (!players.length) {
    return (
      <div className="mv-container">
        <div className="mv-center">
          <div className="mv-lobby-icon">🍿</div>
          <h1 className="mv-logo">GUESS THE MOVIE</h1>
          <a href="/lobby?game=movie" className="mv-btn mv-btn-start">Go to Lobby</a>
        </div>
      </div>
    );
  }

  const timerColor  = timeLeft > 30 ? '#00e5ff' : timeLeft > 10 ? '#ffd600' : '#ff1744';
  const timerPanic  = timeLeft <= 10 && timeLeft > 0 && phase === 'PLAYING';
  const blanks      = movie ? buildBlanks(movie.answer, hints) : '';
  const currentTurnPlayer = players[ppTurn];

  // ─────────────────────── RENDERS ─────────────────────────

  // Settings (replaces old LOBBY phase inside game)
  const renderSettings = () => (
    <div className="mv-center fade-up">
      <div className="mv-lobby-icon">🍿</div>
      <h1 className="mv-logo">GUESS THE<br/>MOVIE</h1>
      <p className="mv-sub">Decode the emojis. Race the clock.</p>

      <div className="mv-players">
        {players.map(p => (
          <span key={p.id} className="mv-player-chip">
            {p.isHost && '👑 '}{p.name}
          </span>
        ))}
      </div>

      {isHost ? (
        <div className="mv-settings-card">
          {/* Genre picker */}
          <div className="mv-settings-section">
            <p className="mv-settings-label">Pick genres <span>(select at least one)</span></p>
            <div className="mv-genre-grid">
              {ALL_GENRES.map(g => {
                const count = getGenreCount(g);
                const hasEnough = count >= MIN_PER_GENRE;
                const active = selGenres.includes(g);
                return (
                  <button
                    key={g}
                    className={`mv-genre-btn ${active ? 'active' : ''} ${!hasEnough ? 'disabled' : ''}`}
                    onClick={() => hasEnough && toggleGenre(g)}
                    disabled={!hasEnough}
                  >
                    <span className="mv-genre-name">{GENRE_LABELS[g]}</span>
                    <span className="mv-genre-count">{count} movies</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time limit */}
          <div className="mv-settings-section">
            <p className="mv-settings-label">
              Time limit <span className="mv-settings-val">{gameDuration}s
                ({Math.floor(gameDuration / 60)}:{String(gameDuration % 60).padStart(2, '0')})</span>
            </p>
            <input type="range" min="60" max="300" step="30"
              value={gameDuration}
              onChange={e => setGameDuration(+e.target.value)}
              className="mv-slider"
            />
            <div className="mv-slider-labels">
              <span>1 min</span><span>3 min</span><span>5 min</span>
            </div>
          </div>

          <div className="mv-rules">
            <div className="mv-rule"><span>⏱️</span>Race the clock — guess as many as possible</div>
            <div className="mv-rule"><span>🎯</span>Correct = +3 pts (−1 per hint used)</div>
            <div className="mv-rule"><span>💡</span>Hint reveals one letter</div>
            <div className="mv-rule"><span>⏭️</span>Skip to move on, no points</div>
          </div>

          <button
            className="mv-btn mv-btn-start"
            onClick={startGame}
            disabled={selGenres.length === 0}
          >
            START GAME →
          </button>
        </div>
      ) : (
        <p className="mv-waiting">Waiting for host to set up the game…</p>
      )}

      <a href="/" className="mv-exit">← Exit to Hub</a>
    </div>
  );

  const renderPlaying = () => {
    if (!movie) return null;
    return (
      <div className="mv-playing">
        <Confetti active={confetti} />

        {/* Header */}
        <div className="mv-header">
          <div className="mv-stat">
            <span className="mv-stat-label">MOVIE</span>
            <span className="mv-stat-val">{currentIndex + 1}</span>
          </div>

          <div className={`mv-timer ${timerPanic ? 'panic' : ''}`}
            style={{ color: timerColor, borderColor: timerColor }}>
            <span className="mv-timer-num">{timeLeft}</span>
            <span className="mv-timer-label">SEC</span>
          </div>

          <div className="mv-stat">
            <span className="mv-stat-label">MY PTS</span>
            <span className="mv-stat-val mv-cyan">{scores[currentPlayerId ?? ''] ?? 0}</span>
          </div>
        </div>

        {/* Pass & play turn */}
        {isPassPlay && (
          <div className={`mv-turn-banner ${myTurn ? 'my-turn' : ''}`}>
            {myTurn
              ? '👉 Your turn — everyone else look away!'
              : `👀 ${currentTurnPlayer?.name ?? '?'}'s turn`}
          </div>
        )}

        {/* Emoji cards */}
        <div className="mv-emoji-stage">
          {Array.from(movie.emojis).map((ch, i) => (
            <div key={`${currentIndex}-${i}`} className="mv-emoji-card"
              style={{ animationDelay: `${i * 55}ms` }}>
              <span className="mv-emoji-char">{ch}</span>
            </div>
          ))}
        </div>

        {/* Letter blanks */}
        <div className="mv-blanks">{blanks}</div>

        {/* Hint */}
        <div className="mv-hint-row">
          <button className="mv-hint-btn" onClick={useHint}
            disabled={!myTurn || !hints.length && hintsUsed === 0
              ? false
              : hints.length >= movie.answer.replace(/\s/g,'').length}>
            💡 Hint{hintsUsed > 0 ? ` (${hintsUsed} used · −${hintsUsed}pt)` : ''}
          </button>
        </div>

        {/* Guess form */}
        <form className="mv-guess-form" onSubmit={submitGuess} autoComplete="off">
          <div className={`mv-input-wrap ${inputState}`} key={shakeKey}>
            <input
              ref={inputRef}
              type="text"
              className="mv-input"
              placeholder={myTurn ? 'Type the movie name…' : `${currentTurnPlayer?.name ?? '?'}'s turn`}
              value={guess}
              onChange={e => setGuess(e.target.value)}
              disabled={!myTurn || phase !== 'PLAYING'}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="words"
              spellCheck={false}
            />
            {inputState === 'correct' && <div className="mv-badge correct">✓ CORRECT!</div>}
            {inputState === 'wrong'   && <div className="mv-badge wrong">✗ WRONG</div>}
          </div>

          <div className="mv-actions">
            <button type="button" className="mv-btn mv-btn-skip" onClick={skip}
              disabled={!isPassPlay && !isHost}>
              ⏭ Skip
            </button>
            <button type="submit" className="mv-btn mv-btn-guess"
              disabled={!myTurn || !guess.trim()}>
              GUESS →
            </button>
          </div>
        </form>

        {/* Live leaderboard */}
        <div className="mv-live-board">
          {players.slice().sort((a,b) => (scores[b.id]??0) - (scores[a.id]??0)).map(p => (
            <div key={p.id} className={`mv-live-row ${p.id === currentPlayerId ? 'me' : ''}`}>
              <span className="mv-live-name">{p.name}</span>
              <span className="mv-live-pts">{scores[p.id] ?? 0}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderReveal = () => {
    const winner = players.find(p => p.id === roundWinner);
    return (
      <div className="mv-reveal fade-up">
        <Confetti active={!!winner} />

        <div className={`mv-reveal-result ${winner ? 'win' : 'miss'}`}>
          <span className="mv-reveal-icon">{winner ? '🎉' : '⏭️'}</span>
          <h2>{winner ? `${winner.name} got it!` : 'Skipped!'}</h2>
        </div>

        <p className="mv-reveal-label">The answer was</p>
        <div className="mv-reveal-answer">{revealedAns}</div>

        {movie && (
          <div className="mv-reveal-emojis">
            {Array.from(movie.emojis).map((ch, i) => (
              <span key={i} className="mv-reveal-emoji">{ch}</span>
            ))}
          </div>
        )}

        {isPassPlay ? (
          <button className="mv-btn mv-btn-start" onClick={advanceMovie}>
            {currentIndex + 1 >= gameMovies.length ? 'See Scores →' : 'Next Movie →'}
          </button>
        ) : (
          <>
            <div className="mv-reveal-bar"><div className="mv-reveal-fill" /></div>
            <p className="mv-reveal-next">Next in 3s…</p>
          </>
        )}
      </div>
    );
  };

  const renderScore = () => {
    const sorted = players.slice().sort((a, b) => (scores[b.id]??0) - (scores[a.id]??0));
    const medals = ['🥇','🥈','🥉'];
    return (
      <div className="mv-score fade-up">
        <div className="mv-score-trophy">🏆</div>
        <h1 className="mv-score-title">TIME'S UP!</h1>
        <p className="mv-score-sub">{currentIndex + 1} movies guessed</p>

        <div className="mv-score-list">
          {sorted.map((p, i) => (
            <div key={p.id}
              className={`mv-score-row ${i === 0 ? 'gold' : ''} ${p.id === currentPlayerId ? 'me' : ''}`}
              style={{ animationDelay: `${i * 0.1}s` }}>
              <span className="mv-score-medal">{medals[i] ?? `#${i+1}`}</span>
              <span className="mv-score-name">{p.name}</span>
              <span className="mv-score-pts">{scores[p.id] ?? 0} pts</span>
            </div>
          ))}
        </div>

        {isHost ? (
          <button className="mv-btn mv-btn-start"
            onClick={() => setSharedState({ phase: 'SETTINGS' })}>
            PLAY AGAIN
          </button>
        ) : (
          <p className="mv-waiting">Waiting for host…</p>
        )}

        <a href="/" className="mv-exit">← Exit to Hub</a>
      </div>
    );
  };

  return (
    <div className={`mv-container mv-phase-${phase.toLowerCase()}`}>
      <div className="mv-bg-orb mv-orb-1" />
      <div className="mv-bg-orb mv-orb-2" />

      {phase === 'SETTINGS' && renderSettings()}
      {phase === 'PLAYING'  && renderPlaying()}
      {phase === 'REVEAL'   && renderReveal()}
      {phase === 'SCORE'    && renderScore()}
    </div>
  );
};

export default MovieGame;