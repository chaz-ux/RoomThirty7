import React, { useState, useEffect } from 'react';
import { useMultiplayer } from '../../context/MultiplayerContext';
import './ThirtySeconds.css';

const CARDS = [
    ["Eiffel Tower", "Banana", "Football", "Superman", "Pizza"],
    ["Harry Potter", "Guitar", "Snowman", "Coffee", "Dinosaur"],
    ["Oxygen", "Moon", "Vampire", "Swimming", "Chocolate"],
    ["Netflix", "Pyramids", "Kangaroo", "Sushi", "Tornado"]
];

const ThirtySecondsGame: React.FC = () => {
    const { players, sharedState, setSharedState, isHost, currentPlayerId, mode } = useMultiplayer();

    if (players.length === 0) {
        return <div className="thirty-container"><div className="thirty-lobby"><h2>Please enter via Lobby</h2><a href="/lobby?game=30seconds" className="exit-link">Go to Lobby</a></div></div>;
    }

    const { phase = 'LOBBY', endTime = 0, currentScore = 0, activeCardIndex = 0, activePlayerId = null } = sharedState || {};

    const [timeLeft, setTimeLeft] = useState(30);
    const [guessedWords, setGuessedWords] = useState<number[]>([]);

    const startGame = async () => {
        if (!isHost) return;
        await setSharedState({ phase: 'LOBBY', currentScore: 0 });
    };

    const startRound = async () => {
        // Anyone can click "I WILL DESCRIBE" to grab the turn
        await setSharedState({
            phase: 'GET_READY',
            activePlayerId: currentPlayerId,
            endTime: Date.now() + 3000, // 3s prep
            activeCardIndex: Math.floor(Math.random() * CARDS.length),
            currentScore: 0
        });
        setGuessedWords([]);
    };

    // Global Timer Sync
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (phase === 'GET_READY' || phase === 'PLAYING') {
            timer = setInterval(async () => {
                const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
                setTimeLeft(remaining);

                if (remaining === 0) {
                    if (phase === 'GET_READY') {
                        // Switch to playing
                        if (currentPlayerId === activePlayerId || isHost) {
                            await setSharedState({ phase: 'PLAYING', endTime: Date.now() + 30000 });
                        }
                    } else if (phase === 'PLAYING') {
                        // Switch to score
                        if (currentPlayerId === activePlayerId || isHost) {
                            await setSharedState({ phase: 'SCORE' });
                        }
                    }
                }
            }, 200);
        }
        return () => clearInterval(timer);
    }, [phase, endTime, currentPlayerId, activePlayerId, isHost, setSharedState]);

    const handleWordTap = async (index: number) => {
        // Only the active describer can tap words
        if (currentPlayerId !== activePlayerId && mode !== 'local') return;
        if (guessedWords.includes(index) || phase !== 'PLAYING') return;

        const newGuessed = [...guessedWords, index];
        setGuessedWords(newGuessed);

        const newScore = currentScore + 1;
        await setSharedState({ currentScore: newScore });

        // If card cleared, load next card immediately
        if (newGuessed.length === 5) {
            setTimeout(async () => {
                setGuessedWords([]);
                await setSharedState({ activeCardIndex: (activeCardIndex + 1) % CARDS.length });
            }, 300);
        }
    };

    const isActivePlayer = mode === 'local' || currentPlayerId === activePlayerId;
    const activePlayerName = players.find(p => p.id === activePlayerId)?.name || 'Someone';

    return (
        <div className={`thirty-container state-${phase.toLowerCase()}`}>
            
            {phase === 'LOBBY' && (
                <div className="thirty-lobby">
                    <h1 className="thirty-logo glow-yellow">30 SECONDS</h1>
                    <p className="subtitle">5 words. 30 seconds. Total chaos.</p>
                    <div className="players-list">
                        {players.map(p => <span key={p.id} className="player-tag">{p.name} {p.isHost && '👑'}</span>)}
                    </div>
                    <button className="thirty-btn hero-btn" onClick={startRound}>I WILL DESCRIBE</button>
                    <a href="/" className="exit-link">Exit to Hub</a>
                </div>
            )}

            {phase === 'GET_READY' && (
                <div className="thirty-prep">
                    <h2>{isActivePlayer ? 'Get ready to describe!' : `${activePlayerName} is getting ready...`}</h2>
                    <h1 className="countdown-massive glow-yellow">{timeLeft}</h1>
                </div>
            )}

            {phase === 'PLAYING' && (
                <div className="thirty-playarea">
                    <div className="timer-ring">
                        <svg className="progress-ring" height="120" width="120">
                            <circle className="progress-ring__circle" strokeWidth="8" fill="transparent" r="52" cx="60" cy="60"
                                style={{ strokeDashoffset: `${326 - (326 * (timeLeft / 30))}`}} 
                            />
                        </svg>
                        <h2 className="timer-text">{timeLeft}</h2>
                    </div>

                    <div className="score-display">
                        <h3>SCORE: {currentScore}</h3>
                    </div>

                    <div className="card-container">
                        {isActivePlayer ? (
                            CARDS[activeCardIndex].map((word, index) => (
                                <div 
                                    key={index} 
                                    className={`word-item ${guessedWords.includes(index) ? 'guessed' : ''}`}
                                    onClick={() => handleWordTap(index)}
                                >
                                    {word}
                                </div>
                            ))
                        ) : (
                            <div className="spectator-view">
                                <h2>{activePlayerName} is describing...</h2>
                                <h1 className="glow-yellow pulse">{currentScore} Guessed!</h1>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {phase === 'SCORE' && (
                <div className="thirty-score">
                    <h1 className="alarm-text blink">TIME'S UP!</h1>
                    <div className="score-circle">
                        <h1>{currentScore}</h1>
                        <p>WORDS</p>
                    </div>
                    {isHost || currentPlayerId === activePlayerId ? (
                        <button className="thirty-btn hero-btn" onClick={() => setSharedState({ phase: 'LOBBY' })}>NEXT ROUND</button>
                    ) : (
                        <p className="blink">Waiting for next round...</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ThirtySecondsGame;
