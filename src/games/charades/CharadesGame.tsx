import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useMultiplayer } from '../../context/MultiplayerContext';
import './Charades.css';

/* =========================================
   WORD BANK - 100+ words across categories
   ========================================= */
const WORD_CATEGORIES = {
    movies: [
        'Titanic', 'Star Wars', 'The Matrix', 'Jurassic Park', 'Batman',
        'Spider-Man', 'The Lion King', 'Harry Potter', 'Finding Nemo',
        'The Avengers', 'Frozen', 'Toy Story', 'Black Panther', 'Jaws',
        'The Godfather', 'Rocky', 'Ghostbusters', 'Home Alone', 'Shrek'
    ],
    actions: [
        'Jumping Jacks', 'Doing a Push-up', 'Swinging on a Swing', 'Climbing a Ladder',
        'Typing on Keyboard', 'Playing Guitar', 'Playing Piano', 'Taking a Selfie',
        'Riding a Bicycle', 'Swimming', 'Dancing', 'Sleeping', 'Eating Pizza',
        'Drinking Coffee', 'Reading a Book', 'Fishing', 'Skateboarding',
        'Jump Roping', 'Bowling', 'Dribbling a Basketball'
    ],
    animals: [
        'Elephant', 'Giraffe', 'Kangaroo', 'Penguin', 'Monkey', 'Snake',
        'Butterfly', 'Dolphin', 'Octopus', 'Crocodile', 'Flamingo', 'Peacock',
        'Hedgehog', 'Squirrel', 'Zebra', 'Polar Bear', 'Koala', 'Sloth'
    ],
    objects: [
        'Umbrella', 'Ladder', 'Microwave', 'Toaster', 'Television', 'Remote Control',
        'Sunglasses', 'Headphones', 'Camera', 'Bicycle', 'Guitar', 'Piano',
        'Lamp', 'Chair', 'Table', 'Laptop', 'Phone', 'Watch', 'Backpack'
    ],
    professions: [
        'Firefighter', 'Police Officer', 'Doctor', 'Chef', 'Astronaut',
        'Teacher', 'Pilot', 'Construction Worker', 'Dentist', 'Scientist',
        'Artist', 'Mechanic', 'Waiter', 'Bus Driver', 'Farmer'
    ],
    sports: [
        'Soccer', 'Basketball', 'Tennis', 'Golf', 'Boxing', 'Skiing',
        'Surfing', 'Rock Climbing', 'Weight Lifting', 'Yoga', 'Martial Arts',
        'Volleyball', 'Baseball', 'Football', 'Ice Hockey'
    ],
    food: [
        'Pizza', 'Burger', 'Spaghetti', 'Ice Cream', 'Cupcake', 'Pancakes',
        'Sushi', 'Taco', 'Hot Dog', 'Popcorn', 'Watermelon', 'Banana',
        'Spicy Pepper', 'Birthday Cake', 'Cookie'
    ],
    emotions: [
        'Happy', 'Angry', 'Scared', 'Surprised', 'Excited', 'Sad',
        'Confused', 'Proud', 'Jealous', 'Love', 'Nervous', 'Bored'
    ]
};

// Flatten all words into a single array
const ALL_WORDS = Object.values(WORD_CATEGORIES).flat();

// Fisher-Yates shuffle
const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const getRandomWord = (usedWords: Set<string>): string => {
    const available = ALL_WORDS.filter(w => !usedWords.has(w));
    if (available.length === 0) {
        // Reset if we've used all words
        return ALL_WORDS[Math.floor(Math.random() * ALL_WORDS.length)];
    }
    return available[Math.floor(Math.random() * available.length)];
};

/* =========================================
   PHASES
   ========================================= */
type Phase = 'LOBBY' | 'CHOOSING' | 'GET_READY' | 'ACTOR_REVEAL' | 'PLAYING' | 'ROUND_END' | 'SCORE';

interface WordHistoryItem {
    word: string;
    result: 'correct' | 'skip';
    timestamp: number;
}

interface OnlineGuess {
    playerId: string;
    playerName: string;
    guess: string;
    timestamp: number;
}

/* =========================================
   COMPONENT
   ========================================= */
