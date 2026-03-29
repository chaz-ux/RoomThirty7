import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMultiplayer } from '../../context/MultiplayerContext';
import './Hangman.css';

// ============================================================
// HANGMAN GAME - ROOM 37
// Guess the word letter by letter before the hangman is complete
// Forfeit animations for wrong guesses
// ============================================================

const WORDS = [
    // Movies
    'TITANIC', 'AVATAR', 'FROZEN', 'SHREK', 'BATMAN', 'SPIDERMAN', 'STAR WARS', 'INCEPTION',
    'GLADIATOR', 'JURASSIC', 'TOP GUN', 'MISSION', 'JOHN WICK', 'MATRIX', 'BRAVE', 'CARS',
    'RATATOUILLE', 'COCO', 'MOANA', 'HERCULES', 'MULAN', 'UP', 'CARS', 'TOY STORY',
    'FINDING NEMO', 'FINDING DORY', 'THE LION KING', 'THE HOBBIT', 'HARRY POTTER',
    // Animals
    'ELEPHANT', 'GIRAFFE', 'PENGUIN', 'DOLPHIN', 'BUTTERFLY', 'CROCODILE', 'FLAMINGO',
    'HAMSTER', 'KOALA', 'PANDA', 'TIGER', 'LION', 'ZEBRA', 'MONKEY', 'SNAKE', 'EAGLE',
    // Countries / Places
    'AUSTRALIA', 'BRAZIL', 'JAPAN', 'EGYPT', 'ICELAND', 'PARIS', 'LONDON', 'DUBAI',
    'KENYA', 'HAWAII', 'ALASKA', 'GERMANY', 'FRANCE', 'SPAIN', 'MEXICO', 'CHINA',
    'ITALY', 'GREECE', 'TURKEY', 'MOROCCO', 'THAILAND', 'VIETNAM', 'PERU',
    // Objects
    'UMBRELLA', 'BICYCLE', 'GUITAR', 'CAMERA', 'TELESCOPE', 'HEADPHONES', 'BACKPACK',
    'LAPTOP', 'SATELLITE', 'HELICOPTER', 'SUBMARINE', 'ROCKET', 'MOTORCYCLE', 'PIANO',
    'VIOLIN', 'DRUMS', 'MICROSCOPE', 'COMPASS', 'TELESCOPE', 'BINOCULARS',
    // Actions / Things
    'SKYDIVING', 'SURFING', 'CLIMBING', 'COOKING', 'PAINTING', 'DANCING', 'BOXING',
    'WRESTLING', 'GARDENING', 'FISHING', 'HIKING', 'SNORKELING', 'SKIING', 'BOWLING',
    'ARCHERY', 'FENCING', 'GYMNASTICS', 'TENNIS', 'BASEBALL', 'SOCCER', 'BASKETBALL',
];

const MAX_WRONG = 6; // Head, body, left arm, right arm, left leg, right leg

const HANGMAN_PARTS = [
    { part: 'head', label: 'Head' },
    { part: 'body', label: 'Body' },
    { part: 'leftArm', label: 'Left Arm' },
    { part: 'rightArm', label: 'Right Arm' },
    { part: 'leftLeg', label: 'Left Leg' },
    { part: 'rightLeg', label: 'Right Leg' },
];

type Phase = 'LOBBY' | 'PLAYING' | 'ROUND_END' | 'GAME_OVER';

interface HangmanState {
    phase: Phase;
    word: string;
    guessedLetters: string[];
    scores: Record<string, number>;
    currentWordIndex: number;
    wordsCompleted: number;
    words: string[];
    correctGuessers: string[];
    lastWrongGuess?: string;
}

