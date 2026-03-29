import React, { useState, useEffect } from 'react';
import { useMultiplayer } from '../../context/MultiplayerContext';
import './Hangman.css';

// ─────────────────────────────────────────────────────────────
//  HANGMAN — ROOM 37
//  Turn-based multiplayer. Letters + 2 full-word guesses per turn.
//  Hangman completes → round over. Word guesser wins, rest get penalties.
//  Penalties are random: physical / drink / points. You never know what's coming.
// ─────────────────────────────────────────────────────────────

const WORDS = [
  'TITANIC','AVATAR','FROZEN','SHREK','BATMAN','SPIDERMAN','STAR WARS','INCEPTION',
  'GLADIATOR','JURASSIC','TOP GUN','JOHN WICK','MATRIX','BRAVE','TOY STORY',
  'FINDING NEMO','THE LION KING','THE HOBBIT','HARRY POTTER','BLACK PANTHER',
  'ELEPHANT','GIRAFFE','PENGUIN','DOLPHIN','BUTTERFLY','CROCODILE','FLAMINGO',
  'HAMSTER','KOALA','PANDA','TIGER','ZEBRA','MONKEY','EAGLE','CHAMELEON',
  'AUSTRALIA','BRAZIL','JAPAN','EGYPT','ICELAND','PARIS','LONDON','DUBAI',
  'KENYA','HAWAII','GERMANY','FRANCE','SPAIN','MEXICO','THAILAND','MOROCCO',
  'UMBRELLA','BICYCLE','GUITAR','CAMERA','TELESCOPE','HEADPHONES','BACKPACK',
  'LAPTOP','SATELLITE','HELICOPTER','SUBMARINE','ROCKET','MOTORCYCLE','PIANO',
  'SKYDIVING','SURFING','CLIMBING','COOKING','PAINTING','DANCING','BOXING',
  'WRESTLING','FISHING','HIKING','SNORKELING','SKIING','BOWLING','ARCHERY',
];

const PENALTIES = [
  // Physical
  { text: 'Do 10 jumping jacks', type: 'physical' },
  { text: 'Do 5 pushups', type: 'physical' },
  { text: 'Sing the chorus of any song', type: 'physical' },
  { text: 'Do your best dance move for 10 seconds', type: 'physical' },
  { text: 'Talk in an accent for the next round', type: 'physical' },
  { text: 'Do 10 squats', type: 'physical' },
  { text: 'Act like a chicken for 5 seconds', type: 'physical' },
  { text: 'Do a dramatic reading of any text on your phone', type: 'physical' },
  { text: 'Hold a plank for 15 seconds', type: 'physical' },
  { text: 'Swap seats with the person next to you', type: 'physical' },
  { text: 'Speak only in questions for the next round', type: 'physical' },
  // Drink
  { text: 'Take a sip', type: 'drink' },
  { text: 'Take two sips', type: 'drink' },
  { text: 'Finish your drink', type: 'drink' },
  { text: 'Give out 3 sips to anyone', type: 'drink' },
  { text: 'Waterfall — everyone drinks until you stop', type: 'drink' },
  { text: 'Take a sip and pour one for the person on your left', type: 'drink' },
  // Points
  { text: 'Lose 2 points', type: 'points' },
  { text: 'Lose 3 points', type: 'points' },
  { text: 'Give 1 point to the round winner', type: 'points' },
  { text: 'Lose 1 point and take a sip', type: 'points' },
];

const PENALTY_ICONS: Record<string, string> = {
  physical: '💪',
  drink: '🍺',
  points: '📉',
};

const MAX_WRONG = 6;
const TOTAL_ROUNDS = 8;
const WORD_GUESS_CHANCES = 2;

type Phase = 'LOBBY' | 'PLAYING' | 'WORD_GUESS' | 'PENALTY_REEL' | 'ROUND_END' | 'GAME_OVER';

interface Penalty { text: string; type: string; }

