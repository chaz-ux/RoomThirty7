import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMultiplayer } from '../../context/MultiplayerContext';
import './Mafia.css';

// =============================================================================
// TYPES
// =============================================================================
type Phase = 'LOBBY' | 'NIGHT_REVEAL' | 'MAFIA_KNOW' | 'DAY_DISCUSS' | 'VOTE' | 'REVEAL' | 'GAME_OVER';
type Role = 'VILLAGER' | 'MAFIA';

interface MafiaSharedState {
    phase: Phase;
    roles: Record<string, Role>;
    deadPlayers: string[];
    votes: Record<string, string>;
    discussionTimeLeft: number;
    roundNumber: number;
    winner?: 'VILLAGERS' | 'MAFIA' | null;
    eliminatedThisRound?: string | null;
    mafiaKnowDone?: boolean;
    chatMessages?: { playerId: string; text: string; timestamp: number }[];
    showMafiaShatter?: boolean;
}

const DISCUSSION_TIME = 90;
const MAFIA_KNOW_TIME = 5000;
const NIGHT_REVEAL_TIME = 3000;

const getMafiaCount = (playerCount: number): number => {
    if (playerCount >= 8) return 3;
    if (playerCount >= 6) return 2;
    return 1;
};

// =============================================================================
// HELPERS
// =============================================================================
const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const vibrate = (pattern: number | number[]) => {
    if (navigator.vibrate) navigator.vibrate(pattern);
};

