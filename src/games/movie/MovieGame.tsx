import React, { useEffect, useState } from 'react';
import { useMultiplayer } from '../../context/MultiplayerContext';
import { getRandomMovies, resetMoviePool, checkAnswerWithAliases, MovieEntry } from './MovieData';
import './Movie.css';

type Phase = 'LOBBY' | 'PLAYING' | 'REVEAL' | 'SCORE';

const MovieGame: React.FC = () => {
    const { players, sharedState, setSharedState, isHost, currentPlayerId } = useMultiplayer();

    if (!players.length) {
        return (
            <div className="movie-container">
                <div className="movie-lobby">
                    <div className="icon-bounce">🍿</div>
                    <h1 className="movie-title glow-cyan">GUESS THE MOVIE</h1>
                    <p className="movie-subtitle">Decode the emojis!</p>
                    <a href="/lobby?game=movie" className="movie-btn">Go to Lobby</a>
                </div>
            </div>
        );
    }

    const {
        phase = 'LOBBY' as Phase,
        currentIndex = 0,
        scores = {},
        endTime = 0,
        gameMovies = [] as MovieEntry[],
        revealedAnswer = '',
        hostSettings = { duration: 60, movieCount: 10 }
    } = sharedState || {};

    const [guess, setGuess] = useState('');
    const [feedback, setFeedback] = useState<'neutral' | 'correct' | 'wrong'>('neutral');
    const [timeLeft, setTimeLeft] = useState(0);
    const [emojiCards, setEmojiCards] = useState<{ id: string; char: string }[]>([]);
    const [wrongShake, setWrongShake] = useState(false);

    // Local settings only used in LOBBY by host
    const [duration, setDuration] = useState(hostSettings.duration || 60);
    const [movieCount, setMovieCount] = useState(hostSettings.movieCount || 10);

    // Sync emoji display when entering PLAYING phase
    useEffect(() => {
        if (phase === 'PLAYING' && gameMovies[currentIndex]) {
            const emojiString = gameMovies[currentIndex].emojis;
            const chars = Array.from(emojiString);
            const cards = chars.map((char, idx) => ({
                id: `emoji-${currentIndex}-${idx}`,
                char
            }));
            setEmojiCards(cards);
        } else {
            setEmojiCards([]);
        }
    }, [phase, currentIndex, gameMovies]);

    // Timer countdown during PLAYING
    useEffect(() => {
        if (phase !== 'PLAYING') return;

        const tick = () => {
            const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
            setTimeLeft(remaining);

            if (remaining <= 0 && isHost) {
                // Time expired — move to REVEAL
                const actualAnswer = gameMovies[currentIndex]?.answer.toUpperCase() || '';
                setSharedState({ phase: 'REVEAL', revealedAnswer: actualAnswer });
            }
        };

        tick();
        const interval = setInterval(tick, 500);
        return () => clearInterval(interval);
    }, [phase, endTime, isHost, setSharedState, currentIndex, gameMovies]);

    // REVEAL auto-advance
    useEffect(() => {
        if (phase !== 'REVEAL' || !isHost) return;

        const timer = setTimeout(async () => {
            const nextIndex = currentIndex + 1;
            if (nextIndex >= gameMovies.length) {
                await setSharedState({ phase: 'SCORE' });
            } else {
                await setSharedState({
                    phase: 'PLAYING',
                    currentIndex: nextIndex,
                    endTime: Date.now() + (hostSettings.duration * 1000),
                    revealedAnswer: ''
                });
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [phase, isHost, setSharedState, currentIndex, gameMovies.length, hostSettings.duration]);

    // Host: save settings to sharedState
    useEffect(() => {
        if (isHost && phase === 'LOBBY') {
            setSharedState({
                hostSettings: { duration, movieCount }
            }).catch(() => {});
        }
    }, [duration, movieCount, isHost, phase, setSharedState]);

    const applySettingsAndStart = async () => {
        if (!isHost) return;
        resetMoviePool();

        const initialScores: Record<string, number> = {};
        players.forEach(p => initialScores[p.id] = 0);

        const selectedMovies = getRandomMovies(movieCount);

        await setSharedState({
            phase: 'PLAYING',
            currentIndex: 0,
            scores: initialScores,
            gameMovies: selectedMovies,
            endTime: Date.now() + (duration * 1000),
            revealedAnswer: '',
            hostSettings: { duration, movieCount }
        });
    };

    const handleGuess = async (e: React.FormEvent) => {
        e.preventDefault();
        if (phase !== 'PLAYING' || !currentPlayerId || !guess.trim()) return;

        const currentMovie = gameMovies[currentIndex];
        if (!currentMovie) return;

        if (checkAnswerWithAliases(guess, currentMovie)) {
            setFeedback('correct');
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

            const newScore = (scores[currentPlayerId] || 0) + 1;
            const nextIndex = currentIndex + 1;

            if (nextIndex >= gameMovies.length) {
                await setSharedState({ scores: { ...scores, [currentPlayerId]: newScore }, phase: 'SCORE' });
            } else {
                await setSharedState({
                    scores: { ...scores, [currentPlayerId]: newScore },
                    currentIndex: nextIndex,
                    endTime: Date.now() + (hostSettings.duration * 1000),
                    revealedAnswer: ''
                });
            }
        } else {
            setFeedback('wrong');
            setWrongShake(true);
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
            setTimeout(() => setWrongShake(false), 500);
        }

        setTimeout(() => setFeedback('neutral'), 400);
        setGuess('');
    };

    const handlePass = async () => {
        if (phase !== 'PLAYING' || !isHost) return;
        if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
        const actualAnswer = gameMovies[currentIndex]?.answer.toUpperCase() || '';
        await setSharedState({ phase: 'REVEAL', revealedAnswer: actualAnswer });
    };

    // Timer urgency color
    const timerColor = timeLeft > 20 ? '#00d4ff' : timeLeft > 10 ? '#ffaa00' : '#ff3366';

    return (
        <div className={`movie-container state-${phase.toLowerCase()}`}>
            {/* Animated background elements */}
            <div className="movie-bg-orb orb-1"></div>
            <div className="movie-bg-orb orb-2"></div>

            {/* === LOBBY === */}
            {phase === 'LOBBY' && (
                <div className="movie-lobby">
                    <div className="icon-bounce">🍿</div>
                    <h1 className="movie-title glow-cyan">GUESS THE MOVIE</h1>
                    <p className="movie-subtitle">Decode the emojis before time runs out!</p>

                    <div className="players-list">
                        {players.map(p => (
                            <div key={p.id} className="player-tag">
                                {p.name} {p.isHost && '👑'}
                            </div>
                        ))}
                    </div>

                    {isHost ? (
                        <div className="movie-settings-panel">
                            <h3>Round Settings</h3>
                            <div className="setting-row">
                                <label>Movies per round: <strong>{movieCount}</strong></label>
                                <input
                                    type="range" min="5" max="50" step="5"
                                    value={movieCount}
                                    onChange={e => setMovieCount(parseInt(e.target.value))}
                                />
                            </div>
                            <div className="setting-row">
                                <label>Time limit: <strong>{duration}s</strong></label>
                                <input
                                    type="range" min="15" max="180" step="15"
                                    value={duration}
                                    onChange={e => setDuration(parseInt(e.target.value))}
                                />
                            </div>
                            <button className="movie-btn start" onClick={applySettingsAndStart}>
                                START MATCH
                            </button>
                        </div>
                    ) : (
                        <h3 className="blink waiting-msg">
                            Waiting for Host to configure match...
                        </h3>
                    )}

                    <a href="/" className="exit-link">Return to Hub</a>
                </div>
            )}

            {/* === PLAYING === */}
            {phase === 'PLAYING' && gameMovies.length > 0 && (
                <>
                    <div className="header-info">
                        <div className="timer-box" style={{ borderColor: timerColor }}>
                            <h2 style={{ color: timerColor }}>{timeLeft}</h2>
                            <span>SECONDS</span>
                        </div>
                        <div className="movie-progress">
                            <span className="progress-label">MOVIE</span>
                            <span className="progress-value">{currentIndex + 1}/{gameMovies.length}</span>
                        </div>
                        <div className="score-box">
                            <h2 style={{ color: '#00ffaa' }}>{scores[currentPlayerId || ''] || 0}</h2>
                            <span>YOUR SCORE</span>
                        </div>
                    </div>

                    {/* Emoji Card Display - NO FALLING PHYSICS, just elegant entrance */}
                    <div className="emoji-display-area">
                        {emojiCards.map((emoji, idx) => (
                            <div
                                key={emoji.id}
                                className="emoji-card"
                                style={{ animationDelay: `${idx * 80}ms` }}
                            >
                                <span className="emoji-char">{emoji.char}</span>
                            </div>
                        ))}
                    </div>

                    {/* Bottom input area */}
                    <div className={`movie-playbox ${wrongShake ? 'shake' : ''}`}>
                        <form className="guess-form" onSubmit={handleGuess}>
                            <input
                                type="text"
                                className={`guess-input ${feedback}`}
                                placeholder="Type movie name..."
                                value={guess}
                                onChange={e => setGuess(e.target.value)}
                                autoFocus
                                autoComplete="off"
                            />
                            <div className="action-buttons">
                                <button
                                    type="button"
                                    className="movie-btn pass"
                                    onClick={handlePass}
                                >
                                    PASS
                                </button>
                                <button type="submit" className="movie-btn submit">
                                    GUESS
                                </button>
                            </div>
                        </form>

                        <div className="leaderboard-mini">
                            {players.map(p => (
                                <span key={p.id} className="mini-score">
                                    {p.name}: {scores[p.id] || 0}
                                </span>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* === REVEAL === */}
            {phase === 'REVEAL' && (
                <div className="movie-reveal">
                    <div className="reveal-badge">TIME'S UP!</div>
                    <p className="reveal-label">The answer was...</p>
                    <h2 className="answer-text glow-cyan">{revealedAnswer}</h2>

                    {/* Show the emoji for reference */}
                    {gameMovies[currentIndex] && (
                        <div className="reveal-emojis">
                            {Array.from(gameMovies[currentIndex].emojis).map((char, i) => (
                                <span key={i} className="reveal-emoji">{char}</span>
                            ))}
                        </div>
                    )}

                    <div className="loading-bar" />
                </div>
            )}

            {/* === SCORE === */}
            {phase === 'SCORE' && (
                <div className="movie-score">
                    <div className="trophy-icon">🏆</div>
                    <h2 className="glow-cyan final-title">FINAL STANDINGS</h2>

                    <div className="final-scores">
                        {players
                            .slice()
                            .sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0))
                            .map((p, index) => (
                                <div
                                    key={p.id}
                                    className={`score-row ${index === 0 ? 'winner' : ''}`}
                                >
                                    <span className="rank">
                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                    </span>
                                    <span className="name">{p.name}</span>
                                    <span className="pts">{scores[p.id] || 0} pts</span>
                                </div>
                            ))}
                    </div>

                    {isHost ? (
                        <button
                            className="movie-btn start"
                            onClick={() => setSharedState({ phase: 'LOBBY' })}
                        >
                            CONFIGURE NEXT MATCH
                        </button>
                    ) : (
                        <p className="blink waiting-msg">Waiting for host...</p>
                    )}

                    <a href="/" className="exit-link">Quit to Hub</a>
                </div>
            )}
        </div>
    );
};

export default MovieGame;