interface HangmanState {
  phase: Phase;
  word: string;
  words: string[];
  guessedLetters: string[];
  currentRound: number;
  currentTurnIndex: number;       // index into players array
  wordGuessChances: number;       // chances left for current player
  scores: Record<string, number>;
  penalties: Record<string, Penalty[]>;
  roundWinner: string | null;
  roundPenaltyPlayers: string[];  // ids who get a penalty this round
  revealedPenalties: Record<string, Penalty>; // id → their penalty this round
  lastWrongGuess: string;
}

const DEFAULT_STATE: HangmanState = {
  phase: 'LOBBY',
  word: '',
  words: [],
  guessedLetters: [],
  currentRound: 0,
  currentTurnIndex: 0,
  wordGuessChances: WORD_GUESS_CHANCES,
  scores: {},
  penalties: {},
  roundWinner: null,
  roundPenaltyPlayers: [],
  revealedPenalties: {},
  lastWrongGuess: '',
};

const randomPenalty = (): Penalty => PENALTIES[Math.floor(Math.random() * PENALTIES.length)];

// ─── Hangman SVG ───────────────────────────────────────────────
const HangmanFigure: React.FC<{ wrong: number; won: boolean }> = ({ wrong, won }) => (
  <svg viewBox="0 0 200 240" className="hangman-svg" aria-hidden="true">
    {/* Gallows */}
    <line x1="20" y1="225" x2="100" y2="225" className="gallows" />
    <line x1="60" y1="225" x2="60" y2="15"  className="gallows" />
    <line x1="60" y1="15"  x2="140" y2="15" className="gallows" />
    <line x1="140" y1="15" x2="140" y2="45" className="gallows" />
    {/* Rope */}
    <line x1="140" y1="45" x2="140" y2="58" className="gallows rope" />
    {/* Body parts */}
    <circle cx="140" cy="75" r="18"
      className={`body-part head ${wrong >= 1 ? 'visible' : ''}`} />
    <line x1="140" y1="93"  x2="140" y2="148"
      className={`body-part body ${wrong >= 2 ? 'visible' : ''}`} />
    <line x1="140" y1="110" x2="112" y2="132"
      className={`body-part arm ${wrong >= 3 ? 'visible' : ''}`} />
    <line x1="140" y1="110" x2="168" y2="132"
      className={`body-part arm ${wrong >= 4 ? 'visible' : ''}`} />
    <line x1="140" y1="148" x2="118" y2="188"
      className={`body-part leg ${wrong >= 5 ? 'visible' : ''}`} />
    <line x1="140" y1="148" x2="162" y2="188"
      className={`body-part leg ${wrong >= 6 ? 'visible' : ''}`} />
    {/* Dead face */}
    {wrong >= 6 && !won && (
      <g className="dead-face">
        <line x1="130" y1="68" x2="138" y2="76" className="face-feature" />
        <line x1="138" y1="68" x2="130" y2="76" className="face-feature" />
        <line x1="142" y1="68" x2="150" y2="76" className="face-feature" />
        <line x1="150" y1="68" x2="142" y2="76" className="face-feature" />
        <path d="M130 86 Q140 80 150 86" className="face-feature" />
      </g>
    )}
    {/* Happy face */}
    {won && (
      <g className="happy-face">
        <circle cx="133" cy="71" r="3" className="face-dot" />
        <circle cx="147" cy="71" r="3" className="face-dot" />
        <path d="M130 80 Q140 90 150 80" className="face-feature happy" />
      </g>
    )}
  </svg>
);

