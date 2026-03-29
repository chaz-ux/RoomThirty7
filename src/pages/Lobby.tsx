import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMultiplayer } from '../context/MultiplayerContext';
import './Lobby.css';

const Lobby: React.FC = () => {
    const [searchParams] = useSearchParams();
    const gameId = searchParams.get('game');
    const navigate = useNavigate();
    
    const { roomCode, players, setMode, createOnlineRoom, joinOnlineRoom, addLocalPlayer, removeLocalPlayer, setSharedState, sharedState } = useMultiplayer();
    
    const [setupState, setSetupState] = useState<'MODE_SELECT' | 'LOCAL_SETUP' | 'ONLINE_SETUP' | 'ONLINE_HOST' | 'ONLINE_JOIN'>('MODE_SELECT');
    
    const [playerName, setPlayerName] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Monitor for host starting the game
    useEffect(() => {
        if (sharedState?.gameStarted && gameId) {
            navigate(`/${gameId}`);
        }
    }, [sharedState?.gameStarted, navigate, gameId]);

    const handleLocalStart = () => {
        if (players.length < 1) {
            setErrorMsg("Need at least 1 player!");
            return;
        }
        navigate(`/${gameId}`);
    };

    const handleHostStart = async () => {
        if (players.length < 1) {
            setErrorMsg("Need at least 1 player!");
            return;
        }
        await setSharedState({ gameStarted: true });
        navigate(`/${gameId}`);
    };

    const handleCreateRoom = async () => {
        if (!playerName) { setErrorMsg("Please enter your name"); return; }
        try {
            await createOnlineRoom(playerName);
            setSetupState('ONLINE_HOST');
            setErrorMsg('');
        } catch (e: any) {
            setErrorMsg(e.message || "Failed to create room.");
        }
    };

    const handleJoinRoom = async () => {
        if (!playerName || !joinCode) { setErrorMsg("Please enter name and room code"); return; }
        try {
            const success = await joinOnlineRoom(joinCode.toUpperCase(), playerName);
            if (success) {
                setSetupState('ONLINE_JOIN');
                setErrorMsg('');
            } else {
                setErrorMsg("Room not found!");
            }
        } catch (e: any) {
            setErrorMsg(e.message || "Failed to join room.");
        }
    };

    const renderModeSelect = () => (
        <div className="lobby-panel mode-select fade-in">
            <h2>Select Gameplay Mode</h2>
            <div className="mode-options">
                <button className="mode-btn btn-primary" onClick={() => { setMode('local'); setSetupState('LOCAL_SETUP'); }}>
                    🎮 Local Pass & Play
                    <small>One device, passed around</small>
                </button>
                <button className="mode-btn btn-secondary" onClick={() => setSetupState('ONLINE_SETUP')}>
                    🌐 Online Multiplayer
                    <small>Everyone on their own phone</small>
                </button>
            </div>
            <button className="back-link" onClick={() => navigate('/')}>&laquo; Back to Hub</button>
        </div>
    );

    const renderLocalSetup = () => (
        <div className="lobby-panel local-setup fade-in">
            <h2>Local Game Setup</h2>
            <div className="input-group">
                <input 
                    type="text" 
                    placeholder="Enter player name..." 
                    value={playerName} 
                    onChange={e => setPlayerName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && playerName) { addLocalPlayer(playerName); setPlayerName(''); } }}
                />
                <button className="btn-add" onClick={() => { if(playerName){ addLocalPlayer(playerName); setPlayerName('');} }}>Add</button>
            </div>
            <div className="players-list">
                {players.map(p => (
                    <div key={p.id} className="player-tag">
                        {p.name} <span className="remove" onClick={() => removeLocalPlayer(p.id)}>&times;</span>
                    </div>
                ))}
            </div>
            {errorMsg && <p className="error-text">{errorMsg}</p>}
            <button className="btn-primary start-btn" onClick={handleLocalStart}>START GAME</button>
            <button className="back-link" onClick={() => { setMode(null); setSetupState('MODE_SELECT'); }}>&laquo; Change Mode</button>
        </div>
    );

    const renderOnlineSetup = () => (
        <div className="lobby-panel online-setup fade-in">
            <h2>Online Multiplayer</h2>
            {errorMsg && <p className="error-text">{errorMsg}</p>}
            <div className="input-group column">
                <input type="text" placeholder="Your Name" value={playerName} onChange={e => setPlayerName(e.target.value)} />
            </div>
            <div className="split-actions">
                <div className="host-section">
                    <h3>Host a Game</h3>
                    <button className="btn-primary" onClick={handleCreateRoom}>Create Room</button>
                </div>
                <div className="join-section">
                    <h3>Join a Game</h3>
                    <input type="text" placeholder="4-Digit Code" maxLength={4} value={joinCode} onChange={e => setJoinCode(e.target.value)} />
                    <button className="btn-secondary" onClick={handleJoinRoom}>Join Room</button>
                </div>
            </div>
            <button className="back-link" onClick={() => setSetupState('MODE_SELECT')}>&laquo; Change Mode</button>
        </div>
    );

    const renderOnlineHost = () => (
        <div className="lobby-panel online-host fade-in">
            <h2>Room Code: <span className="highlight-code">{roomCode}</span></h2>
            <p>Tell your friends to join using this code.</p>
            <div className="players-list">
                {players.map(p => (
                    <div key={p.id} className="player-tag">{p.name} {p.isHost && '👑'}</div>
                ))}
            </div>
            {errorMsg && <p className="error-text">{errorMsg}</p>}
            <button className="btn-primary start-btn" onClick={handleHostStart}>START GAME</button>
        </div>
    );

    const renderOnlineJoin = () => (
        <div className="lobby-panel online-join fade-in">
            <h2>Joined Room: <span className="highlight-code">{roomCode}</span></h2>
            <p className="waiting-text blink">Waiting for Host to start...</p>
            <div className="players-list">
                {players.map(p => (
                    <div key={p.id} className="player-tag">{p.name} {p.isHost && '👑'}</div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="lobby-container container">
            <h1 className="game-title glow-blue">Configuring: {gameId?.toUpperCase()}</h1>
            
            {setupState === 'MODE_SELECT' && renderModeSelect()}
            {setupState === 'LOCAL_SETUP' && renderLocalSetup()}
            {setupState === 'ONLINE_SETUP' && renderOnlineSetup()}
            {setupState === 'ONLINE_HOST' && renderOnlineHost()}
            {setupState === 'ONLINE_JOIN' && renderOnlineJoin()}

        </div>
    );
};

export default Lobby;