const HangmanGame: React.FC = () => {
    const { players, sharedState, setSharedState, isHost, currentPlayerId } = useMultiplayer();

    const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
    const [forfeitAnimation, setForfeitAnimation] = useState(false);
    const [showForfeitOverlay, setShowForfeitOverlay] = useState(false);
    const [forfeitText, setForfeitText] = useState('');

    if (players.length === 0) {
        return (
            <div className="hangman-container">
                <div className="hangman-lobby">
                    <h2>Please enter via Lobby</h2>
                    <a href="/lobby?game=hangman" className="exit-link">Go to Lobby</a>
                </div>
            </div>
        );
    }

    const state: HangmanState = {
        phase: 'LOBBY',
        word: '',
        guessedLetters: [],
        scores: {},
        currentWordIndex: 0,
        wordsCompleted: 0,
        words: [],
        correctGuessers: [],
        lastWrongGuess: undefined,
        ...sharedState,
    };

    const {
        phase,
        word,
        guessedLetters = [],
        scores = {},
        currentWordIndex,
        wordsCompleted,
        words,
        correctGuessers = [],
        lastWrongGuess,
    } = state;

    const wrongGuesses = guessedLetters.filter(l => !word.includes(l)).length;
    const isGameOver = wrongGuesses >= MAX_WRONG;
    const isWordGuessed = word.split('').every(l => guessedLetters.includes(l));
    const isRoundOver = isGameOver || isWordGuessed;
    const myScore = scores[currentPlayerId || ''] || 0;

    // Generate display word with blanks
    const displayWord = word.split('').map(letter => {
        if (guessedLetters.includes(letter)) return letter;
        if (letter === ' ') return ' ';
        return '_';
    }).join('');

    // Vibrate and show forfeit on wrong guess
    useEffect(() => {
        if (phase === 'PLAYING' && lastWrongGuess && wrongGuesses > 0) {
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
            setForfeitAnimation(true);
            setShowForfeitOverlay(true);
            setForfeitText(`WRONG! "${lastWrongGuess}" is not in the word`);
            setTimeout(() => {
                setForfeitAnimation(false);
                setShowForfeitOverlay(false);
            }, 1200);
        }
    }, [wrongGuesses, lastWrongGuess, phase]);

    // Vibrate success on correct guess
    useEffect(() => {
        if (phase === 'PLAYING' && isWordGuessed && !isGameOver) {
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        }
    }, [isWordGuessed, isGameOver, phase]);

    // ============================================================
    // GAME ACTIONS
    // ============================================================
    const startGame = async () => {
        if (!isHost) return;

        const initialScores: Record<string, number> = {};
        players.forEach(p => initialScores[p.id] = 0);

        const shuffled = [...WORDS].sort(() => 0.5 - Math.random());
        const selectedWords = shuffled.slice(0, 10);

        await setSharedState({
            phase: 'PLAYING',
            word: selectedWords[0],
            guessedLetters: [],
            scores: initialScores,
            currentWordIndex: 0,
            wordsCompleted: 0,
            words: selectedWords,
            correctGuessers: [],
            lastWrongGuess: undefined,
        });

        setSelectedLetters([]);
    };

    const handleLetterClick = async (letter: string) => {
        if (phase !== 'PLAYING' || selectedLetters.includes(letter) || isRoundOver) return;

        const newGuessed = [...guessedLetters, letter];
        const newSelected = [...selectedLetters, letter];
        setSelectedLetters(newSelected);

        const isCorrect = word.includes(letter);

        if (isCorrect) {
            // Check if word is now complete
            const wordComplete = word.split('').filter(l => l !== ' ').every(l => newGuessed.includes(l));
            if (wordComplete) {
                const newScores = { ...scores };
                if (currentPlayerId) {
                    newScores[currentPlayerId] = (newScores[currentPlayerId] || 0) + 1;
                }

                await setSharedState({
                    guessedLetters: newGuessed,
                    scores: newScores,
                    phase: 'ROUND_END',
                    correctGuessers: [currentPlayerId || ''],
                    lastWrongGuess: undefined,
                });
            } else {
                await setSharedState({ guessedLetters: newGuessed, lastWrongGuess: undefined });
                if (navigator.vibrate) navigator.vibrate([50]);
            }
        } else {
            await setSharedState({ guessedLetters: newGuessed, lastWrongGuess: letter });

            // Check if hangman is complete
            if (newGuessed.filter(l => !word.includes(l)).length >= MAX_WRONG) {
                await setSharedState({
                    guessedLetters: newGuessed,
                    phase: 'ROUND_END',
                    correctGuessers: [],
                });
            }
        }
    };

    const nextRound = async () => {
        if (!isHost) return;

        const nextIndex = currentWordIndex + 1;
        if (nextIndex >= words.length) {
            await setSharedState({ phase: 'GAME_OVER', lastWrongGuess: undefined });
        } else {
            await setSharedState({
                phase: 'PLAYING',
                word: words[nextIndex],
                guessedLetters: [],
                currentWordIndex: nextIndex,
                correctGuessers: [],
                lastWrongGuess: undefined,
            });
            setSelectedLetters([]);
        }
    };

    const playAgain = async () => {
        if (!isHost) return;
        await setSharedState({
            phase: 'LOBBY',
            word: '',
            guessedLetters: [],
            scores: {},
            currentWordIndex: 0,
            wordsCompleted: 0,
            words: [],
            correctGuessers: [],
            lastWrongGuess: undefined,
        });
        setSelectedLetters([]);
    };

    // ============================================================
    // RENDER
    // ============================================================
    const renderHangman = () => (
        <div className="hangman-figure">
            <svg viewBox="0 0 200 250" className="hangman-svg">
                {/* Gallows */}
                <line x1="20" y1="230" x2="100" y2="230" className="gallows" />
                <line x1="60" y1="230" x2="60" y2="20" className="gallows" />
                <line x1="60" y1="20" x2="140" y2="20" className="gallows" />
                <line x1="140" y1="20" x2="140" y2="50" className="gallows" />

                {/* Body parts - appear progressively */}
                <circle
                    cx="140" cy="70" r="20"
                    className={`body-part head ${wrongGuesses >= 1 ? 'visible' : ''}`}
                />
                <line
                    x1="140" y1="90" x2="140" y2="150"
                    className={`body-part body ${wrongGuesses >= 2 ? 'visible' : ''}`}
                />
                <line
                    x1="140" y1="110" x2="110" y2="130"
                    className={`body-part leftArm ${wrongGuesses >= 3 ? 'visible' : ''}`}
                />
                <line
                    x1="140" y1="110" x2="170" y2="130"
                    className={`body-part rightArm ${wrongGuesses >= 4 ? 'visible' : ''}`}
                />
                <line
                    x1="140" y1="150" x2="120" y2="190"
                    className={`body-part leftLeg ${wrongGuesses >= 5 ? 'visible' : ''}`}
                />
                <line
                    x1="140" y1="150" x2="160" y2="190"
                    className={`body-part rightLeg ${wrongGuesses >= 6 ? 'visible' : ''}`}
                />

                {/* Face when dead */}
                {isGameOver && (
                    <g className="dead-face">
                        <text x="125" y="65" className="dead-x">x</text>
                        <text x="150" y="65" className="dead-x">x</text>
                        <path d="M128 82 Q140 74 152 82" className="dead-mouth" />
                    </g>
                )}

                {/* Face when won */}
                {isWordGuessed && !isGameOver && (
                    <g className="happy-face">
                        <circle cx="133" cy="63" r="4" fill="currentColor" />
                        <circle cx="147" cy="63" r="4" fill="currentColor" />
                        <path d="M126 78 Q140 90 154 78" fill="none" stroke="currentColor" strokeWidth="3" />
                    </g>
                )}
            </svg>
        </div>
    );

    const renderLobby = () => (
        <div className="hangman-lobby">
            <div className="lobby-icon">⚡</div>
            <h1 className="hangman-title">HANGMAN</h1>
            <p className="subtitle">Guess the word before the hangman is complete!</p>

            <div className="players-preview">
                {players.map(p => (
                    <span key={p.id} className="player-badge">
                        {p.name} {p.isHost && '👑'}
                    </span>
                ))}
            </div>

            <p className="game-info">10 words to guess. Forfeits for wrong answers!</p>

            {isHost ? (
                <button className="hangman-btn start-btn" onClick={startGame}>
                    START GAME
                </button>
            ) : (
                <p className="blink waiting-msg">Waiting for host...</p>
            )}

            <a href="/" className="exit-link"> Exit to Hub</a>
        </div>
    );

    const renderPlaying = () => (
        <div className={`hangman-playing ${forfeitAnimation ? 'forfeit-shake' : ''}`}>
            {/* Forfeit overlay */}
            {showForfeitOverlay && (
                <div className="forfeit-full-overlay">
                    <div className="forfeit-content">
                        <span className="forfeit-emoji">😱</span>
                        <span className="forfeit-big-text">WRONG!</span>
                        <span className="forfeit-letter">"{lastWrongGuess}"</span>
                    </div>
                </div>
            )}

            <div className="game-header">
                <div className="score-box">
                    <span className="score-label">SCORE</span>
                    <span className="score-value">{myScore}</span>
                </div>
                <div className="progress-box">
                    <span className="progress-label">WORD</span>
                    <span className="progress-value">{currentWordIndex + 1}/{words.length}</span>
                </div>
                <div className="wrong-box">
                    <span className="wrong-label">WRONG</span>
                    <span className="wrong-value">{wrongGuesses}/{MAX_WRONG}</span>
                </div>
            </div>

            <div className="hangman-area">
                {renderHangman()}
            </div>

            <div className="word-display">
                <span className="word-letters">{displayWord}</span>
            </div>

            <div className="letter-grid">
                {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => {
                    const isUsed = selectedLetters.includes(letter);
                    const isWrong = isUsed && !word.includes(letter);
                    return (
                        <button
                            key={letter}
                            className={`letter-btn ${isUsed ? 'used' : ''} ${isWrong ? 'wrong-letter' : ''} ${!isUsed && !isRoundOver ? 'available' : ''}`}
                            onClick={() => handleLetterClick(letter)}
                            disabled={isUsed || isRoundOver}
                        >
                            {letter}
                        </button>
                    );
                })}
            </div>

            {/* Wrong letters display */}
            {selectedLetters.filter(l => !word.includes(l)).length > 0 && (
                <div className="wrong-letters-display">
                    <span className="wrong-letters-label">Wrong:</span>
                    <span className="wrong-letters">
                        {selectedLetters.filter(l => !word.includes(l)).join(' ')}
                    </span>
                </div>
            )}
        </div>
    );

    const renderRoundEnd = () => (
        <div className="round-end-screen">
            <div className="result-icon">
                {isGameOver ? (
                    <>
                        <span className="big-icon">💀</span>
                        <h1 className="result-title lose">GAME OVER</h1>
                    </>
                ) : (
                    <>
                        <span className="big-icon">🎉</span>
                        <h1 className="result-title win">CORRECT!</h1>
                    </>
                )}
            </div>

            <div className="reveal-word">
                <span className="reveal-label">The word was</span>
                <span className="reveal-word-text">{word}</span>
            </div>

            <div className="scores-summary">
                <h3>Current Scores</h3>
                {players.map(p => (
                    <div key={p.id} className={`score-row ${p.id === currentPlayerId ? 'highlight' : ''}`}>
                        <span className="player-name">{p.name}</span>
                        <span className="player-score">{scores[p.id] || 0} pts</span>
                    </div>
                ))}
            </div>

            {isHost && (
                <button className="hangman-btn continue-btn" onClick={nextRound}>
                    {currentWordIndex + 1 >= words.length ? 'SEE FINAL SCORES' : 'NEXT WORD'}
                </button>
            )}

            <a href="/" className="exit-link"> Exit to Hub</a>
        </div>
    );

    const renderGameOver = () => {
        const winner = players.reduce((a, b) => ((scores[a.id] || 0) > (scores[b.id] || 0) ? a : b));

        return (
            <div className="game-over-screen">
                <div className="trophy-icon">🏆</div>
                <h1 className="game-over-title">GAME OVER</h1>

                <div className="winner-card">
                    <span className="winner-label">WINNER</span>
                    <span className="winner-name">{winner.name}</span>
                    <span className="winner-score">{scores[winner.id] || 0} pts</span>
                </div>

                <div className="final-scores">
                    <h3>Final Scores</h3>
                    {players
                        .slice()
                        .sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0))
                        .map((p, index) => (
                            <div key={p.id} className={`score-row ${index === 0 ? 'winner' : ''}`}>
                                <span className="rank">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}</span>
                                <span className="player-name">{p.name}</span>
                                <span className="player-score">{scores[p.id] || 0}</span>
                            </div>
                        ))}
                </div>

                {isHost && (
                    <button className="hangman-btn start-btn" onClick={playAgain}>
                        PLAY AGAIN
                    </button>
                )}

                <a href="/" className="exit-link"> Exit to Hub</a>
            </div>
        );
    };

    return (
        <div className={`hangman-container state-${phase.toLowerCase()}`}>
            {phase === 'LOBBY' && renderLobby()}
            {phase === 'PLAYING' && renderPlaying()}
            {phase === 'ROUND_END' && renderRoundEnd()}
            {phase === 'GAME_OVER' && renderGameOver()}
        </div>
    );
};

export default HangmanGame;