// ─── Penalty Reel ─────────────────────────────────────────────
const PenaltyReel: React.FC<{
  penaltyPlayers: string[];
  revealed: Record<string, Penalty>;
  players: { id: string; name: string }[];
  winner: string | null;
  onDone: () => void;
  isHost: boolean;
}> = ({ penaltyPlayers, revealed, players, winner, onDone, isHost }) => {
  const [step, setStep] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [currentDisplay, setCurrentDisplay] = useState('???');

  const penaltyList = Object.entries(revealed);
  const current = penaltyList[step];
  const player = players.find(p => p.id === current?.[0]);
  const penalty = current?.[1];
  const isLast = step >= penaltyList.length - 1;

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    let count = 0;
    const interval = setInterval(() => {
      setCurrentDisplay(PENALTIES[Math.floor(Math.random() * PENALTIES.length)].text);
      count++;
      if (count > 14) {
        clearInterval(interval);
        setCurrentDisplay(penalty?.text ?? '');
        setSpinning(false);
      }
    }, 80);
  };

  if (!current) return null;

  return (
    <div className="penalty-reel">
      <div className="reel-header">
        <span className="reel-emoji">🎰</span>
        <h2 className="reel-title">PENALTY REEL</h2>
        <p className="reel-sub">
          {penaltyList.length} player{penaltyList.length > 1 ? 's' : ''} pay the price
        </p>
      </div>

      <div className="reel-player-name">{player?.name}</div>

      <div className={`reel-slot ${spinning ? 'spinning' : penalty ? 'settled' : ''}`}>
        <div className="reel-icon">
          {spinning ? '🎰' : penalty ? PENALTY_ICONS[penalty.type] : '❓'}
        </div>
        <div className="reel-text">
          {spinning ? currentDisplay : penalty ? penalty.text : 'Press spin'}
        </div>
        {penalty && (
          <div className={`reel-badge reel-badge-${penalty.type}`}>
            {penalty.type.toUpperCase()}
          </div>
        )}
      </div>

      {!spinning && (
        <button className="hm-btn hm-btn-spin" onClick={spin}>
          {currentDisplay === '???' ? '🎰 SPIN' : '🔄 SPIN AGAIN'}
        </button>
      )}

      {!spinning && penalty && (
        <button
          className="hm-btn hm-btn-next"
          onClick={() => {
            if (isLast) onDone();
            else { setStep(s => s + 1); setCurrentDisplay('???'); }
          }}
        >
          {isLast ? 'SEE RESULTS →' : `NEXT PENALTY (${step + 1}/${penaltyList.length})`}
        </button>
      )}

      <div className="reel-progress">
        {penaltyList.map((_, i) => (
          <div key={i} className={`reel-pip ${i <= step ? 'done' : ''}`} />
        ))}
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────
const HangmanGame: React.FC = () => {
  const { players, sharedState, setSharedState, isHost, currentPlayerId } = useMultiplayer();

  const [wordGuessInput, setWordGuessInput] = useState('');
  const [wrongFlash, setWrongFlash] = useState(false);
  const [correctFlash, setCorrectFlash] = useState(false);

  if (players.length === 0) {
    return (
      <div className="hm-container">
        <div className="hm-lobby">
          <h2>Enter via Lobby</h2>
          <a href="/lobby?game=hangman" className="hm-exit">Go to Lobby</a>
        </div>
      </div>
    );
  }

  const gs: HangmanState = { ...DEFAULT_STATE, ...sharedState };
  const {
    phase, word, words, guessedLetters, currentRound,
    currentTurnIndex, wordGuessChances, scores, penalties,
    roundWinner, roundPenaltyPlayers, revealedPenalties, lastWrongGuess,
  } = gs;

  const wrongCount   = guessedLetters.filter(l => !word.includes(l)).length;
  const isWordDone   = word.length > 0 && word.split('').filter(l => l !== ' ').every(l => guessedLetters.includes(l));
  const isHangmanDead = wrongCount >= MAX_WRONG;

  const currentPlayer = players[currentTurnIndex] ?? players[0];
  const isMyTurn      = currentPlayer?.id === currentPlayerId;
  const isSinglePlayer = players.length === 1;

  // Flash effects
  useEffect(() => {
    if (lastWrongGuess) {
      setWrongFlash(true);
      if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
      setTimeout(() => setWrongFlash(false), 600);
    }
  }, [lastWrongGuess, wrongCount]);

  // ── Actions ────────────────────────────────────────────────

  const startGame = async () => {
    if (!isHost) return;
    const initScores: Record<string, number> = {};
    const initPenalties: Record<string, Penalty[]> = {};
    players.forEach(p => { initScores[p.id] = 0; initPenalties[p.id] = []; });

    const shuffled = [...WORDS].sort(() => Math.random() - 0.5).slice(0, TOTAL_ROUNDS);
    await setSharedState({
      ...DEFAULT_STATE,
      phase: 'PLAYING',
      word: shuffled[0],
      words: shuffled,
      currentRound: 0,
      currentTurnIndex: 0,
      wordGuessChances: WORD_GUESS_CHANCES,
      scores: initScores,
      penalties: initPenalties,
    });
  };

  const guessLetter = async (letter: string) => {
    if (phase !== 'PLAYING') return;
    if (!isSinglePlayer && !isMyTurn) return;
    if (guessedLetters.includes(letter)) return;

    const newGuessed = [...guessedLetters, letter];
    const isCorrect  = word.includes(letter);
    const newWrong   = newGuessed.filter(l => !word.includes(l)).length;
    const wordNowDone = word.split('').filter(l => l !== ' ').every(l => newGuessed.includes(l));

    if (wordNowDone) {
      // Word complete — current player wins
      const newScores = { ...scores, [currentPlayer.id]: (scores[currentPlayer.id] ?? 0) + 3 };
      const losers    = players.filter(p => p.id !== currentPlayer.id).map(p => p.id);
      const revealed  = buildRevealedPenalties(losers);
      await setSharedState({
        guessedLetters: newGuessed,
        scores: newScores,
        roundWinner: currentPlayer.id,
        roundPenaltyPlayers: losers,
        revealedPenalties: revealed,
        lastWrongGuess: '',
        phase: losers.length > 0 ? 'PENALTY_REEL' : 'ROUND_END',
      });
      setCorrectFlash(true);
      setTimeout(() => setCorrectFlash(false), 800);
      if (navigator.vibrate) navigator.vibrate([200, 80, 200]);
      return;
    }

    if (newWrong >= MAX_WRONG) {
      // Hangman dead — everyone gets penalty
      const allIds   = players.map(p => p.id);
      const revealed = buildRevealedPenalties(allIds);
      await setSharedState({
        guessedLetters: newGuessed,
        roundWinner: null,
        roundPenaltyPlayers: allIds,
        revealedPenalties: revealed,
        lastWrongGuess: isCorrect ? '' : letter,
        phase: 'PENALTY_REEL',
      });
      return;
    }

    // Normal guess — advance turn if multiplayer
    const nextTurn = isSinglePlayer
      ? currentTurnIndex
      : (currentTurnIndex + 1) % players.length;

    await setSharedState({
      guessedLetters: newGuessed,
      currentTurnIndex: nextTurn,
      lastWrongGuess: isCorrect ? '' : letter,
    });
  };

  const submitWordGuess = async () => {
    if (phase !== 'WORD_GUESS') return;
    const guess   = wordGuessInput.trim().toUpperCase();
    const correct = guess === word;
    setWordGuessInput('');

    if (correct) {
      const newScores = { ...scores, [currentPlayer.id]: (scores[currentPlayer.id] ?? 0) + 2 };
      const losers    = players.filter(p => p.id !== currentPlayer.id).map(p => p.id);
      const revealed  = buildRevealedPenalties(losers);
      if (navigator.vibrate) navigator.vibrate([200, 80, 200]);
      await setSharedState({
        scores: newScores,
        roundWinner: currentPlayer.id,
        roundPenaltyPlayers: losers,
        revealedPenalties: revealed,
        phase: losers.length > 0 ? 'PENALTY_REEL' : 'ROUND_END',
        lastWrongGuess: '',
      });
    } else {
      // Used a chance
      const chancesLeft = wordGuessChances - 1;
      if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
      if (chancesLeft <= 0) {
        // Out of chances — penalty for guesser, back to letters
        const newPenalties = { ...penalties };
        const p = randomPenalty();
        newPenalties[currentPlayer.id] = [...(newPenalties[currentPlayer.id] ?? []), p];
        const nextTurn = isSinglePlayer ? currentTurnIndex : (currentTurnIndex + 1) % players.length;
        await setSharedState({
          phase: 'PLAYING',
          wordGuessChances: WORD_GUESS_CHANCES,
          penalties: newPenalties,
          currentTurnIndex: nextTurn,
          lastWrongGuess: '',
        });
      } else {
        await setSharedState({ wordGuessChances: chancesLeft });
      }
    }
  };

  const buildRevealedPenalties = (ids: string[]): Record<string, Penalty> => {
    const out: Record<string, Penalty> = {};
    ids.forEach(id => { out[id] = randomPenalty(); });
    return out;
  };

  const afterPenaltyReel = async () => {
    // Store penalties in accumulated list
    const newPenalties = { ...penalties };
    Object.entries(revealedPenalties).forEach(([id, pen]) => {
      newPenalties[id] = [...(newPenalties[id] ?? []), pen];
    });
    await setSharedState({ penalties: newPenalties, phase: 'ROUND_END' });
  };

  const nextRound = async () => {
    if (!isHost) return;
    const next = currentRound + 1;
    if (next >= words.length) {
      await setSharedState({ phase: 'GAME_OVER' });
      return;
    }
    const nextTurn = (currentTurnIndex + 1) % players.length;
    await setSharedState({
      phase: 'PLAYING',
      word: words[next],
      guessedLetters: [],
      currentRound: next,
      currentTurnIndex: nextTurn,
      wordGuessChances: WORD_GUESS_CHANCES,
      roundWinner: null,
      roundPenaltyPlayers: [],
      revealedPenalties: {},
      lastWrongGuess: '',
    });
  };

  const playAgain = async () => {
    if (!isHost) return;
    const initScores: Record<string, number> = {};
    const initPenalties: Record<string, Penalty[]> = {};
    players.forEach(p => { initScores[p.id] = 0; initPenalties[p.id] = []; });
    const shuffled = [...WORDS].sort(() => Math.random() - 0.5).slice(0, TOTAL_ROUNDS);
    await setSharedState({
      ...DEFAULT_STATE,
      phase: 'PLAYING',
      word: shuffled[0],
      words: shuffled,
      scores: initScores,
      penalties: initPenalties,
    });
  };

  // ── Display word ──────────────────────────────────────────
  const displayWord = word
    .split('')
    .map(l => l === ' ' ? ' ' : guessedLetters.includes(l) ? l : '_')
    .join(' ');

  // ── Renders ───────────────────────────────────────────────

  const renderLobby = () => (
    <div className="hm-lobby fade-up">
      <div className="hm-lobby-icon">⚡</div>
      <h1 className="hm-logo">HANGMAN</h1>
      <p className="hm-sub">Guess the word. Letter by letter. Or risk it all.</p>

      <div className="hm-players">
        {players.map(p => (
          <span key={p.id} className="hm-player-chip">
            {p.isHost && '👑 '}{p.name}
          </span>
        ))}
      </div>

      <div className="hm-rules">
        <div className="hm-rule"><span>🔤</span> Guess letters to reveal the word</div>
        <div className="hm-rule"><span>💬</span> 2 full-word guesses per turn</div>
        <div className="hm-rule"><span>💀</span> 6 wrong letters = hangman dies</div>
        <div className="hm-rule"><span>🎰</span> Losers spin the penalty reel</div>
      </div>

      {isHost ? (
        <button className="hm-btn hm-btn-start" onClick={startGame}>
          START GAME
        </button>
      ) : (
        <p className="hm-waiting">Waiting for host to start…</p>
      )}
      <a href="/" className="hm-exit">← Exit to Hub</a>
    </div>
  );

  const renderPlaying = () => (
    <div className={`hm-playing ${wrongFlash ? 'flash-wrong' : ''} ${correctFlash ? 'flash-correct' : ''}`}>
      {/* Header */}
      <div className="hm-header">
        <div className="hm-stat">
          <span className="hm-stat-label">ROUND</span>
          <span className="hm-stat-val">{currentRound + 1}/{words.length}</span>
        </div>
        <div className="hm-turn-pill">
          {isSinglePlayer ? '⚡ SOLO' : isMyTurn ? '👉 YOUR TURN' : `${currentPlayer?.name}'s turn`}
        </div>
        <div className="hm-stat">
          <span className="hm-stat-label">SCORE</span>
          <span className="hm-stat-val hm-stat-green">{scores[currentPlayerId ?? ''] ?? 0}</span>
        </div>
      </div>

      {/* Hangman */}
      <div className="hm-figure-wrap">
        <HangmanFigure wrong={wrongCount} won={isWordDone} />
        <div className="hm-wrong-counter">
          {Array.from({ length: MAX_WRONG }).map((_, i) => (
            <div key={i} className={`hm-wrong-pip ${i < wrongCount ? 'lit' : ''}`} />
          ))}
        </div>
      </div>

      {/* Word display */}
      <div className="hm-word-wrap">
        <div className="hm-word">{displayWord}</div>
        <div className="hm-word-hint">{word.length} letters</div>
      </div>

      {/* Letter grid */}
      <div className="hm-letters">
        {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => {
          const used    = guessedLetters.includes(l);
          const correct = used && word.includes(l);
          const wrong   = used && !word.includes(l);
          const active  = !used && (isSinglePlayer || isMyTurn) && phase === 'PLAYING';
          return (
            <button
              key={l}
              className={`hm-letter ${correct ? 'correct' : ''} ${wrong ? 'wrong' : ''} ${active ? 'active' : ''}`}
              onClick={() => active && guessLetter(l)}
              disabled={used || (!isSinglePlayer && !isMyTurn)}
            >{l}</button>
          );
        })}
      </div>

      {/* Word guess button */}
      {(isSinglePlayer || isMyTurn) && (
        <button
          className="hm-btn hm-btn-word-guess"
          onClick={() => setSharedState({ ...gs, phase: 'WORD_GUESS' })}
        >
          💬 Guess Full Word ({wordGuessChances} left)
        </button>
      )}
    </div>
  );

  const renderWordGuess = () => (
    <div className="hm-word-guess-screen fade-up">
      <div className="hm-wg-header">
        <span className="hm-wg-icon">💬</span>
        <h2>Full Word Guess</h2>
        <p>{wordGuessChances} chance{wordGuessChances !== 1 ? 's' : ''} remaining</p>
      </div>

      <div className="hm-word hm-word-sm">{displayWord}</div>

      <div className="hm-wg-input-wrap">
        <input
          className="hm-wg-input"
          type="text"
          placeholder="Type the word…"
          value={wordGuessInput}
          onChange={e => setWordGuessInput(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && submitWordGuess()}
          autoFocus
          autoCapitalize="characters"
        />
        <button className="hm-btn hm-btn-submit" onClick={submitWordGuess}>
          SUBMIT →
        </button>
      </div>

      <button className="hm-back-link" onClick={() => setSharedState({ ...gs, phase: 'PLAYING' })}>
        ← Back to letters
      </button>
    </div>
  );

  const renderRoundEnd = () => {
    const winner = players.find(p => p.id === roundWinner);
    return (
      <div className="hm-round-end fade-up">
        <div className="hm-re-result">
          {winner ? (
            <>
              <span className="hm-re-icon">🎉</span>
              <h2 className="hm-re-title win">{winner.name} got it!</h2>
            </>
          ) : (
            <>
              <span className="hm-re-icon">💀</span>
              <h2 className="hm-re-title lose">Nobody got it</h2>
            </>
          )}
        </div>

        <div className="hm-re-word">
          <span className="hm-re-word-label">The word was</span>
          <span className="hm-re-word-text">{word}</span>
        </div>

        {/* Penalty summary for this round */}
        {roundPenaltyPlayers.length > 0 && (
          <div className="hm-re-penalties">
            <div className="hm-re-pen-title">🎰 This round's penalties</div>
            {roundPenaltyPlayers.map(id => {
              const p   = players.find(pl => pl.id === id);
              const pen = revealedPenalties[id];
              return pen ? (
                <div key={id} className="hm-re-pen-row">
                  <span className="hm-re-pen-name">{p?.name}</span>
                  <span className="hm-re-pen-text">
                    {PENALTY_ICONS[pen.type]} {pen.text}
                  </span>
                </div>
              ) : null;
            })}
          </div>
        )}

        {/* Scores */}
        <div className="hm-scores">
          {players
            .slice()
            .sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0))
            .map(p => (
              <div key={p.id} className={`hm-score-row ${p.id === currentPlayerId ? 'me' : ''}`}>
                <span>{p.name}</span>
                <span className="hm-score-pts">{scores[p.id] ?? 0} pts</span>
              </div>
            ))}
        </div>

        {isHost && (
          <button className="hm-btn hm-btn-next" onClick={nextRound}>
            {currentRound + 1 >= words.length ? 'SEE FINAL SCORES →' : 'NEXT ROUND →'}
          </button>
        )}
        {!isHost && <p className="hm-waiting">Waiting for host…</p>}
        <a href="/" className="hm-exit">← Exit to Hub</a>
      </div>
    );
  };

  const renderGameOver = () => {
    const sorted = players.slice().sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0));
    const topScore = scores[sorted[0]?.id] ?? 0;
    const winners  = sorted.filter(p => (scores[p.id] ?? 0) === topScore);
    const medals   = ['🥇', '🥈', '🥉'];

    return (
      <div className="hm-game-over fade-up">
        <div className="hm-go-trophy">🏆</div>
        <h1 className="hm-go-title">GAME OVER</h1>

        <div className="hm-go-winner">
          <span className="hm-go-winner-label">
            {winners.length > 1 ? 'DRAW' : 'WINNER'}
          </span>
          <span className="hm-go-winner-name">
            {winners.map(w => w.name).join(' & ')}
          </span>
          <span className="hm-go-winner-score">{topScore} pts</span>
        </div>

        <div className="hm-scores hm-scores-final">
          {sorted.map((p, i) => (
            <div key={p.id} className={`hm-score-row ${i === 0 ? 'gold' : ''}`}>
              <span className="hm-score-medal">{medals[i] ?? `#${i + 1}`}</span>
              <span>{p.name}</span>
              <span className="hm-score-pts">{scores[p.id] ?? 0} pts</span>
            </div>
          ))}
        </div>

        {/* All penalties accumulated */}
        {players.some(p => (penalties[p.id]?.length ?? 0) > 0) && (
          <div className="hm-go-penalties">
            <h3>🎰 Total Penalties This Game</h3>
            {players.map(p => (
              (penalties[p.id]?.length ?? 0) > 0 && (
                <div key={p.id} className="hm-go-pen-player">
                  <span className="hm-go-pen-name">{p.name} ({penalties[p.id].length}×)</span>
                  {penalties[p.id].map((pen, i) => (
                    <div key={i} className="hm-go-pen-item">
                      {PENALTY_ICONS[pen.type]} {pen.text}
                    </div>
                  ))}
                </div>
              )
            ))}
          </div>
        )}

        {isHost && (
          <button className="hm-btn hm-btn-start" onClick={playAgain}>
            PLAY AGAIN
          </button>
        )}
        <a href="/" className="hm-exit">← Exit to Hub</a>
      </div>
    );
  };

  return (
    <div className={`hm-container hm-phase-${phase.toLowerCase()} ${wrongFlash ? 'flash-wrong' : ''}`}>
      {phase === 'LOBBY'        && renderLobby()}
      {phase === 'PLAYING'      && renderPlaying()}
      {phase === 'WORD_GUESS'   && renderWordGuess()}
      {phase === 'PENALTY_REEL' && (
        <PenaltyReel
          penaltyPlayers={roundPenaltyPlayers}
          revealed={revealedPenalties}
          players={players}
          winner={roundWinner}
          onDone={afterPenaltyReel}
          isHost={isHost ?? false}
        />
      )}
      {phase === 'ROUND_END'    && renderRoundEnd()}
      {phase === 'GAME_OVER'    && renderGameOver()}
    </div>
  );
};

export default HangmanGame;