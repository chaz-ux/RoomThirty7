import React, { useState, useEffect, useRef } from 'react';
import { useMultiplayer } from '../../context/MultiplayerContext';
import './Imposter.css';

// ============================================================
// IMPOSTER GAME - ROOM 37
//
// How it works:
// 1. Host starts → players see their words ONE BY ONE (pass device)
// 2. Players sit in a circle and take TURNS giving ONE WORD clues
// 3. After all clues given (multiple rounds), brief discussion
// 4. Vote on who you think is the imposter
// 5. Reveal - imposter wins if not caught!
// ============================================================

const WORD_BANK = [
    // People
    'Kendrick Lamar', 'Elon Musk', 'Beyonce', 'Shrek', 'Barack Obama',
    'Cristiano Ronaldo', 'Mickey Mouse', 'Gordon Ramsay', 'Keanu Reeves',
    'Tom Hanks', 'Mr Bean', 'Spongebob', 'Harry Potter', 'Spider-Man',
    'Batman', 'Darth Vader', 'Yoda', 'Gandalf', 'Mario', 'Pikachu',
    'Sauti Sol', 'Eliud Kipchoge', 'Nameless', 'Ngũ',

    // Places
    'Nairobi', 'Mombasa', 'Paris', 'Tokyo', 'Egypt', 'Hawaii', 'Dubai',
    'London', 'Maasai Mara', 'Mt Kenya', 'Kisumu', 'Nakuru', 'Eldoret',

    // Things
    'Bitcoin', 'Pizza', 'Sushi', 'Iphone', 'Nintendo Switch', 'Macbook',
    'Airplane', 'Guitar', 'Telescope', 'Diamonds', 'M-Pesa', 'Matatu',
    'Boda Boda', 'Ugali', 'Nyama Choma', 'Chai', 'Sukuma Wiki', 'Harambee',

    // More
    'Amazon', 'Titanic', 'Eiffel Tower', 'Pyramids', 'Great Wall',
    'Superman', 'Iron Man', 'Thor', 'Captain Jack Sparrow'
];

type Phase =
    | 'LOBBY'
    | 'SHOW_WORD'      // Pass device, each player sees their word one by one
    | 'GIVE_CLUES'     // Turn-based: each player gives one word clue per round
    | 'DISCUSSION'     // After clues, discuss
    | 'VOTING'         // Vote on who is imposter
    | 'RESULTS';       // Reveal

const VOTING_TIME = 60;
const DISCUSSION_TIME = 30;
const CLUE_TIME = 20; // seconds per turn