// =============================================================================
// COMPONENT
// =============================================================================
const MafiaGame: React.FC = () => {
    const { players, sharedState, setSharedState, isHost, currentPlayerId, mode } = useMultiplayer();
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const state: MafiaSharedState = {
        phase: 'LOBBY',
        roles: {},
        deadPlayers: [],
        votes: {},
        discussionTimeLeft: DISCUSSION_TIME,
        roundNumber: 1,
        winner: null,
        eliminatedThisRound: null,
        mafiaKnowDone: false,
        chatMessages: [],
        showMafiaShatter: false,
        ...sharedState,
    };

    const { phase, roles, deadPlayers, votes, discussionTimeLeft, roundNumber, winner, eliminatedThisRound, mafiaKnowDone, chatMessages = [], showMafiaShatter } = state;

    const currentPlayer = players.find(p => p.id === currentPlayerId);
    const myRole = roles[currentPlayerId || ''] || null;
    const isDead = deadPlayers.includes(currentPlayerId || '');
    const alivePlayers = players.filter(p => !deadPlayers.includes(p.id));
    const mafiaPlayers = players.filter(p => roles[p.id] === 'MAFIA' && !deadPlayers.includes(p.id));
    const isMafia = myRole === 'MAFIA';
    const livingMafiaCount = mafiaPlayers.length;
    const livingVillagerCount = alivePlayers.length - livingMafiaCount;

    // Chat input
    const [chatInput, setChatInput] = useState('');

    // =============================================================================
    // PHASE TRANSITIONS
    // =============================================================================
    const assignRoles = useCallback(() => {
        const count = players.length;
        const numMafia = getMafiaCount(count);
        const shuffled = shuffleArray(players);
        const newRoles: Record<string, Role> = {};
        shuffled.slice(0, numMafia).forEach(p => { newRoles[p.id] = 'MAFIA'; });
        shuffled.slice(numMafia).forEach(p => { newRoles[p.id] = 'VILLAGER'; });
        return newRoles;
    }, [players]);

    const startGame = async () => {
        if (!isHost) return;
        const newRoles = assignRoles();
        await setSharedState({
            phase: 'NIGHT_REVEAL',
            roles: newRoles,
            deadPlayers: [],
            votes: {},
            discussionTimeLeft: DISCUSSION_TIME,
            roundNumber: 1,
            winner: null,
            eliminatedThisRound: null,
            mafiaKnowDone: false,
            chatMessages: [],
            showMafiaShatter: false,
        });
    };

    // Host: advance from NIGHT_REVEAL → MAFIA_KNOW after dramatic delay
    useEffect(() => {
        if (phase !== 'NIGHT_REVEAL' || !isHost) return;
        if (mafiaKnowDone) return;

        const timer = setTimeout(async () => {
            await setSharedState({ mafiaKnowDone: true });
        }, 1000);

        return () => clearTimeout(timer);
    }, [phase, isHost, mafiaKnowDone, setSharedState]);

    // Auto-advance from NIGHT_REVEAL when mafiaKnowDone is true (player clicked)
    useEffect(() => {
        if (phase !== 'NIGHT_REVEAL' || !isHost || !mafiaKnowDone) return;

        const timer = setTimeout(async () => {
            await setSharedState({ phase: 'MAFIA_KNOW' });
        }, NIGHT_REVEAL_TIME);

        return () => clearTimeout(timer);
    }, [phase, isHost, mafiaKnowDone, setSharedState]);

    // Auto-advance from MAFIA_KNOW → DAY_DISCUSS after MAFIA_KNOW_TIME
    useEffect(() => {
        if (phase !== 'MAFIA_KNOW' || !isHost) return;

        const timer = setTimeout(async () => {
            await setSharedState({ phase: 'DAY_DISCUSS', discussionTimeLeft: DISCUSSION_TIME });
        }, MAFIA_KNOW_TIME);

        return () => clearTimeout(timer);
    }, [phase, isHost, setSharedState]);

    // Timer for day discussion
    useEffect(() => {
        if (phase !== 'DAY_DISCUSS' || !isHost) return;

        timerRef.current = setInterval(async () => {
            if (discussionTimeLeft <= 1) {
                clearInterval(timerRef.current!);
                await setSharedState({ phase: 'VOTE', discussionTimeLeft: 0 });
            } else {
                await setSharedState({ discussionTimeLeft: discussionTimeLeft - 1 });
            }
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [phase, isHost, discussionTimeLeft, setSharedState]);

    const startVoting = async () => {
        if (!isHost) return;
        if (timerRef.current) clearInterval(timerRef.current);
        await setSharedState({ phase: 'VOTE' });
    };

    const castVote = async (targetId: string) => {
        if (isDead || phase !== 'VOTE') return;
        await setSharedState({
            votes: { ...votes, [currentPlayerId || '']: targetId },
        });
    };

    const resolveVotes = async () => {
        if (!isHost) return;

        const voteCounts: Record<string, number> = {};
        Object.values(votes).forEach(targetId => {
            if (targetId) voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
        });

        let eliminatedId: string | null = null;
        let maxVotes = 0;
        Object.entries(voteCounts).forEach(([id, count]) => {
            if (count > maxVotes) {
                maxVotes = count;
                eliminatedId = id;
            }
        });

        // Check for tie
        if (eliminatedId) {
            const tied = Object.entries(voteCounts).filter(([, c]) => c === maxVotes).length > 1;
            if (tied) eliminatedId = null;
        }

        const newDead = eliminatedId ? [...deadPlayers, eliminatedId] : deadPlayers;

        // Win conditions
        const remainingMafia = players.filter(p => roles[p.id] === 'MAFIA' && !newDead.includes(p.id));
        const remainingVillagers = players.filter(p => roles[p.id] === 'VILLAGER' && !newDead.includes(p.id));

        let gameWinner: 'VILLAGERS' | 'MAFIA' | null = null;
        if (remainingMafia.length === 0) gameWinner = 'VILLAGERS';
        else if (remainingMafia.length >= remainingVillagers.length) gameWinner = 'MAFIA';

        if (eliminatedId) {
            vibrate([200, 100, 200, 100, 400]);
            // Show shatter effect
            await setSharedState({
                showMafiaShatter: true,
                eliminatedThisRound: eliminatedId
            });
        }

        await setSharedState({
            phase: 'REVEAL',
            deadPlayers: newDead,
            votes: {},
            winner: gameWinner,
        });
    };

    const advanceToNextRound = async () => {
        if (!isHost) return;
        await setSharedState({ showMafiaShatter: false });
        if (winner) {
            await setSharedState({ phase: 'GAME_OVER' });
        } else {
            await setSharedState({
                phase: 'NIGHT_REVEAL',
                roundNumber: roundNumber + 1,
                votes: {},
                eliminatedThisRound: null,
                discussionTimeLeft: DISCUSSION_TIME,
                mafiaKnowDone: false,
                chatMessages: [],
            });
        }
    };

    const resetGame = async () => {
        if (!isHost) return;
        await setSharedState({
            phase: 'LOBBY',
            roles: {},
            deadPlayers: [],
            votes: {},
            discussionTimeLeft: DISCUSSION_TIME,
            roundNumber: 1,
            winner: null,
            eliminatedThisRound: null,
            mafiaKnowDone: false,
            chatMessages: [],
            showMafiaShatter: false,
        });
    };

    // Chat
    const sendChatMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || !currentPlayerId) return;
        const newMessage = { playerId: currentPlayerId, text: chatInput.trim(), timestamp: Date.now() };
        await setSharedState({ chatMessages: [...chatMessages, newMessage] });
        setChatInput('');
    };

    // =============================================================================
    // RENDER HELPERS
    // =============================================================================
    const renderStars = () => (
        <div className="stars-layer">
            {Array.from({ length: 60 }).map((_, i) => (
                <div key={i} className="star" style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 60}%`,
                    animationDelay: `${Math.random() * 3}s`,
                }} />
            ))}
        </div>
    );

    const renderMoon = () => (
        <div className="moon">
            <div className="moon-crater" />
            <div className="moon-crater" />
            <div className="moon-crater" />
        </div>
    );

    const renderGraveyard = () => (
        <div className="graveyard-layer">
            {deadPlayers.map(deadId => {
                const player = players.find(p => p.id === deadId);
                const wasMafia = roles[deadId] === 'MAFIA';
                return (
                    <div key={deadId} className={`gravestone ${wasMafia ? 'mafia-stone' : 'villager-stone'}`}>
                        <div className="tombstone-icon">{wasMafia ? '💀' : '⚔️'}</div>
                        <div className="tombstone-name">{player?.name}</div>
                        <div className="tombstone-role">{wasMafia ? 'MAFIA' : 'VILLAGER'}</div>
                    </div>
                );
            })}
        </div>
    );

    // Shatter animation effect for voted out players
    const renderShatterEffect = () => {
        if (!showMafiaShatter || !eliminatedThisRound) return null;

        const eliminated = players.find(p => p.id === eliminatedThisRound);
        const wasMafia = roles[eliminatedThisRound] === 'MAFIA';

        return (
            <div className="shatter-overlay">
                <div className="shatter-content">
                    <h1 className="shatter-title glow-red">SHATTERED!</h1>
                    <div className="shatter-icon">💔</div>
                    <p className="shatter-name">{eliminated?.name}</p>
                    <p className="shatter-role">{wasMafia ? 'MAFIA ELIMINATED' : 'VILLAGER ELIMINATED'}</p>
                </div>
            </div>
        );
    };

    const renderDeadOverlay = () => (
        <div className="death-overlay">
            <div className="skull-icon">💀</div>
            <h1 className="blood-text">YOU DIED</h1>
            <p>You are now watching from the afterlife.</p>
        </div>
    );

    // =============================================================================
    // PHASE RENDER
    // =============================================================================
    const renderLobby = () => (
        <div className="mafia-lobby static-layer">
            <div className="lobby-icon">🎭</div>
            <h1 className="mafia-title glow-red">MAFIA</h1>
            <p className="lobby-subtitle">Trust no one. Suspect everyone.</p>

            <div className="player-roster">
                {players.map(p => (
                    <div key={p.id} className="roster-player">
                        <span className="roster-name">{p.name}</span>
                        {p.isHost && <span className="roster-host">👑</span>}
                    </div>
                ))}
            </div>

            <div className="role-preview">
                <div className="role-preview-item">
                    <span className="role-preview-count" style={{ color: '#ff3366' }}>{getMafiaCount(players.length)}</span>
                    <span className="role-preview-label">Mafia</span>
                </div>
                <div className="role-preview-item">
                    <span className="role-preview-count" style={{ color: '#ffcc00' }}>{players.length - getMafiaCount(players.length)}</span>
                    <span className="role-preview-label">Villagers</span>
                </div>
            </div>

            {isHost ? (
                <button className="mafia-btn hero-btn" onClick={startGame} disabled={players.length < 4}>
                    {players.length < 4 ? `Need ${4 - players.length} more players` : 'START GAME'}
                </button>
            ) : (
                <div className="waiting-message"><span className="blink">⏳ Waiting for host...</span></div>
            )}

            <a href="/" className="exit-link">❌ Leave Game</a>
        </div>
    );

    const renderNightReveal = () => (
        <div className="night-phase static-layer">
            {renderStars()}
            {renderMoon()}

            <div className="night-content">
                <h1 className="phase-title glow-blue">🌙 NIGHT FALLS</h1>
                <p className="night-instruction">
                    {isHost ? 'Tell everyone to close their eyes...' : 'Close your eyes. The Mafia are waking...'}
                </p>

                {isHost && !mafiaKnowDone && (
                    <button className="mafia-btn hero-btn" onClick={() => setSharedState({ mafiaKnowDone: true })}>
                        👁️ MAFIA IDENTIFY
                    </button>
                )}
            </div>
        </div>
    );

    const renderMafiaKnow = () => (
        <div className="mafia-know-phase static-layer">
            {renderStars()}

            <div className="night-content">
                <h1 className="phase-title glow-red">🎭 MAFIA AWAKEN</h1>
                <p className="night-instruction">
                    Mafia, open your eyes and acknowledge each other.
                </p>

                {isMafia && (
                    <div className="mafia-seen-section">
                        <h2 className="glow-red">YOUR FELLOW MAFIA ({mafiaPlayers.length})</h2>
                        <div className="mafia-list">
                            {mafiaPlayers.map((p, idx) => (
                                <div key={p.id} className="mafia-member-card" style={{ animationDelay: `${idx * 0.2}s` }}>
                                    <span className="mafia-member-icon">🎭</span>
                                    <span className="mafia-member-name">{p.name}</span>
                                </div>
                            ))}
                        </div>
                        {livingMafiaCount > 1 && (
                            <p className="mafia-hint glow-blue">You can see all {livingMafiaCount} Mafia members!</p>
                        )}
                    </div>
                )}

                {!isMafia && !isDead && (
                    <div className="villager-blind-section">
                        <p>👁️ You see nothing...</p>
                        <p className="villager-hint">Villagers keep your eyes closed</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderDayDiscuss = () => (
        <div className="day-phase static-layer">
            <div className="sun-container">
                <div className="sun-rays" />
                <div className="sun" />
            </div>

            <div className="day-content">
                <h1 className="phase-title glow-yellow">☀️ DAY {roundNumber}</h1>

                <div className="timer-display">
                    <div className="timer-bar">
                        <div className="timer-fill" style={{ width: `${(discussionTimeLeft / DISCUSSION_TIME) * 100}%` }} />
                    </div>
                    <span className="timer-text">{discussionTimeLeft}s</span>
                </div>

                <p className="day-instruction">Discuss! Vote to eliminate a suspect.</p>

                <div className="alive-players-grid">
                    {alivePlayers.map(p => {
                        const isTargeted = votes[currentPlayerId || ''] === p.id;
                        const voteCount = Object.values(votes).filter(v => v === p.id).length;
                        return (
                            <div key={p.id} className={`player-card ${isTargeted ? 'player-targeted' : ''}`}>
                                <div className="player-avatar">👤</div>
                                <div className="player-name">{p.name}</div>
                                {voteCount > 0 && <div className="vote-count">{voteCount}</div>}
                            </div>
                        );
                    })}
                </div>

                {isHost && (
                    <button className="mafia-btn admin-btn" onClick={startVoting}>
                        ⏭️ SKIP TO VOTE
                    </button>
                )}
            </div>

            {/* Chat for online mode */}
            {mode === 'online' && !isDead && (
                <div className="game-chat">
                    <form className="chat-form" onSubmit={sendChatMessage}>
                        <input
                            type="text"
                            className="chat-input"
                            placeholder="Say something..."
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                        />
                        <button type="submit" className="chat-send">Send</button>
                    </form>
                    <div className="chat-messages">
                        {chatMessages.slice(-10).map((msg, i) => {
                            const sender = players.find(p => p.id === msg.playerId);
                            return (
                                <div key={i} className="chat-msg">
                                    <span className="chat-name">{sender?.name}:</span>
                                    <span className="chat-text">{msg.text}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );

    const renderVote = () => (
        <div className="vote-phase static-layer">
            <h1 className="phase-title glow-yellow">👁️ VOTE</h1>
            <p className="vote-instruction">
                {votes[currentPlayerId || ''] ? '✓ Vote cast! Waiting...' : 'Tap a player to eliminate.'}
            </p>

            <div className="target-grid">
                {alivePlayers.filter(p => p.id !== currentPlayerId).map(p => (
                    <button
                        key={p.id}
                        className={`target-card ${votes[currentPlayerId || ''] === p.id ? 'selected' : ''}`}
                        onClick={() => castVote(p.id)}
                        disabled={!!votes[currentPlayerId || '']}
                    >
                        <div className="avatar">👤</div>
                        <span className="target-name">{p.name}</span>
                        {votes[currentPlayerId || ''] === p.id && <div className="vote-badge">✓</div>}
                        {Object.values(votes).filter(v => v === p.id).length > 0 && (
                            <div className="vote-count-badge">{Object.values(votes).filter(v => v === p.id).length}</div>
                        )}
                    </button>
                ))}
            </div>

            {isHost && (
                <button className="mafia-btn admin-btn" onClick={resolveVotes}>
                    ⚔️ RESOLVE VOTES
                </button>
            )}
        </div>
    );

    const renderReveal = () => {
        const eliminated = players.find(p => p.id === eliminatedThisRound);
        const wasMafia = eliminated ? roles[eliminated.id] === 'MAFIA' : false;

        return (
            <div className="reveal-phase static-layer">
                <div className="reveal-content">
                    {eliminated ? (
                        <>
                            <h1 className={`reveal-title ${wasMafia ? 'glow-red' : 'glow-yellow'}`}>
                                {wasMafia ? '🎭 MAFIA ELIMINATED' : '⚔️ VILLAGER ELIMINATED'}
                            </h1>
                            <div className="eliminated-card">
                                <div className="eliminated-icon">{wasMafia ? '🎭' : '👤'}</div>
                                <div className="eliminated-name">{eliminated.name}</div>
                                <div className={`eliminated-role role-${wasMafia ? 'mafia' : 'villager'}`}>{wasMafia ? 'MAFIA' : 'VILLAGER'}</div>
                            </div>
                            <div className="shatter-effect">
                                <span className="shatter-piece">💔</span>
                                <span className="shatter-piece">💔</span>
                                <span className="shatter-piece">💔</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <h1 className="reveal-title glow-yellow">🤝 TIE — NO ELIMINATION</h1>
                            <p className="tie-message">The votes are evenly split. Nobody dies tonight.</p>
                        </>
                    )}

                    {isHost && (
                        <button className="mafia-btn hero-btn" onClick={advanceToNextRound}>
                            {winner ? '🏆 GAME OVER' : '➡️ NEXT ROUND'}
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const renderGameOver = () => (
        <div className="gameover-phase static-layer">
            <div className={`winner-banner ${winner === 'VILLAGERS' ? 'villagers-win' : 'mafia-win'}`}>
                <h1 className="winner-title">
                    {winner === 'VILLAGERS' ? '☀️ VILLAGERS WIN!' : '🎭 MAFIA WINS!'}
                </h1>
                <p className="winner-subtitle">
                    {winner === 'VILLAGERS' ? 'All Mafia have been eliminated!' : 'The Mafia controls the town.'}
                </p>
            </div>

            <div className="final-stats">
                <h2>Final Roles</h2>
                <div className="final-roles-list">
                    {players.map(p => (
                        <div key={p.id} className={`final-role-card ${deadPlayers.includes(p.id) ? 'final-dead' : ''}`}>
                            <span className="final-role-icon">{roles[p.id] === 'MAFIA' ? '🎭' : '👤'}</span>
                            <span className="final-role-name">{p.name}</span>
                            <span className="final-role-label">{roles[p.id]}</span>
                            {deadPlayers.includes(p.id) && <span className="final-dead-badge">DEAD</span>}
                        </div>
                    ))}
                </div>
            </div>

            {isHost && <button className="mafia-btn hero-btn" onClick={resetGame}>🔄 PLAY AGAIN</button>}
            <a href="/" className="exit-link">❌ Exit to Lobby</a>
        </div>
    );

    // =============================================================================
    // MAIN RENDER
    // =============================================================================
    if (players.length === 0) {
        return (
            <div className="mafia-container">
                <div className="empty-lobby static-layer">
                    <h2>No players in this game.</h2>
                    <a href="/" className="mafia-btn hero-btn">Return to Lobby</a>
                </div>
            </div>
        );
    }

    return (
        <div className={`mafia-container state-${phase.toLowerCase()}`}>
            {deadPlayers.length > 0 && renderGraveyard()}
            {isDead && phase !== 'LOBBY' && phase !== 'GAME_OVER' && renderDeadOverlay()}
            {showMafiaShatter && renderShatterEffect()}

            {phase === 'LOBBY' && renderLobby()}
            {phase === 'NIGHT_REVEAL' && !mafiaKnowDone && renderNightReveal()}
            {phase === 'MAFIA_KNOW' && renderMafiaKnow()}
            {phase === 'DAY_DISCUSS' && renderDayDiscuss()}
            {phase === 'VOTE' && renderVote()}
            {phase === 'REVEAL' && renderReveal()}
            {phase === 'GAME_OVER' && renderGameOver()}
        </div>
    );
};

export default MafiaGame;