const CharadesGame: React.FC = () => {
    const { players, sharedState, setSharedState, isHost, currentPlayerId, mode } = useMultiplayer();

    // Local state for smooth UI updates
    const [timeLeft, setTimeLeft] = useState(60);
    const [wordHistory, setWordHistory] = useState<WordHistoryItem[]>([]);
    const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
    const [onlineGuesses, setOnlineGuesses] = useState<OnlineGuess[]>([]);
    const [guessInput, setGuessInput] = useState('');
    const [showCorrectAnimation, setShowCorrectAnimation] = useState(false);
    const [showSkipAnimation, setShowSkipAnimation] = useState(false);
    const [scoreAnimation, setScoreAnimation] = useState(false);

    // Refs
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const wordRef = useRef<string>('');

    // Redirect if no players
    if (players.length === 0) {
        return (
            <div className="charades-container">
                <div className="charades-lobby">
                    <h2>Please enter via Lobby</h2>
                    <a href="/lobby?game=charades" className="exit-link">Go to Lobby</a>
                </div>
            </div>
        );
    }

    // Extract shared state with defaults
    const {
        phase = 'LOBBY',
        endTime = 0,
        currentScore = 0,
        currentWord = '',
        activePlayerId = null,
        currentRound = 1,
        totalRounds = 3
    } = sharedState || {};

    const isActivePlayer = mode === 'local' || currentPlayerId === activePlayerId;
    const activePlayerName = players.find(p => p.id === activePlayerId)?.name || 'Someone';
    const isActorView = isActivePlayer && (phase === 'ACTOR_REVEAL' || phase === 'PLAYING');

    /* =========================================
       TIMER SYNC - Runs on both client and host
       ========================================= */
    useEffect(() => {
        if (phase === 'GET_READY' || phase === 'ACTOR_REVEAL' || phase === 'PLAYING') {
            timerRef.current = setInterval(() => {
                const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
                setTimeLeft(remaining);

                // Phase transitions - only act if we're the authority
                if (remaining === 0) {
                    if (phase === 'GET_READY') {
                        // Transition to ACTOR_REVEAL (actor taps to see word)
                        if (isHost || currentPlayerId === activePlayerId) {
                            setSharedState({
                                phase: 'ACTOR_REVEAL',
                                endTime: Date.now() + 10000, // 10s to tap and show phone
                                currentWord: getRandomWord(usedWords)
                            });
                        }
                    } else if (phase === 'ACTOR_REVEAL') {
                        // Time's up for reveal - start playing
                        if (isHost || currentPlayerId === activePlayerId) {
                            setSharedState({
                                phase: 'PLAYING',
                                endTime: Date.now() + 60000
                            });
                        }
                    } else if (phase === 'PLAYING') {
                        // Round ends
                        if (isHost || currentPlayerId === activePlayerId) {
                            setSharedState({ phase: 'SCORE' });
                        }
                    }
                }
            }, 100);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [phase, endTime, isHost, currentPlayerId, activePlayerId, setSharedState, usedWords]);

    /* =========================================
       GAME ACTIONS
       ========================================= */
    const startRound = async () => {
        const newWord = getRandomWord(usedWords);
        setWordHistory([]);
        setOnlineGuesses([]);

        await setSharedState({
            phase: 'GET_READY',
            activePlayerId: currentPlayerId,
            endTime: Date.now() + 3000, // 3 second prep
            currentScore: 0,
            currentWord: newWord
        });
    };

    const handleActorReveal = async () => {
        if (phase === 'ACTOR_REVEAL' && isActivePlayer) {
            await setSharedState({
                phase: 'PLAYING',
                endTime: Date.now() + 60000
            });
        }
    };

    const handleCorrect = useCallback(async () => {
        if (phase !== 'PLAYING' || (!isActivePlayer && mode !== 'local')) return;

        const word = currentWord;
        wordRef.current = word;

        // Haptic feedback - success pattern
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }

        // Show correct animation
        setShowCorrectAnimation(true);
        setScoreAnimation(true);
        setTimeout(() => setShowCorrectAnimation(false), 500);
        setTimeout(() => setScoreAnimation(false), 400);

        // Add to history
        const newHistory = [...wordHistory, { word, result: 'correct' as const, timestamp: Date.now() }];
        setWordHistory(newHistory);
        setUsedWords(prev => new Set([...prev, word]));

        // Get next word
        const nextWord = getRandomWord(new Set([...usedWords, word]));

        await setSharedState({
            currentScore: currentScore + 1,
            currentWord: nextWord
        });
    }, [phase, isActivePlayer, mode, currentWord, currentScore, wordHistory, usedWords, setSharedState]);

    const handlePass = useCallback(async () => {
        if (phase !== 'PLAYING' || (!isActivePlayer && mode !== 'local')) return;

        const word = currentWord;

        // Haptic feedback - pass pattern
        if (navigator.vibrate) {
            navigator.vibrate([50]);
        }

        // Show skip animation
        setShowSkipAnimation(true);
        setTimeout(() => setShowSkipAnimation(false), 400);

        // Add to history as skipped
        const newHistory = [...wordHistory, { word, result: 'skip' as const, timestamp: Date.now() }];
        setWordHistory(newHistory);
        setUsedWords(prev => new Set([...prev, word]));

        // Get next word
        const nextWord = getRandomWord(new Set([...usedWords, word]));

        await setSharedState({
            currentWord: nextWord
        });
    }, [phase, isActivePlayer, mode, currentWord, wordHistory, usedWords, setSharedState]);

    const handleOnlineGuess = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!guessInput.trim() || phase !== 'PLAYING' || isActivePlayer) return;

        const guess: OnlineGuess = {
            playerId: currentPlayerId || 'unknown',
            playerName: players.find(p => p.id === currentPlayerId)?.name || 'Player',
            guess: guessInput.trim().toLowerCase(),
            timestamp: Date.now()
        };

        setOnlineGuesses(prev => [...prev, guess]);
        setGuessInput('');

        // Check if guess matches (case insensitive)
        if (guess.guess === currentWord.toLowerCase()) {
            await handleCorrect();
        }
    };

    const playAgain = async () => {
        await setSharedState({
            phase: 'LOBBY',
            currentScore: 0,
            currentWord: '',
            activePlayerId: null
        });
        setWordHistory([]);
        setUsedWords(new Set());
    };

    const nextRound = async () => {
        const nextPlayerId = players[(players.findIndex(p => p.id === activePlayerId) + 1) % players.length]?.id;
        await setSharedState({
            phase: 'LOBBY',
            activePlayerId: nextPlayerId,
            currentRound: currentRound + 1
        });
    };

    /* =========================================
       RENDER HELPERS
       ========================================= */
    const renderLobby = () => (
        <div className="charades-lobby">
            <div className="icon-bounce">🎬</div>
            <h1 className="charades-title">CHARADES</h1>
            <p className="charades-subtitle">Act it out. Your team guesses.</p>

            <div className="players-preview">
                {players.map(p => (
                    <span key={p.id} className={`player-badge ${p.isHost ? 'host' : ''}`}>
                        {p.name} {p.isHost && '👑'}
                    </span>
                ))}
            </div>

            {mode === 'online' && !isHost && (
                <p className="waiting-subtext">Waiting for host to start...</p>
            )}

            {(isHost || mode === 'local') && (
                <button className="charades-btn" onClick={startRound}>
                    {mode === 'local' ? "I'm Acting" : "Start Game"}
                </button>
            )}

            <a href="/" className="exit-link">Return to Hub</a>
        </div>
    );

    const renderGetReady = () => (
        <div className="charades-getready">
            <p className="getready-instruction">
                {isActivePlayer
                    ? "Get ready to act!"
                    : `${activePlayerName} is up!`}
            </p>
            <h1 className="countdown-massive">{timeLeft}</h1>
            {isActivePlayer && (
                <p className="tap-to-start">Get into position...</p>
            )}
        </div>
    );

    const renderActorReveal = () => (
        <div className="charades-actor-reveal" onClick={handleActorReveal}>
            <div className="reveal-card">
                <p className="reveal-label">Your Word Is</p>
                <h1 className="reveal-word">{currentWord}</h1>
            </div>
            <p className="tap-to-start">Tap anywhere when ready</p>
            {mode === 'local' && (
                <p className="reveal-hint">Hold phone to forehead so only YOU can see</p>
            )}
        </div>
    );

    const renderPlaying = () => {
        const timerPercent = (timeLeft / 60) * 100;
        const isUrgent = timeLeft <= 10;

        return (
            <div className="charades-playing">
                {/* Timer bar at top */}
                <div className="timer-bar-container">
                    <div
                        className={`timer-bar-fill ${isUrgent ? 'urgent' : ''}`}
                        style={{ width: `${timerPercent}%` }}
                    />
                </div>

                {/* Header with timer and score */}
                <div className="game-header">
                    <div className={`timer-display ${isUrgent ? 'timer-urgent' : ''}`}>
                        <span className="timer-icon">⏱️</span>
                        <span>{timeLeft}s</span>
                    </div>
                    <div className={`score-display ${scoreAnimation ? 'score-bounce' : ''}`}>
                        {currentScore} pts
                    </div>
                </div>

                {/* Online players */}
                {mode === 'online' && (
                    <div className="online-players">
                        {players.map(p => (
                            <span key={p.id} className="online-player-badge">
                                {p.name} {p.id === activePlayerId && '🎭'}
                            </span>
                        ))}
                    </div>
                )}

                {/* Main game area */}
                <div className="game-main">
                    {/* Actor's view - shows word */}
                    {isActorView ? (
                        <>
                            <div className={`word-card ${showCorrectAnimation ? 'correct' : ''} ${showSkipAnimation ? 'skip' : ''}`}>
                                <p className="word-text">{currentWord}</p>
                            </div>

                            {/* Word history (small, for reference) */}
                            {wordHistory.length > 0 && (
                                <div className="word-history">
                                    {wordHistory.slice(-5).map((item, i) => (
                                        <span key={i} className={`history-word ${item.result}`}>
                                            {item.result === 'correct' ? '✓' : '✗'} {item.word}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        /* Guesser view */
                        <div className="guesser-view">
                            <h2 className="guesser-title">{activePlayerName} is acting!</h2>
                            <p className="guesser-subtitle">
                                {mode === 'local'
                                    ? "Call out your guesses!"
                                    : "Type your guesses below"}
                            </p>
                        </div>
                    )}

                    {/* Online guess input */}
                    {mode === 'online' && !isActorView && phase === 'PLAYING' && (
                        <form className="guess-chat" onSubmit={handleOnlineGuess}>
                            <div className="guess-input-wrapper">
                                <input
                                    type="text"
                                    className="guess-input"
                                    placeholder="Type your guess..."
                                    value={guessInput}
                                    onChange={e => setGuessInput(e.target.value)}
                                    autoComplete="off"
                                />
                                <button type="submit" className="guess-submit">
                                    Guess
                                </button>
                            </div>
                            {onlineGuesses.length > 0 && (
                                <div className="guess-list">
                                    {onlineGuesses.slice(-10).map((g, i) => (
                                        <span key={i} className={`guess-item ${g.playerId === activePlayerId ? 'actor' : ''}`}>
                                            {g.playerName}: {g.guess}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </form>
                    )}
                </div>

                {/* Action buttons - 50% viewport height each */}
                {isActorView && (
                    <div className="controls-overlay">
                        <div className="control-half pass-half" onClick={handlePass}>
                            <span className="control-icon">⏭️</span>
                            <span className="control-label">Pass</span>
                        </div>
                        <div className="control-half correct-half" onClick={handleCorrect}>
                            <span className="control-icon">✅</span>
                            <span className="control-label">Got It</span>
                        </div>
                    </div>
                )}

                {/* Non-actor waiting in online mode */}
                {!isActorView && mode === 'online' && phase === 'PLAYING' && (
                    <div className="controls-overlay">
                        <div className="control-half pass-half" style={{ opacity: 0.5, cursor: 'default' }}>
                            <span className="control-icon">⏭️</span>
                            <span className="control-label">Waiting</span>
                        </div>
                        <div className="control-half correct-half" style={{ opacity: 0.5, cursor: 'default' }}>
                            <span className="control-icon">✅</span>
                            <span className="control-label">Waiting</span>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderScore = () => (
        <div className="charades-score">
            <h1 className="score-title">Time's Up!</h1>

            <div className="score-circle">
                <span className="score-value">{currentScore}</span>
                <span className="score-label">Points</span>
            </div>

            {/* Word summary */}
            {wordHistory.length > 0 && (
                <div className="word-history" style={{ marginTop: '1rem' }}>
                    {wordHistory.map((item, i) => (
                        <span key={i} className={`history-word ${item.result}`}>
                            {item.result === 'correct' ? '✓' : '✗'} {item.word}
                        </span>
                    ))}
                </div>
            )}

            <div className="score-actions">
                {(isHost || mode === 'local') ? (
                    <>
                        <button className="charades-btn" onClick={startRound}>
                            Play Again
                        </button>
                        {mode === 'online' && players.length > 1 && (
                            <button className="charades-btn secondary" onClick={nextRound}>
                                Next Player
                            </button>
                        )}
                        <a href="/" className="exit-link">Exit to Hub</a>
                    </>
                ) : (
                    <p className="waiting-subtext blink">Waiting for host to continue...</p>
                )}
            </div>
        </div>
    );

    /* =========================================
       MAIN RENDER
       ========================================= */
    return (
        <div className={`charades-container state-${phase.toLowerCase()}`}>
            {phase === 'LOBBY' && renderLobby()}
            {phase === 'GET_READY' && renderGetReady()}
            {phase === 'ACTOR_REVEAL' && renderActorReveal()}
            {phase === 'PLAYING' && renderPlaying()}
            {phase === 'SCORE' && renderScore()}
        </div>
    );
};

export default CharadesGame;