const ImposterGame: React.FC = () => {
    const {
        players, sharedState, setSharedState,
        isHost, currentPlayerId, mode,
    } = useMultiplayer();

    const isPassPlay = mode === 'local';

    // Local state
    const [clueInput, setClueInput] = useState('');
    const [clueTimeLeft, setClueTimeLeft] = useState(CLUE_TIME);
    const [votingTimeLeft, setVotingTimeLeft] = useState(VOTING_TIME);
    const [discussionTimeLeft, setDiscussionTimeLeft] = useState(DISCUSSION_TIME);

    const timerRef = useRef<ReturnType<typeof setInterval>>();

    // Shared state
    const phase = (sharedState?.phase ?? 'LOBBY') as Phase;
    const secretWord = sharedState?.secretWord ?? '';
    const imposterId = sharedState?.imposterId ?? '';
    const currentRevealIndex = sharedState?.currentRevealIndex ?? 0; // which player is seeing their word
    const currentTurnIndex = sharedState?.currentTurnIndex ?? 0;    // whose turn to give clue
    const clueRound = sharedState?.clueRound ?? 0;                   // which round (1, 2, 3...)
    const cluesGiven = sharedState?.cluesGiven ?? {} as Record<string, string>; // playerId -> their clue word
    const votes = sharedState?.votes ?? {} as Record<string, string>; // voterId -> votedForId

    // Derived
    const amIImposter = currentPlayerId === imposterId;

    // Count votes
    const voteCounts: Record<string, number> = {};
    Object.values(votes).forEach(v => { if (v) voteCounts[v] = (voteCounts[v] ?? 0) + 1; });

    // Is it MY turn to give a clue?
    const isMyClueTurn = players[currentTurnIndex]?.id === currentPlayerId;

    // Did I already give a clue this round?
    const myClueThisRound = cluesGiven[currentPlayerId ?? ''];

    // How many clues per round = number of players
    const cluesNeededPerRound = players.length;
    const totalCluesThisRound = Object.keys(cluesGiven).filter(k =>
        cluesGiven[k] !== ''
    ).length;

    // All players have given clues this round?
    const roundComplete = totalCluesThisRound >= cluesNeededPerRound;

    // How many rounds we've gone through (each player gave one clue = 1 round)
    const roundsCompleted = Math.floor(Object.values(cluesGiven).filter(c => c !== '').length / players.length);

    // ─── Timers ────────────────────────────────────────────────
    useEffect(() => {
        if (phase === 'GIVE_CLUES') {
            timerRef.current = setInterval(() => {
                setClueTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (phase === 'VOTING') {
            timerRef.current = setInterval(() => {
                setVotingTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (phase === 'DISCUSSION') {
            timerRef.current = setInterval(() => {
                setDiscussionTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        return 0;
                    }
                    return prev;
                });
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [phase]);

    // ─── Start Game (Host) ─────────────────────────────────────
    const handleStartGame = async () => {
        if (!isHost || players.length < 3) return;

        const word = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
        const imposterIdx = Math.floor(Math.random() * players.length);

        await setSharedState({
            phase: 'SHOW_WORD',
            secretWord: word,
            imposterId: players[imposterIdx].id,
            currentRevealIndex: 0,
            currentTurnIndex: 0,
            clueRound: 0,
            cluesGiven: {},
            votes: {},
        });
    };

    // ─── Player seen their word and tapped "Next" ─────────────
    const handleRevealNext = async () => {
        const nextIndex = currentRevealIndex + 1;

        if (nextIndex >= players.length) {
            // All players have seen their words → start giving clues
            await setSharedState({
                phase: 'GIVE_CLUES',
                clueRound: 1,
                currentTurnIndex: 0,
            });
            setClueTimeLeft(CLUE_TIME);
        } else {
            await setSharedState({ currentRevealIndex: nextIndex });
        }
    };

    // ─── Submit clue ───────────────────────────────────────────
    const handleSubmitClue = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!clueInput.trim() || !currentPlayerId) return;
        if (myClueThisRound) return; // Already gave clue

        const newClues = { ...cluesGiven, [currentPlayerId]: clueInput.trim() };
        await setSharedState({ cluesGiven: newClues });
        setClueInput('');

        // Move to next player's turn
        const nextTurn = currentTurnIndex + 1;

        if (nextTurn >= players.length) {
            // Round complete! Move to discussion or next round
            if (clueRound >= 3) {
                // Done giving clues - go to discussion
                await setSharedState({ phase: 'DISCUSSION' });
                setDiscussionTimeLeft(DISCUSSION_TIME);
            } else {
                // Next round
                await setSharedState({
                    clueRound: clueRound + 1,
                    currentTurnIndex: 0,
                });
                setClueTimeLeft(CLUE_TIME);
            }
        } else {
            await setSharedState({ currentTurnIndex: nextTurn });
            setClueTimeLeft(CLUE_TIME);
        }
    };

    // ─── Skip clue ────────────────────────────────────────────
    const handleSkipClue = async () => {
        if (!currentPlayerId || myClueThisRound) return;

        const newClues = { ...cluesGiven, [currentPlayerId]: '' };
        await setSharedState({ cluesGiven: newClues });
        setClueInput('');

        const nextTurn = currentTurnIndex + 1;

        if (nextTurn >= players.length) {
            if (clueRound >= 3) {
                await setSharedState({ phase: 'DISCUSSION' });
                setDiscussionTimeLeft(DISCUSSION_TIME);
            } else {
                await setSharedState({
                    clueRound: clueRound + 1,
                    currentTurnIndex: 0,
                });
                setClueTimeLeft(CLUE_TIME);
            }
        } else {
            await setSharedState({ currentTurnIndex: nextTurn });
            setClueTimeLeft(CLUE_TIME);
        }
    };

    // ─── Start discussion (host) ───────────────────────────────
    const handleStartDiscussion = () => {
        setSharedState({ phase: 'DISCUSSION' });
        setDiscussionTimeLeft(DISCUSSION_TIME);
    };

    // ─── Start voting (host or auto) ──────────────────────────
    const handleStartVoting = () => {
        setSharedState({ phase: 'VOTING' });
        setVotingTimeLeft(VOTING_TIME);
    };

    // ─── Vote ─────────────────────────────────────────────────
    const handleVote = async (targetId: string) => {
        if (phase !== 'VOTING' || !currentPlayerId) return;
        if (votes[currentPlayerId]) return;

        const newVotes = { ...votes, [currentPlayerId]: targetId };
        await setSharedState({ votes: newVotes });

        if (Object.keys(newVotes).length >= players.length) {
            await setSharedState({ phase: 'RESULTS' });
        }
    };

    // ─── Play again ────────────────────────────────────────────
    const handlePlayAgain = () => {
        if (!isHost) return;
        setSharedState({
            phase: 'LOBBY',
            secretWord: '',
            imposterId: '',
            currentRevealIndex: 0,
            currentTurnIndex: 0,
            clueRound: 0,
            cluesGiven: {},
            votes: {},
        });
    };

    // ─── Get my secret word ────────────────────────────────────
    const getMySecretWord = () => {
        // For the player whose turn it is to see their word
        const playerAtReveal = players[currentRevealIndex];
        if (!playerAtReveal) return '';

        if (playerAtReveal.id === imposterId) {
            return null; // Imposter sees nothing
        }
        return secretWord;
    };

    // ─── Render: Lobby ─────────────────────────────────────────
    const renderLobby = () => (
        <div className="imposter-lobby">
            <div className="lobby-icon">🕵️</div>
            <h1 className="imposter-title">IMPOSTER</h1>
            <p className="subtitle">One player has no word. Find them!</p>

            <div className="players-list">
                {players.map(p => (
                    <span key={p.id} className="player-tag">
                        {p.isHost && '👑 '}{p.name}
                    </span>
                ))}
            </div>

            {isHost ? (
                players.length >= 3 ? (
                    <button className="imposter-btn start-game" onClick={handleStartGame}>
                        START GAME
                    </button>
                ) : (
                    <p className="waiting-msg">Need at least 3 players</p>
                )
            ) : (
                <p className="blink waiting-msg">Waiting for host...</p>
            )}

            <a href="/" className="exit-link">Exit to Hub</a>
        </div>
    );

    // ─── Render: Show Word (pass device) ───────────────────────
    const renderShowWord = () => {
        const player = players[currentRevealIndex];
        if (!player) return null;

        // In pass & play, this screen shows WHO should look (player at revealIndex)
        // Anyone can tap to advance (like passing the device)
        const myWord = player.id === imposterId ? null : secretWord;
        const isImposter = player.id === imposterId;

        return (
            <div className="word-reveal-screen">
                <div className="lobby-icon">📱</div>
                <h2 className="reveal-label">
                    Pass to: {player.name}
                </h2>
                <p className="reveal-hint">Hand the device privately</p>

                <button className="imposter-btn continue-btn" onClick={handleRevealNext}>
                    Show Word →
                </button>
            </div>
        );
    };

    // ─── Render: Give Clues (turn-based) ───────────────────────
    const renderGiveClues = () => {
        const currentPlayer = players[currentTurnIndex];
        const isMyTurn = currentPlayer?.id === currentPlayerId;

        // Show all clues so far (from previous rounds)
        const allClues = Object.entries(cluesGiven)
            .filter(([_, clue]) => clue !== '')
            .map(([playerId, clue]) => ({
                name: players.find(p => p.id === playerId)?.name ?? '?',
                clue,
            }));

        return (
            <div className="word-entry-screen">
                <div className="round-indicator">
                    Round {clueRound} of 3
                </div>

                <div className="timer-circle" style={{
                    '--progress': `${(clueTimeLeft / CLUE_TIME) * 100}%`
                } as React.CSSProperties}>
                    <span className="timer-number">{clueTimeLeft}</span>
                    <span className="timer-label">seconds</span>
                </div>

                <div className="the-word-display">
                    <span className="word-category">Your secret word</span>
                    <span className="main-word glow-purple">
                        {isPassPlay ? 'Look at screen' : (amIImposter ? '???' : secretWord)}
                    </span>
                </div>

                {/* Show all given clues */}
                {allClues.length > 0 && (
                    <div className="all-entries" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                        {allClues.map((item, i) => (
                            <div key={i} className="entry-row">
                                <span className="entry-player">{item.name}:</span>
                                <span className="entry-word">{item.clue}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Current player's turn indicator */}
                <div className="discussion-header" style={{ marginTop: '1rem' }}>
                    <h1 style={{ fontSize: '1.5rem' }}>
                        {isMyTurn ? "🎯 YOUR TURN" : `Waiting for ${currentPlayer?.name}...`}
                    </h1>
                </div>

                {/* Input for current player */}
                {isMyTurn && !myClueThisRound ? (
                    <form className="word-form" onSubmit={handleSubmitClue}>
                        <input
                            type="text"
                            className="word-input"
                            placeholder="Type ONE word clue..."
                            value={clueInput}
                            onChange={e => setClueInput(e.target.value)}
                            maxLength={30}
                            autoFocus
                        />
                        <div className="button-row">
                            <button type="button" className="pass-btn" onClick={handleSkipClue}>
                                PASS
                            </button>
                            <button type="submit" className="submit-btn" disabled={!clueInput.trim()}>
                                SAY IT
                            </button>
                        </div>
                    </form>
                ) : (
                    myClueThisRound && (
                        <p className="blink waiting-msg">Clue given! Waiting...</p>
                    )
                )}

                {/* Turn order indicator */}
                <div className="entries-summary">
                    {players.map((p, i) => {
                        const hasClue = cluesGiven[p.id] && cluesGiven[p.id] !== '';
                        return (
                            <span key={p.id} className={`player-status ${hasClue ? 'ready' : ''}`}>
                                {i === currentTurnIndex && '👉 '}{p.name} {hasClue ? '✓' : '...'}
                            </span>
                        );
                    })}
                </div>
            </div>
        );
    };

    // ─── Render: Discussion ────────────────────────────────────
    const renderDiscussion = () => {
        const allClues = Object.entries(cluesGiven).map(([playerId, clue]) => ({
            name: players.find(p => p.id === playerId)?.name ?? '?',
            clue: clue || '(passed)',
        }));

        return (
            <div className="discussion-screen">
                <div className="discussion-header">
                    <h1>💬 DISCUSSION</h1>
                    <p>Talk it out! Who seems suspicious?</p>
                </div>

                <div className="timer-bar-container">
                    <div
                        className="timer-bar-fill voting"
                        style={{ width: `${(discussionTimeLeft / DISCUSSION_TIME) * 100}%` }}
                    />
                </div>
                <span className="timer-text">{discussionTimeLeft}s</span>

                <div className="all-entries">
                    {allClues.map((item, i) => (
                        <div key={i} className="entry-row">
                            <span className="entry-player">{item.name}:</span>
                            <span className="entry-word">{item.clue}</span>
                        </div>
                    ))}
                </div>

                {isHost && (
                    <button className="imposter-btn vote-start-btn" onClick={handleStartVoting}>
                        START VOTING 🗳️
                    </button>
                )}
            </div>
        );
    };

    // ─── Render: Voting ─────────────────────────────────────────
    const renderVoting = () => {
        const myVote = votes[currentPlayerId ?? ''];

        return (
            <div className="voting-screen">
                <h1 className="phase-title glow-red">WHO'S THE IMPOSTER?</h1>

                <div className="timer-circle voting" style={{
                    '--progress': `${(votingTimeLeft / VOTING_TIME) * 100}%`
                } as React.CSSProperties}>
                    <span className="timer-number">{votingTimeLeft}</span>
                    <span className="timer-label">seconds</span>
                </div>

                <p className="vote-instruction">Tap to vote</p>

                <div className="target-grid">
                    {players.filter(p => p.id !== currentPlayerId).map(p => (
                        <button
                            key={p.id}
                            className={`target-card ${myVote === p.id ? 'selected' : ''}`}
                            onClick={() => handleVote(p.id)}
                            disabled={!!myVote}
                        >
                            <div className="avatar">🎭</div>
                            <span className="target-name">{p.name}</span>
                            {voteCounts[p.id] > 0 && (
                                <span className="vote-count-badge">{voteCounts[p.id]}</span>
                            )}
                        </button>
                    ))}
                </div>

                {myVote && <p className="blink waiting-msg">Vote cast!</p>}
            </div>
        );
    };

    // ─── Render: Results ─────────────────────────────────────────
    const renderResults = () => {
        let maxVotes = 0;
        let votedOutId: string | null = null;
        Object.entries(voteCounts).forEach(([id, count]) => {
            if (count > maxVotes) { maxVotes = count; votedOutId = id; }
        });

        const imposterPlayer = players.find(p => p.id === imposterId);
        const wasCaught = votedOutId === imposterId;

        return (
            <div className="results-screen">
                <div className={`result-banner ${wasCaught ? 'win' : 'lose'}`}>
                    {wasCaught ? (
                        <>
                            <h1 className="result-title">🎉 IMPOSTER CAUGHT!</h1>
                            <p>The crew wins!</p>
                        </>
                    ) : (
                        <>
                            <h1 className="result-title">😈 IMPOSTER ESCAPED!</h1>
                            <p>The imposter got away!</p>
                        </>
                    )}
                </div>

                <div className="reveal-card final">
                    <span className="reveal-label">The Secret Word Was</span>
                    <span className="the-word large">{secretWord}</span>

                    <div className="imposter-reveal">
                        <span>The Imposter was:</span>
                        <span className="imposter-name">
                            {imposterPlayer?.name}
                            {amIImposter && ' (YOU!)'}
                        </span>
                    </div>
                </div>

                <div className="votes-summary">
                    <h3>🗳️ Votes</h3>
                    {players.map(p => (
                        <div key={p.id} className="vote-row">
                            <span className="voter">{p.name}</span>
                            <span className="arrow">→</span>
                            <span className="voted-for">
                                {votes[p.id] ? players.find(pl => pl.id === votes[p.id])?.name : 'no vote'}
                            </span>
                        </div>
                    ))}
                </div>

                {isHost && (
                    <button className="imposter-btn start-game" onClick={handlePlayAgain}>
                        PLAY AGAIN
                    </button>
                )}

                <a href="/" className="exit-link">Exit to Hub</a>
            </div>
        );
    };

    // ─── No Players ────────────────────────────────────────────
    if (players.length === 0) {
        return (
            <div className="imposter-container state-lobby">
                <div className="imposter-lobby">
                    <h2>Please enter via Lobby</h2>
                    <a href="/lobby?game=imposter" className="imposter-btn start-game">Go to Lobby</a>
                </div>
            </div>
        );
    }

    // ─── Main Render ────────────────────────────────────────────
    return (
        <div className={`imposter-container state-${phase.toLowerCase().replace('_', '')}`}>
            {phase === 'LOBBY' && renderLobby()}
            {phase === 'SHOW_WORD' && renderShowWord()}
            {phase === 'GIVE_CLUES' && renderGiveClues()}
            {phase === 'DISCUSSION' && renderDiscussion()}
            {phase === 'VOTING' && renderVoting()}
            {phase === 'RESULTS' && renderResults()}
        </div>
    );
};

export default ImposterGame;